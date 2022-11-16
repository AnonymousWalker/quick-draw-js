function augSamples(samples, width, height) {
    let augSamples = [];
    samples.forEach(s => 
        augSamples = augSamples.concat(augmentSample(s, width, height))
    )
    return augSamples;
}

function augmentSample(sample, w, h) {
    const pxArray = sample['input']
    const bitmapMatrix = _convertPixelsToMatrix(pxArray, w, h)
    const m1 = _rotateMatrix(bitmapMatrix)
    const m2 = _rotateMatrix(m1)
    const m3 = _rotateMatrix(m2)

    
console.log(m1)
console.log(m2)

    const output = sample['output']
    return [
        {
            input: _convertMatrixToPixels(m1),
            output: output
        },
        {
            input: _convertMatrixToPixels(m2),
            output: output
        },
        {
            input: _convertMatrixToPixels(m3),
            output: output
        }
    ]
}

function _convertPixelsToMatrix (pixels, w, h) {
    const bitmap = [];
    for (let i = 0; i < h; i++) {
        bitmap[i] = [];

        for (let j = 0; j < w; j++) {
            bitmap[i][j] = pixels[i * w + j % w]
        }
    }
    
    return bitmap
}

function _convertMatrixToPixels(matrix) {
    const pixels = [];
    matrix.forEach(
        (row, i) => row.forEach((_, j) => pixels.push(matrix[i][j]))
    )
    return pixels;
}

function _rotateMatrix(matrix) {
    return matrix.map((row, i) =>
          row.map((_, j) => matrix[matrix.length - 1 - j][i])
        );
}