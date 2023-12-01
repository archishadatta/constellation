
import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { starData } from "./starCatalog";
import { Link } from 'react-router-dom';
// import { RiHome2Fill  } from 'react-icons/ri'; // Import the home icon
import { Button, Form } from 'react-bootstrap';
import * as starCalc from "./starCalculations.mjs";

// import * as d3 from 'd3-geo';


function ConstellationPage() {

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [constellationName, setConstellationName] = useState('');
  const [authorName, setAuthorName] = useState('');

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const handleSubmit = () => {
    // Perform actions with the entered data, like saving it to state or sending it to an API
    console.log('Constellation Name:', constellationName);
    console.log('Author Name:', authorName);
    handleClose();
  };

  // Star arrays
  // let geoConstellations = [];
  let starsMag = [];
  // var bgRGB = d3.rgb('#020525')


  // Filter stars by magnitude
  const data = starData.filter(
    function(star) {
      if (star.MAG < 4) 
        starsMag.push(star.MAG);
      return star.MAG < 4;
  });

  var minMaxMag = d3.extent(starsMag);
  var opacityScale = d3.scaleLinear().domain(minMaxMag).range([1, 0.4]);
  var magScale = d3.scaleLinear().domain(minMaxMag).range([3.5, 1.1]);


  // Map star data to canvas object
  var geometries = data.map(function(star) {
    var rgb = d3.rgb('#fff'); // Provide a default color, or use star.color if available
    var rgba = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + opacityScale(star.MAG) + ')';

    //calculating star coordinates
    const coords = starCalc.calcAltAz(starCalc.RAToDeg(star.RA), starCalc.DecToDeg(star.DEC),
                    starCalc.observerLocation.latitude, starCalc.observerLocation.longitude, 
                    starCalc.observingDate);

    return {
      type: 'Point',
      coordinates: coords, // Convert to numbers
      properties: {
        color: rgba,
        mag: magScale(star.MAG)
      }
    };
  });

//   console.log("Star geometries")
//   console.log(geometries)

  // Canvas setup
  const canvasRef = useRef(null);
  useEffect(() => {  
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d'); 

  // Function to resize the canvas to fill the entire window
  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var projection = d3.geoStereographic().translate([window.innerWidth/2, window.innerHeight/2]).scale(600);
    var fixedProjection = d3.geoStereographic().scale(600).rotate([0, 0]) 
    var path = d3.geoPath().projection(projection).context(ctx)
    var graticule = d3.geoGraticule().step([15, 20])

    function draw(geometries, center) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = '#020525';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      projection.rotate(center)

      // Draw grid
      ctx.strokeStyle = "#fff"
      ctx.lineWidth = .25
      ctx.beginPath(); path(graticule()); ctx.stroke();
      
      // Draw stars
      //stuff to get information on projection
      //let count = 0;
      //const visibleStars = [];
      geometries.forEach(function(geo) {
        /*const coords = projection(geo.coordinates);
        if(coords[0] >= 0 && coords[0] < window.innerWidth && coords[1] >= 0 && coords[1] < window.innerHeight){
          count++;
          visibleStars.push([coords[0].toFixed(1), coords[1].toFixed(1)]);
        }*/
        ctx.fillStyle = geo.properties.color
        ctx.beginPath();
        path.pointRadius(geo.properties.mag)
        path(geo)
        ctx.fill();
        ctx.closePath();
      }
      )
      /*console.log(count);
      visibleStars.sort(function(a, b){
        if(a[0] - b[0] === 0){
          return a[1] - b[1];
        }
        return a[0] - b[0];
      })
      //console.log(str);
      console.log(visibleStars);
      let str = "";
      for(let i = 0; i < visibleStars.length; i++){
        str += "(" + visibleStars[i][0] + ", " + visibleStars[i][1] + "),\n";
      }
      console.log(str);
      console.log("window width: " + window.innerWidth);
      console.log("window height: " + window.innerHeight);*/
    }

    draw(geometries, [0, -90])

    // Drag functionality
    let raStart, decStart;

    function getStart(event) {
        const [x, y] = d3.pointer(event);
        raStart = projection.invert([x, y])[0];
        decStart = fixedProjection.invert([x, y])[1];
    }

    function move(event) {
        const [x, y] = d3.pointer(event);
        const raFinish = projection.invert([x, y])[0];
        const decFinish = fixedProjection.invert([x, y])[1];

        const raRotate = raFinish - raStart;
        const decRotate = decFinish - decStart;

        const rotate = projection.rotate();
        const newCenter = [rotate[0] + raRotate, rotate[1] + decRotate];

        draw(geometries, newCenter);

        decStart = fixedProjection.invert([x, y])[1];
    }

    const drag = d3.drag()
        .on("start", getStart)
        .on("drag", move);

    d3.select(canvas).call(drag);

   
  
    /*
    d3.json("/erohinaelena/raw/ec635d68e8bf55586d40/starData.json", function(error, data) {

      var geoConstellations = []
      var starsMag = []
      //filter our not bright stars
      data = data.map(function(constellation) {
          constellation.stars = constellation.stars.filter(function(star) {
              if (star.mag < 6) starsMag.push(star.mag)
              return star.mag < 6
          })
          return constellation
      })
      // define brightness scale
      var minMaxMag = d3.extent(starsMag)
      var opacityScale = d3.scale.linear()
          .domain(minMaxMag)
          .range([1, 0.4])
  
      var magScale = d3.scale.linear()
          .domain(minMaxMag)
          .range([2.7, 1.7])
  
      // for each constellation, add to geoConstellations
      data.forEach(function (constellation) {
          // each constellation has geometries array
          var geometries = []

          // Add each star point to geometries array
          constellation.stars.map(function (star) {
                  var rgb = d3.rgb(star.color)
                  var rgba = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + opacityScale(star.mag) + ')'
  
                  geometries.push({
                      type: 'Point',
                      coordinates: [-star.ra, star.dec],
                      properties: {
                          color: rgba,
                          mag: magScale(star.mag)
                      }
                  })
          })
  
          // Add edges to geometries array
          var lines = constellation.lines.map(function (line) {
              var p1 = [-line.ra1, line.dec1]
              var p2 = [-line.ra2, line.dec2]
  
              return [p1, p2]
          })
  
          geometries.push({
              type: "MultiLineString",
              coordinates: lines
          })
          
          // Something about adding boundaries to geometry
          if (constellation.name == 'Serpens'){
              var bound1 = constellation.boundary[0].map(function (coords) {
                  return [-coords[0], coords[1]]
              })
              var bound2 = constellation.boundary[1].map(function (coords) {
                  return [-coords[0], coords[1]]
              })
              geometries.push({
                  type: "LineString",
                  coordinates: bound1
              })
              geometries.push({
                  type: "LineString",
                  coordinates: bound2
              })
          } else {
              var boundLines = constellation.boundary.map(function (coords) {
                  return [-coords[0], coords[1]]
              })
              geometries.push({
                  type: "LineString",
                  coordinates: boundLines
              })
          }

          // Add constellation feature to list
          geometries = {
              type: 'GeometryCollection',
              geometries: geometries
          }
          var geoConstellation = {
              type: 'Feature',
              geometry: geometries,
              properties: {
                  name: constellation.name,
                  zodiac: constellation.zodiac,
                  center: d3.geo.centroid(geometries)
              }
          }
          geoConstellations.push(geoConstellation)
      })
      

      // Draw the constellations
      draw(geoConstellations, [30, -70])
      
      // Drag functionality
      var raStart, decStart
      function getStart() {
          raStart  = projection.invert(d3.mouse(this))[0]
          decStart = fixedProjection.invert(d3.mouse(this))[1]
      }
      function move() {
          var raFinish = projection.invert(d3.mouse(this))[0]
          var decFinish = fixedProjection.invert(d3.mouse(this))[1]
  
          var raRotate = raFinish - raStart
          var decRotate = decFinish - decStart
  
          var rotate = projection.rotate()
          var newCenter = [rotate[0] + raRotate, rotate[1] + decRotate]
  
          draw(geoConstellations, newCenter)
  
          decStart = fixedProjection.invert(d3.mouse(this))[1]
      }
      var drag = d3.behavior.drag()
          .on("dragstart", getStart)
          .on("drag", move)
      canvas.call(drag)
  
  })
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

  // Draw stars
  function draw(constellations, center) {
  
      var min = 0,
          minDistance = distance(projection(constellations[0].properties.center))
  
      if (center) projection.rotate(center)
  
      c.clearRect(0, 0, width, height)
      c.strokeStyle = "#fff"
      c.lineWidth = .1
      c.beginPath(), path(graticule()), c.stroke()
      c.lineWidth = .4
      c.beginPath(), path({type: "LineString", coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]]}), c.stroke()
      c.strokeStyle = "#f2f237"
      c.beginPath(), path({type: "LineString", coordinates: [[-180, 0], [-90, 23.26], [0, 0], [90, -23.26], [180, 0]]}), c.stroke()
  
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
                  c.beginPath(), path(geo), c.fill();
              } else if (geo.type == 'LineString') {
                  c.strokeStyle = '#000'
                  c.beginPath(), path(geo),c.stroke()
              } else if (geo.type == 'MultiLineString') {
                  c.strokeStyle = (constellation.properties.zodiac)? '#f2f237':"#999"
                  c.beginPath(), path(geo), c.stroke();
              }
          })
      })
      c.strokeStyle = "#f00"
      c.lineWidth = 1.2
      constellations[min].geometry.geometries.forEach(function(geo) {
          if (geo.type == 'LineString') {
              c.beginPath(), path(geo), c.stroke()
          }
      })
      c.fillStyle = '#fff'
      c.textAlign = "center"
      c.font = "18px sans-serif"
      c.fillText(constellations[min].properties.name, width / 2, 280)
  }
  */
  };

  // Initial resize
  resizeCanvas();

  // Event listener for window resize
  window.addEventListener('resize', resizeCanvas);

  return () => {
    // Clean up event listener on unmount
    window.removeEventListener('resize', resizeCanvas);
  };

}
);

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <Link to="/" className="home-link">
        {/* <RiHome2Fill  className="home-icon" /> */}
      </Link>

      { <div className='star-menu'>      
        <div className='star-menu-content'>
        <Link to='/drawing' className='small text-btn'>
          <span>Draw new constellation</span>
        </Link>
        <Button className='small text-btn' onClick={handleShow}>
          <span>Add to gallery</span>
        </Button>
        <Link to='/gallery' className='small text-btn'>
          <span>View gallery</span>
        </Link>
        </div>
    </div> }

      <canvas
        ref={canvasRef}
        style={{ width: '100vw', height: '100vh', display: 'block' }}
      ></canvas>

    {showModal && <div className='modal-container'>
        <div className='modal'>
        <div className='modal-title'>Add to Gallery</div>
          <Form>
            <Form.Group controlId="constellationName" className='modal-section'> 
              <Form.Label>Constellation name</Form.Label>
              <Form.Control
                className='input'
                type="text"
                value={constellationName}
                onChange={(e) => setConstellationName(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="authorName" className='modal-section'>
              <Form.Label >Author</Form.Label>
              <Form.Control
              className='input'
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
              />
            </Form.Group>
          </Form>
        
        <div className='modal-btn-container'>
            <Button className="modal-btn secondary" onClick={handleClose}>
            Close
          </Button>
          <Button className="modal-btn primary" onClick={handleSubmit}>
            Submit
          </Button>
        </div>
               
        </div>

      </div>}

    </div>
  );
}

export default ConstellationPage;