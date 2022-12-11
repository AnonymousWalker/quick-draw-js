const quickDraw = require('quickdraw.js');


const objects = ['circle', 'triangle', 'square', 'hexagon', 'star'];
objects.forEach(o => quickDraw.import(o, 5000))

