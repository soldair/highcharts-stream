highcharts-stream
=================

streaming interface to highcharts-browserify. stream.pipe(chart) === happy

```js
var through = require('through');
var chartStream = require('highcharts-stream');

var stream = through(function(xy){
  this.queue(xy);
});

// add graph container.
var container = document.createElement('div');
document.body.appendChild(container);

stream.pipe(chartStream(container,{
  pointLimit:20,// extra option only for highcharts-stream
  //points will start to get shifted if more than point limit are added
}));


setInterval(function(){
  stream.write([Date.now(),Math.floor(Math.random()*1000)]);
},1000);

```


other cool stuff
================

### update points already on the graph

you just have to add id or name to your points to update points already on the graph.

```js
source.pipe(through(function(data){
  this.queue({
    name:data.id,
    point:{
      id:data.id', // if you add id this will update the point with that id with the new x and y value
      x:data.time,
      y:1
    }
  });
})).pipe(chart);

```
