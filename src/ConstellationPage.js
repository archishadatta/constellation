
import React, { useEffect } from 'react';
import * as d3 from 'd3';
// import * as d3 from 'd3-geo';


function ConstellationPage() {
const width = 960;
const height = 500;
  useEffect(() => {
    

    var projection = d3.geoStereographic().scale(600)
    var fixedProjection = d3.geoStereographic().scale(600).rotate([0, 0])

    var canvas = d3.select("body").append("canvas")
        .attr("width", width)
        .attr("height", height)

    var c = canvas.node().getContext("2d")
    function getRetinaRatio() {
      var devicePixelRatio = window.devicePixelRatio || 1
      var backingStoreRatio = c.webkitBackingStorePixelRatio ||
          c.mozBackingStorePixelRatio ||
          c.msBackingStorePixelRatio ||
          c.oBackingStorePixelRatio ||
          c.backingStorePixelRatio || 1
  
      return devicePixelRatio / backingStoreRatio
  }
  
  var ratio = getRetinaRatio()
  var scaledWidth = width * ratio
  var scaledHeight = height * ratio
  
  canvas.node().width = scaledWidth
  canvas.node().height = scaledHeight
  canvas
      .style("width", width + 'px')
      .style("height", height + 'px')
  
  c.scale(ratio, ratio)
  
  var path = d3.geoPath()
      .projection(projection)
      .context(c)
  
  var graticule = d3.geoGraticule()
      .step([15, 15])
  
  var bgRGB = d3.rgb('#113')
  
  d3.json("/starCatalog.json", function(error, data) {
    var geoConstellations = [];
    var starsMag = [];
  
    // Filter stars with mag < 6
    data = data.filter(function(star) {
      if (star.MAG < 6) starsMag.push(star.MAG);
      return star.MAG < 6;
    });
  
    var minMaxMag = d3.extent(starsMag);
  
    var opacityScale = d3.scaleLinear()
      .domain(minMaxMag)
      .range([1, 0.4]);
  
    var magScale = d3.scaleLinear()
      .domain(minMaxMag)
      .range([2.7, 1.7]);
  
    var geometries = data.map(function(star) {
      var rgb = d3.rgb('#fff'); // Provide a default color, or use star.color if available
      var rgba = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + opacityScale(star.MAG) + ')';
  
      return {
        type: 'Point',
        coordinates: [+star.RA, +star.DEC], // Convert to numbers
        properties: {
          color: rgba,
          mag: magScale(star.MAG)
        }
      };
    });
  
    geoConstellations.push({
      type: 'Feature',
      geometry: {
        type: 'GeometryCollection',
        geometries: geometries
      },
      properties: {
        name: 'Custom Constellation',
        // Add other properties as needed
        center: d3.geoCentroid({
          type: 'GeometryCollection',
          geometries: geometries
        })
      }
    });
  
    draw(geoConstellations, [30, -70]);
  
    // var raStart, decStart;
    // function getStart() {
    //   raStart = projection.invert(d3.pointer(this))[0];
    //   decStart = fixedProjection.invert(d3.pointer(this))[1];
    // }
  
    // function move() {
    //   var raFinish = projection.invert(d3.pointer(this))[0];
    //   var decFinish = fixedProjection.invert(d3.pointer(this))[1];
  
    //   var raRotate = raFinish - raStart;
    //   var decRotate = decFinish - decStart;
  
    //   var rotate = projection.rotate();
    //   var newCenter = [rotate[0] + raRotate, rotate[1] + decRotate];
  
    //   draw(geoConstellations, newCenter);
  
    //   decStart = fixedProjection.invert(d3.pointer(this))[1];
    // }
  
    // var drag = d3.drag()
    //   .on("dragstart", getStart)
    //   .on("drag", move);
  
    // canvas.call(drag);
  });
  
  function makeRadialGradient(x, y, r, color) {
      var radialgradient = c.createRadialGradient(x, y, 0, x, y, r)
      radialgradient.addColorStop(0.2, color)
      radialgradient.addColorStop(0.5,'rgba(' + bgRGB.r + ',' + bgRGB.g + ',' + bgRGB.b + ',0)')
      radialgradient.addColorStop(0.5,'rgba(' + bgRGB.r + ',' + bgRGB.g + ',' + bgRGB.b + ',1)')
      radialgradient.addColorStop(1,'rgba(' + bgRGB.r + ',' + bgRGB.g + ',' + bgRGB.b + ',0)')
      c.fillStyle = radialgradient
  }
  
  function distance(p) {
      var center = [width / 2, height / 2]
      var xRotate = center[0] - p[0]
      var yRotate = center[1] - p[1]
  
      return Math.sqrt(Math.pow(xRotate, 2) + Math.pow(yRotate, 2))
  }
  function draw(constellations, center) {
  
      var min = 0,
          minDistance = distance(projection(constellations[0].properties.center))
  
      if (center) projection.rotate(center)
  
      c.clearRect(0, 0, width, height)
      c.strokeStyle = "#fff"
      c.lineWidth = .1
      c.beginPath();
      path(graticule());
      c.stroke()
      c.lineWidth = .4
      c.beginPath();
      path({type: "LineString", coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]]});
      c.stroke()
      c.strokeStyle = "#f2f237"
      c.beginPath();
      path({type: "LineString", coordinates: [[-180, 0], [-90, 23.26], [0, 0], [90, -23.26], [180, 0]]});
      c.stroke()
  
      constellations.forEach(function(constellation, i) {
          var currentDistance = distance(projection(constellations[i].properties.center))
          if (currentDistance < minDistance) {
              min = i
              minDistance = currentDistance
          }
          constellation.geometry.geometries.forEach(function(geo) {
              if (geo.type == 'Point') {
                  makeRadialGradient(
                      projection(geo.coordinates)[0],
                      projection(geo.coordinates)[1],
                      geo.properties.mag,
                      geo.properties.color)
                  path.pointRadius([geo.properties.mag])
                  c.beginPath(); path(geo); c.fill();
              } else if (geo.type == 'LineString') {
                  c.strokeStyle = '#000'
                  c.beginPath(); path(geo); c.stroke()
              } else if (geo.type == 'MultiLineString') {
                  c.strokeStyle = (constellation.properties.zodiac)? '#f2f237':"#999"
                  c.beginPath();
                  path(geo);
                  c.stroke();
              }
          })
      })
      c.strokeStyle = "#f00"
      c.lineWidth = 1.2
      constellations[min].geometry.geometries.forEach(function(geo) {
          if (geo.type == 'LineString') {
              c.beginPath();
              path(geo);
              c.stroke()
          }
      })
      c.fillStyle = '#fff'
      c.textAlign = "center"
      c.font = "18px sans-serif"
      c.fillText(constellations[min].properties.name, width / 2, 280)
    }
  }
, []);

  return (
    <div>
      hi
      <canvas id="constellationCanvas" width={width} height={height}></canvas>
    </div>
  );
}

export default ConstellationPage;