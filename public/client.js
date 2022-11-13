let chart = null;

document.addEventListener("DOMContentLoaded", () => {
    setupCanvas()
    document.querySelector("#reset").addEventListener('click', clearCanvas)
    document.querySelector('#get-img-btn').addEventListener('click', getImage)
});


function setupCanvas() {

    const paintCanvas = document.querySelector('.js-paint');
    const context = paintCanvas.getContext('2d');
    context.lineCap = 'round';

    const colorPicker = document.querySelector('.js-color-picker');

    colorPicker.addEventListener('change', event => {
        context.strokeStyle = event.target.value;
    });

    const lineWidthRange = document.querySelector('.js-line-range');
    const lineWidthLabel = document.querySelector('.js-range-value');

    lineWidthRange.addEventListener('input', event => {
        const width = event.target.value;
        lineWidthLabel.innerHTML = width;
        context.lineWidth = width;
    });

    let x = 0, y = 0;
    let isMouseDown = false;

    const stopDrawing = () => {
        isMouseDown = false;
    }
    const startDrawing = event => {
        isMouseDown = true;
        [x, y] = [event.offsetX, event.offsetY];
    }
    const drawLine = event => {
        if (isMouseDown) {
            const newX = event.offsetX;
            const newY = event.offsetY;
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(newX, newY);
            context.stroke();
            //[x, y] = [newX, newY];
            x = newX;
            y = newY;
        }
    }

    paintCanvas.addEventListener('mousedown', startDrawing);
    paintCanvas.addEventListener('mousemove', drawLine);
    paintCanvas.addEventListener('mouseup', () => { stopDrawing(); submit() });
    paintCanvas.addEventListener('mouseout', stopDrawing);
}

function clearCanvas() {
    const canvas = document.querySelector('.js-paint');
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    if (chart != null) chart.destroy();
}

function submit() {
    const canvas = document.querySelector(".js-paint");
    const outputCanvas = document.querySelector('.output-canvas');

    // ROI - region of interest
    let src = cv.imread(canvas);
    let dst = new cv.Mat();

    const cropPosition = computeCropArea();
    let rect = new cv.Rect(
        cropPosition.west,
        cropPosition.north,
        cropPosition.east - cropPosition.west,
        cropPosition.south - cropPosition.north
    );
    dst = src.roi(rect);
    cv.imshow(outputCanvas, dst);

    src.delete();
    dst.delete();

    // resize image
    src = cv.imread(outputCanvas);
    dst = new cv.Mat();

    let dsize = new cv.Size(28, 28);
    cv.resize(src, dst, dsize, 0, 0, cv.INTER_AREA);
    cv.imshow(outputCanvas, dst);

    const pixels = getPixelData(outputCanvas);
    _evaluate(pixels);
}

function getPixelData(canvas) {
    const imgData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;

    const dimension = canvas.width * canvas.height;
    const pxArray = new Float32Array(dimension);
    for (let i = 0; i < dimension; i++) {
        pxArray[i] = Math.ceil(pixels[i * 4 + 3] / 255);
    }

    return pxArray;
}

function _evaluate(pixels) {
    fetch('/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(Array.from(pixels))
    })
        .then(res => res.json())
        .then(categories => {
            document.querySelector("#output-category").innerHTML = JSON.stringify(categories, null, 2)
            _renderChart(categories)
        });
}

function getImage(e) {
    e.preventDefault();
    const idElement = document.querySelector("#image-id");
    const i = idElement.value;
    idElement.value++;
    idElement.focus();

    fetch('/fetchimage?i=' + i)
        .then(res => res.json())
        .then(data => {
            const input = data['input'];
            const output = data['output'];
            const context = document.querySelector(".output-canvas").getContext('2d');
            const imgData = context.createImageData(28, 28);

            for (let i = 0, j = 0; i < input.length; i++, j += 4) {
                imgData.data[j] = 0;
                imgData.data[j + 1] = 0;
                imgData.data[j + 2] = 0;
                imgData.data[j + 3] = input[i] * 255;
            }
            context.putImageData(imgData, 0, 0);
        })
}

function computeCropArea() {
    const canvas = document.querySelector(".js-paint");
    const context = canvas.getContext("2d");
    const h = canvas.height;
    const w = canvas.width;

    const imgData = context.getImageData(0, 0, w, h);
    let north = h;
    let west = w;
    let south = -1;
    let east = -1;

    const dimension = w * h;
    const pxArray = new Float32Array(dimension);
    for (let i = 0; i < dimension; i++) {
        pxArray[i] = imgData.data[i * 4 + 3] / 255;
    }

    for (let i = 0; i < dimension; i++) {
        if (pxArray[i] == 0) continue;

        let pos = {
            x: i % w,
            y: i / w
        };

        if (pos.y < north) {
            north = pos.y;
        }
        if (pos.x < west) {
            west = pos.x;
        }
        if (pos.y > south) {
            south = pos.y;
        }
        if (pos.x > east) {
            east = pos.x;
        }
    }

    return {
        north: north,
        west: west,
        south: south,
        east: east
    }
}

function _renderChart(categories) {
    const names = Object.keys(categories);
    const rates = Object.values(categories)

    if (chart != null) {
        chart.destroy();
    }

    chart = new Chart("output-chart", {
        type: "bar",
        data: {
            labels: names,
            datasets: [{
                backgroundColor: 'green',
                data: rates
            }]
        },
        options: {
            legend: { display: false },
            title: { display: false }
        }
    });
}



function resizeImage(imgToResize, resizingFactor = 0.5) {
    const canvas = document.querySelector(".output-canvas");
    const context = canvas.getContext("2d");

    const newHeight = 28;
    const newWidth = 28;

    // canvas.width = newWidth;
    // canvas.height = newHeight;

    context.drawImage(
        imgToResize,
        0,
        0,
        newWidth,
        newHeight
    );

    const imgData = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;
    const pxArray = [];

    const dimension = canvas.width * canvas.height;
    for (let i = 0, j = 0; j < dimension; i++) {
        pxArray[j] = pixels[i * 4 + 3];
        j++;
    }
    return pxArray;
}

