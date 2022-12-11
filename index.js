const quickDraw = require('quickdraw.js');
const net = require('neataptic');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

// Setup neural network
const SAMPLES_PER_CATERGORY = 5000;
const objects = ['circle', 'triangle', 'square', 'star'];
const dataSet = quickDraw.set(objects.length * SAMPLES_PER_CATERGORY, objects);

const network = new net.architect.Perceptron(dataSet.input, 30, dataSet.output);
network.train(dataSet.set, {
  iterations: 100,
  log: 1,
  rate: 0.05,
  error: 0.01
});

const hostname = '127.0.0.1';
const port = 5000;
const app = express();
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static('public'));

app.get('/', (_, res) => {
    const html = fs.readFileSync('./public/drawing-canvas.html');
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
});

// query received
app.post('/', (req, res) => {
    const input = req.body;
    const output = network.activate(input);
    const outputMap = {}
    for (i = 0; i < objects.length; i++) {
        outputMap[objects[i]] = output[i].toFixed(5);
    }

    res.send(JSON.stringify(outputMap,null, 2));
});

app.get('/fetchimage', (req, res) =>{
    let i = 0;
    if (req.query['i'] != undefined) {
        i = req.query['i'];
    }
    const inOutObj = dataSet.set[i]
    res.send(JSON.stringify(inOutObj))
})

app.listen(port, () => {
    console.log(`Example app listening: http://${hostname}:${port}`)
});
