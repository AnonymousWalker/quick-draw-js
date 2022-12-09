const quickDraw = require('quickdraw.js');


const tasks = []
const objects = ['circle', 'triangle', 'square', 'star'];
objects.forEach(o => { 
    tasks.push(quickDraw.import(o, 2000))
})

Promise.all(tasks).then(() => console.log("Import complete"))

