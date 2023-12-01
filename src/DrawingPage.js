import {React, useEffect, useRef} from 'react';
import { Link } from 'react-router-dom';
import { RiHome2Fill  } from 'react-icons/ri'; // Import the home icon]

import * as starCalc from "./starCalculations.mjs";
import * as d3 from 'd3';
import { starData } from "./starCatalog";

function DrawingPage() {
  const canvRef = useRef(null);

  //handle stars
  const data = starData.filter(
    function(star) {
      return star.MAG < 4;
  });
  const stars = data.map(function(star){
    const coords = starCalc.calcAltAz(starCalc.RAToDeg(star.RA), starCalc.DecToDeg(star.DEC),
                    starCalc.observerLocation.latitude, starCalc.observerLocation.longitude, 
                    starCalc.observingDate);
    return {
      type: 'Point',
      coordinates: coords,
      properties: {
        mag: star.MAG
      }
    }
  })

  //mouse stuff
  let prevX1 = null, prevY1 = null, prevX2 = null, prevY2 = null;
  let mouseDown = false;
  let wait = false;

  //points
  let points = []; //filled with stars later
  let highlighted = [];

  //drawing points
  let curComponent = -1;
  let drawingPts = [];

  //some helper math functions
  function sqDist(x1, y1, x2, y2){
    return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
  }
  function linearMap(x, min1, max1, min2, max2){
    return (x - min1)/(max1 - min1) * (max2 - min2) + min2;
  }

  //canvas drawing functions
  function circle(ctx, x, y, r){
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }
  function plotPoint(ctx, x, y, col="black", s=2, glow=false){
    ctx.fillStyle = col;
    circle(ctx, x, y, s);
  }
  function plotPath(ctx, pts, col="black", strokeWidth=1){
    if(pts.length === 0){
      return;
    }
    ctx.beginPath();
    ctx.fillStyle = "transparent";
    ctx.strokeStyle = col;
    ctx.lineWidth = strokeWidth;
    for(let i = 0; i < pts.length; i++){
      if(pts[i].length === 0){ continue; }
      ctx.moveTo(pts[i][0].x, pts[i][0].y);
      for(let j = 1; j < pts[i].length; j++){
        ctx.lineTo(pts[i][j].x, pts[i][j].y);
      }
    }
    ctx.stroke();
    ctx.closePath();
  }
  function setUpStars(canvas){
    const projection = d3.geoStereographic().translate([canvas.width/2, canvas.height/2]).scale(600).rotate([0, -90, 0]);
    points = stars.map(function(star){
      const coords = projection(star.coordinates);
      return { 
        x: coords[0], 
        y: coords[1], 
        size: linearMap(star.properties.mag, 0, 4, 3, 1)
      };
    });
  }
  function drawCanvas(canvas, ctx){
    ctx.clearRect(0,0, canvas.width, canvas.height);

    //drawing the path
    plotPath(ctx, drawingPts, "rgba(2, 5, 37, 0.5)");

    //drawing points
    for(let i = 0; i < points.length; i++){
      if(highlighted.indexOf(points[i]) !== -1){
        plotPoint(ctx, points[i].x, points[i].y, "rgb(121,181,241)", 3.5);
      }
      else {
        plotPoint(ctx, points[i].x, points[i].y, "#020525", points[i].size);
      }
    }
  }
  
  function directionChange(prevX2, prevY2, prevX1, prevY1, curX, curY){
    let pathLen = Math.sqrt(sqDist(prevX1, prevY1, curX, curY)) + Math.sqrt(sqDist(prevX2, prevY2, prevX1, prevY1));
    let straightPath = Math.sqrt(sqDist(prevX2, prevY2, curX, curY));
    if(straightPath < 0.01){
      return 1.25;
    }
    return pathLen/straightPath;
  }
  function updateHighlight(mouseX, mouseY, threshold){
    let minDist = Infinity;
    let minInd = -1;
    for(let i = 0; i < points.length; i++){
      let dist = sqDist(points[i].x, points[i].y, mouseX, mouseY);
      if(dist < threshold && dist < minDist){
        minInd = i;
        minDist = dist;
      }
    }
    const lastPt = highlighted.length === 0 ? null:highlighted[highlighted.length - 1];
    if(minInd === -1){
      return;
    }
    if(lastPt === null){
      highlighted.push(points[minInd]);
      return;
    }
    else if(equal(lastPt.x, points[minInd].x) && equal(lastPt.y, points[minInd].y)){
      return;
    }
    else if(sqDist(lastPt.x, lastPt.y, points[minInd].x, points[minInd].y) > threshold || minDist < 100){
      highlighted.push(points[minInd]);
    }
  }

  //handling drag for users
  function updateOnDrag(e, canvas, ctx){
    //get current points
    const scaleFactor = 1280/canvas.offsetWidth;
    const mouseX = e.offsetX * scaleFactor;
    const mouseY = e.offsetY * scaleFactor;

    //updating highlighted points
    let factor = 1.2;
    if(drawingPts[curComponent].length >= 2){
      factor = directionChange(prevX2, prevY2, prevX1, prevY1, mouseX, mouseY);
    }
    let threshold = Math.max(225, 225 * factor * factor);
    updateHighlight(mouseX, mouseY, threshold);

    //adding points
    if(drawingPts[curComponent].length > 10000){
      const lastPt = drawingPts[curComponent][drawingPts[curComponent].length - 1];
      drawingPts.push([ lastPt ]);
      curComponent++;
    }
    drawingPts[curComponent].push({x : mouseX, y: mouseY });

    //draw updated canvas
    drawCanvas(canvas, ctx);

    //updating stuff
    prevX2 = prevX1;
    prevY2 = prevY1;
    prevX1 = mouseX;
    prevY1 = mouseY;
  }

  //reset drawing
  function reset(canvas, ctx){
    prevX2 = null;
    prevY2 = null;
    prevX1 = null;
    prevY1 = null;

    highlighted = [];
    drawingPts = [];
    curComponent = -1;
    mouseDown = false;
    wait = false;

    //redraw cleared canvas
    drawCanvas(canvas, ctx);
  }

  //functions handling mouse movement
  function handleMouseUp(){
    mouseDown = false;
    wait = false;
  }
  function handleMouseDown(){
    mouseDown = true;
    curComponent++;
    drawingPts.push([]);
  }
  function handleMouseMove(e, canvas, ctx){
    if(!mouseDown){
      return;
    }
    if(!wait){
      updateOnDrag(e, canvas, ctx);
      wait = true;
    }
    if((prevX1 === null) || sqDist(prevX1, prevY1, e.offsetX, e.offsetY) >= 36){
      wait = false;
    }
  }

  useEffect(() => {
    const container = document.getElementsByClassName('star-bg')[0];

    // Generate stars and append them to the container
    for (let i = 0; i < 200; i++) {
        const star = document.createElement('div');
        star.classList.add('star');

        // Random size between 0.5px and 2px
        const size = 1 + Math.random() * 2;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;

        // Random opacity between 0.4 and 1.0
        const opacity = 0.4 + Math.random() * 0.6;
        star.style.opacity = opacity;
        star.style.animationDelay = `${Math.random() * 10}s`;

        // Random positions within the container
        star.style.left = `${Math.random() * 96 + 2}%`;
        star.style.top = `${Math.random() * 96 + 2}%`;
        container.appendChild(star);
    }

    //canvas
    const canv = canvRef.current;
    const ctx = canv.getContext('2d');

    //set up canvas
    setUpStars(canv);
    canv.onmousedown = handleMouseDown;
    canv.onmouseup = handleMouseUp;
    const moveHandler = function(e){
      handleMouseMove(e, canv, ctx);
    };
    //canv.addEventListener("mouseout", handleMouseUp);
    canv.addEventListener("mousemove", moveHandler);
    drawCanvas(canv, ctx);

    //clear canvas
    const clearBtn = document.getElementById("clear-btn");
    const clearHandler = function(){
      reset(canv, ctx);
    };
    clearBtn.addEventListener("click", clearHandler);

    //clean up event listeners
    return () => {
      canv.removeEventListener("mousedown", handleMouseDown);
      canv.removeEventListener("mouseup", handleMouseUp);
      //canv.removeEventListener("mouseout", handleMouseUp);
      canv.removeEventListener("mousemove", moveHandler);
      clearBtn.removeEventListener("click", clearHandler);
    };
  }, []);

  return (
    <div className='drawing-container star-bg'>
      <Link to="/" className="home-link">
        <RiHome2Fill  className="home-icon" />
      </Link>
      <div className='drawing'>
        <div className='drawing-sidebar'>
          <p>Draw your constellation here...</p>
          <button className='text-btn' id = 'clear-btn'>
              <span>Clear</span>
          </button>
          <Link to='/constellation' className='text-btn'>
                <span>Map to sky</span>
          </Link>
        </div>
        <canvas className='drawing-whiteboard' ref = {canvRef} width = "1280" height = "675">

        </canvas>
      </div>
      
    </div>
  );
}

export default DrawingPage;
