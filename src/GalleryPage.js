import {React, useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import { RiHome2Fill  } from 'react-icons/ri'; // Import the home icon
import { starData } from "./starCatalog";
import * as starCalc from "./starCalculations.mjs";
import * as d3 from 'd3';


function GalleryItem(props) {

  const handleSubmit = () => {
    props.setIndicesGlobal(props.indices)
  };

  const date = new Date(props.date)
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  // make points array from given indices
  const starDataMag = starData.filter(
    function(star) {
      return star.MAG < 4;
  });

  const unnormalized = []

  props.indices.forEach((index) => {
  const star = starDataMag[index]; // Get star data at the specified index
  if (star) {
      const projection = d3.geoStereographic().translate([1280/2, 675/2]).scale(600).rotate([0, -90, 0]);

      const coords = projection(starCalc.calcAltAz(starCalc.RAToDeg(star.RA), starCalc.DecToDeg(star.DEC),
        starCalc.observerLocation.latitude, starCalc.observerLocation.longitude, 
         starCalc.observingDate));

      //console.log("Coords", coords)
      unnormalized.push(coords)
    }
  });
  console.log('Unnormalized', unnormalized)

  // normalize coords to be between 0 - 100
  const minX = Math.min(...unnormalized.map(c => c[0]));
  const maxX = Math.max(...unnormalized.map(c => c[0]));
  const minY = Math.min(...unnormalized.map(c => c[1]));
  const maxY = Math.max(...unnormalized.map(c => c[1]));
  const normalizedCoords = unnormalized.map(coord => {
    // Normalize each coordinate value between 0 and 100
    const normalizedX = ((coord[0] - minX) / (maxX - minX)) * 90;
    const normalizedY = ((coord[1] - minY) / (maxY - minY)) * 90;

    return [normalizedX, normalizedY];
});
console.log('Normalized', normalizedCoords)

  const points = normalizedCoords.map(coord => {
   return {
      x: coord[0],
      y: coord[1],
    }
  })


  console.log("Points" + points)

  const svgWidth = 150;
  const svgHeight = 150;
  const svgShift =2;
  return(
    
    <div className='gallery-item gallery-txt'>      
      <div className='gallery-item-title'>{props.title}</div>
      <div className='gallery-item-content'>
      <Link to='/constellation' className='canvas-container' onClick={handleSubmit}>
        <svg height={svgHeight + 2*svgShift} width={svgWidth + 2*svgShift} className='canvas'>
          <path
            d={`M${points.map(point => `${point.x * svgWidth / 100 + svgShift},${point.y * svgHeight / 100 + svgShift}`).join(' L')} Z`}
            fill="rgba(255, 255, 255, 0.05)"
            stroke="#E1E4FF"
          />
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x * svgWidth / 100 + svgShift}
              cy={point.y * svgHeight / 100 + svgShift}
              r={2} // Adjust the radius as needed
              fill="#E1E4FF"
            />
          ))}
          {/* {points.map((point, index) => (
            <text key={index} x={point.x * svgWidth / 100 + svgShift} y={point.y * svgHeight / 100 + svgShift} dy={point.y < 50 ? -5 : 10} fill="#E1E4FF" fontSize="10" textAnchor="middle">
              {'> '+ point.starname}
            </text>
          ))} */}
        </svg>
      </Link>
      <div>Author: {props.author}</div>
      <div>Created {formattedDate} {formattedTime}</div>
      </div>
    </div>
  );
}

function GalleryPage(props) {
  const [stars, setJsonData] = useState([]);

  useEffect(() => {
    const container = document.getElementsByClassName('star-bg')[0];

    // Calculate the number of stars based on the container size
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const totalStars = Math.round((containerWidth * containerHeight) / 3000); // Adjust this factor based on density

    // Generate stars and append them to the container
    for (let i = 0; i < totalStars; i++) {
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
        star.style.left = `${Math.random() * (containerWidth - 4) + 2}px`;
        star.style.top = `${Math.random() * (containerHeight - 4) + 2}px`;
        container.appendChild(star);
    }
    fetch('http://localhost:7000/data') // Update URL as per your server setup
      .then((response) => response.json())
      .then((data) => {
        console.log(data)
        setJsonData(data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <div className='gallery-container star-bg'>
      <Link to="/" className="home-link">
        <RiHome2Fill  className="home-icon" />
      </Link>
      <div id='title2'>Constellation Gallery</div>
      <div className='gallery'>
        {stars.map((item) => {
          return <GalleryItem key={item.title} title={item.title} author={item.author} date={item.date} indices={item.indices} setIndicesGlobal={props.setIndicesGlobal}></GalleryItem>
        })}
        {/* {stars.map((item) => (
          <li key={item.id}>{item.title}, {item.date}, {item.author}, {item.indices[0].x}</li>
        ))} */}

      </div>
      
    </div>
  );
}

export default GalleryPage;