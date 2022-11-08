function getPixelData() {
    const canvas = document.querySelector('.js-paint');
    const imgData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;
    const pxArray = [];
    for (let i = 0, j = 0; i + 3 < pixels.length; i++) {
        pxArray[j] = pixels[i*4 + 3];
        j++;
    }

    console.log(pixels);
    console.log(pxArray);

    check(pixels)
}

function check(pixels) {
    fetch('/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(pixels)
    })
    .then(res => res.json())
    .then(category => console.log(category));
}