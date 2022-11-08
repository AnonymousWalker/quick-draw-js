const quickDraw = require('quickdraw.js');
const net = require('neataptic');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const categories = require('quickdraw.js/src/categories');



// Setup neural network
const objects = ['car', 'airplane']
const dataSet = quickDraw.set(100, objects);
const network = new net.architect.Perceptron(dataSet.input, 20, dataSet.output);

network.train(dataSet.set, {
  iterations: 100,
  log: 1,
  rate: 0.1
});

// setup server

const hostname = '127.0.0.1';
const port = 5000;
const app = express();
app.use(bodyParser.json({ limit: '10mb' }));


app.get('/', (req, res) => {
    const html = fs.readFileSync('./public/drawing-canvas.html');
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
});

// query received
app.post('/', (req, res) => {
    const input = req.body;
    const result = network.activate(input);
    res.send(result);
});

app.listen(port, () => {
    console.log(`Example app listening: http://${hostname}:${port}`)
});


// const input = dataSet.set[0]['input'];
// let result = network.activate(input.slice(10));

// console.log("result: ");
// console.log(result);
// fs.writeFileSync("D:\\School\\ML\\quickdraw\\try_quick_draw\\output.json", JSON.stringify(input));

// console.log(dataSet.set[0]['input'].length);