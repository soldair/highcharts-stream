var through = require('through');
// eff it
var jquery = require('jquery-browserify');
var Highcharts = require('highcharts-browserify');

// by default its a spline / line chart with irregular data points 
// but you can overload everything in options as its deep extended

module.exports = function(selector,options){ 

  var redrawTime = 0;
  var redrawTimeout = 200;

  // should be based on timespan of y actually.
  var pointLimit = false
  , dirty = function fn(){
    if(fn.timer) return;
    
    fn.timer = setTimeout(function(){
      var t = Date.now();
      s.chart.redraw();
      redrawTime = Date.now()-t;
      delete fn.timer;
    },redrawTimeout+redrawTime);   
  }
  ;

  if(options.pointLimit) pointLimit = options.pointLimit;

  var seriesMap = {};
  var lastTime;
  var s = through(function(data){
    // {series:0,point:[x,y]}
    // TODO test moving lines above and below each other for deterministic color rendering.

    var chart = this.chart;
    var series = chart.get(data.id||data.name)

    if(!series) series = chart.series[data.series];
    if(!series) series = chart.series[seriesMap[data.name]];
    if(!series) {
      series = chart.addSeries({
        id:data.id||data.name,
        name:data.name,
        data:[data.point]
      },false);
      seriesMap[data.name] = chart.series.length-1;

    } else {
      //addPoint (Object options, [Boolean redraw], [Boolean shift], [Mixed animation])

      var shift = false;
      if(pointLimit && pointLimit == series.data.length){
        shift = true;
      }
      if(data.point.id){
        var pointo = chart.get(data.point.id);
        if(pointo) {
          //console.log('removing point by id for update',data.point.id);
          pointo.remove(false);
        }
      }
      series.addPoint(data.point,false,shift);
    }

    dirty();
  });

  var opts = {
    chart: {
      type: 'spline'
    },
    xAxis: {
      type: 'datetime',
      dateTimeLabelFormats: { 
          month: '%e. %b',
          year: '%b'
      }
    },
    yAxis: {
      //title: {
      //    text: 'y'
      //},
      min: 0
    },
    tooltip: {
      formatter: function() {
        return '<b>'+ this.series.name +'</b><br/>'+this.y;
        //Highcharts.dateFormat('%e. %b', this.x) +': '+ this.y +' m';
      }
    },
    credits : {
      enabled : false
    },
    series: [
      // {name:,data:[x,y]}
    ]
  };

  /*
  title: {
    text: 'lines'
  },
  subtitle: {
    text: 'Irregular time data in Highcharts JS'
  },
  */

  // deep extend options.
  $.extend(true,opts,options||{});

  opts.series.forEach(function(line,i){
    seriesMap[line.name] = i;
  });

  $(selector).highcharts(opts); 
  var index = $(selector).data('highchartsChart');
  s.chart = Highcharts.charts[index];


  return s;
}

// convenience because you will have to use through to transform points for the series!
module.exports.through = through;

// for bundle.js
if(process.browser) window.highchartsStream = module.exports;
