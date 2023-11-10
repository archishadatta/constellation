import {React, useEffect} from 'react';
import { Link } from 'react-router-dom';
import { RiHome2Fill  } from 'react-icons/ri'; // Import the home icon

const stars = [
  {
    title: "constellation",
    author: "archie",
    date: new Date(),
    points: [
      { starname: "Head", x: 0, y: 50 },
      { starname: "Ear 1", x: 20, y: 80 },
      { starname: "Ear 2", x: 30, y: 60 },
      { starname: "Eye 1", x: 70, y: 60 },
      { starname: "Eye 2", x: 80, y: 80 },
      { starname: "Nose", x: 100, y: 50 },
      { starname: "Mouth", x: 90, y: 10 },
      { starname: "Body", x: 20, y: 10 },
    ]
  },
  {
    title: "constellation",
    author: "archie",
    date: new Date(),
    points: [
      { starname: "Head", x: 0, y: 50 },
      { starname: "Ear 1", x: 20, y: 80 },
      { starname: "Ear 2", x: 30, y: 60 },
      { starname: "Eye 1", x: 70, y: 60 },
      { starname: "Eye 2", x: 80, y: 80 },
      { starname: "Nose", x: 100, y: 50 },
      { starname: "Mouth", x: 90, y: 10 },
      { starname: "Body", x: 20, y: 10 },
    ]
  },
  {
    title: "constellation",
    author: "archie",
    date: new Date(),
    points: [
      { starname: "Head", x: 0, y: 50 },
      { starname: "Ear 1", x: 20, y: 80 },
      { starname: "Ear 2", x: 30, y: 60 },
      { starname: "Eye 1", x: 70, y: 60 },
      { starname: "Eye 2", x: 80, y: 80 },
      { starname: "Nose", x: 100, y: 50 },
      { starname: "Mouth", x: 90, y: 10 },
      { starname: "Body", x: 20, y: 10 },
    ]
  },
  {
    title: "constellation",
    author: "archie",
    date: new Date(),
    points: [
      { starname: "Head", x: 0, y: 50 },
      { starname: "Ear 1", x: 20, y: 80 },
      { starname: "Ear 2", x: 30, y: 60 },
      { starname: "Eye 1", x: 70, y: 60 },
      { starname: "Eye 2", x: 80, y: 80 },
      { starname: "Nose", x: 100, y: 50 },
      { starname: "Mouth", x: 90, y: 10 },
      { starname: "Body", x: 20, y: 10 },
    ]
  },
  {
    title: "constellation",
    author: "archie",
    date: new Date(),
    points: [
      { starname: "Head", x: 0, y: 50 },
      { starname: "Ear 1", x: 20, y: 80 },
      { starname: "Ear 2", x: 30, y: 60 },
      { starname: "Eye 1", x: 70, y: 60 },
      { starname: "Eye 2", x: 80, y: 80 },
      { starname: "Nose", x: 100, y: 50 },
      { starname: "Mouth", x: 90, y: 10 },
      { starname: "Body", x: 20, y: 10 },
    ]
  },
  {
    title: "constellation",
    author: "archie",
    date: new Date(),
    points: [
      { starname: "Head", x: 0, y: 50 },
      { starname: "Ear 1", x: 20, y: 80 },
      { starname: "Ear 2", x: 30, y: 60 },
      { starname: "Eye 1", x: 70, y: 60 },
      { starname: "Eye 2", x: 80, y: 80 },
      { starname: "Nose", x: 100, y: 50 },
      { starname: "Mouth", x: 90, y: 10 },
      { starname: "Body", x: 20, y: 10 },
    ]
  },
  {
    title: "constellation",
    author: "archie",
    date: new Date(),
    points: [
      { starname: "Head", x: 0, y: 50 },
      { starname: "Ear 1", x: 20, y: 80 },
      { starname: "Ear 2", x: 30, y: 60 },
      { starname: "Eye 1", x: 70, y: 60 },
      { starname: "Eye 2", x: 80, y: 80 },
      { starname: "Nose", x: 100, y: 50 },
      { starname: "Mouth", x: 90, y: 10 },
      { starname: "Body", x: 20, y: 10 },
    ]
  },
  {
    title: "constellation",
    author: "archie",
    date: new Date(),
    points: [
      { starname: "Head", x: 0, y: 50 },
      { starname: "Ear 1", x: 20, y: 80 },
      { starname: "Ear 2", x: 30, y: 60 },
      { starname: "Eye 1", x: 70, y: 60 },
      { starname: "Eye 2", x: 80, y: 80 },
      { starname: "Nose", x: 100, y: 50 },
      { starname: "Mouth", x: 90, y: 10 },
      { starname: "Body", x: 20, y: 10 },
    ]
  },
  {
    title: "constellation",
    author: "archie",
    date: new Date(),
    points: [
      { starname: "Head", x: 0, y: 50 },
      { starname: "Ear 1", x: 20, y: 80 },
      { starname: "Ear 2", x: 30, y: 60 },
      { starname: "Eye 1", x: 70, y: 60 },
      { starname: "Eye 2", x: 80, y: 80 },
      { starname: "Nose", x: 100, y: 50 },
      { starname: "Mouth", x: 90, y: 10 },
      { starname: "Body", x: 20, y: 10 },
    ]
  },
  {
    title: "constellation",
    author: "archie",
    date: new Date(),
    points: [
      { starname: "Head", x: 0, y: 50 },
      { starname: "Ear 1", x: 20, y: 80 },
      { starname: "Ear 2", x: 30, y: 60 },
      { starname: "Eye 1", x: 70, y: 60 },
      { starname: "Eye 2", x: 80, y: 80 },
      { starname: "Nose", x: 100, y: 50 },
      { starname: "Mouth", x: 90, y: 10 },
      { starname: "Body", x: 20, y: 10 },
    ]
  },
  {
    title: "constellation",
    author: "archie",
    date: new Date(),
    points: [
      { starname: "Head", x: 0, y: 50 },
      { starname: "Ear 1", x: 20, y: 80 },
      { starname: "Ear 2", x: 30, y: 60 },
      { starname: "Eye 1", x: 70, y: 60 },
      { starname: "Eye 2", x: 80, y: 80 },
      { starname: "Nose", x: 100, y: 50 },
      { starname: "Mouth", x: 90, y: 10 },
      { starname: "Body", x: 20, y: 10 },
    ]
  },
  {
    title: "constellation",
    author: "archie",
    date: new Date(),
    points: [
      { starname: "Head", x: 0, y: 50 },
      { starname: "Ear 1", x: 20, y: 80 },
      { starname: "Ear 2", x: 30, y: 60 },
      { starname: "Eye 1", x: 70, y: 60 },
      { starname: "Eye 2", x: 80, y: 80 },
      { starname: "Nose", x: 100, y: 50 },
      { starname: "Mouth", x: 90, y: 10 },
      { starname: "Body", x: 20, y: 10 },
    ]
  },
]



function GalleryItem(props) {
  const formattedDate = props.date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const formattedTime = props.date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const svgWidth = 150;
  const svgHeight = 150;
  const svgShift =2;
  return(
    
    <div className='gallery-item gallery-txt'>      
      <div className='gallery-item-title'>{props.title}</div>
      <div className='gallery-item-content'>
      <Link to='/constellation' className='canvas-container'>
        <svg height={svgHeight + 2*svgShift} width={svgWidth + 2*svgShift} className='canvas'>
          <path
            d={`M${props.points.map(point => `${point.x * svgWidth / 100 + svgShift},${point.y * svgHeight / 100 + svgShift}`).join(' L')} Z`}
            fill="rgba(255, 255, 255, 0.05)"
            stroke="#E1E4FF"
          />
          {props.points.map((point, index) => (
            <circle
              key={index}
              cx={point.x * svgWidth / 100 + svgShift}
              cy={point.y * svgHeight / 100 + svgShift}
              r={2} // Adjust the radius as needed
              fill="#E1E4FF"
            />
          ))}
          {/* {props.points.map((point, index) => (
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

function GalleryPage() {
  useEffect(() => {
    const container = document.getElementsByClassName('star-bg')[0];

    // Calculate the number of stars based on the container size
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const totalStars = Math.round((containerWidth * containerHeight) / 2000); // Adjust this factor based on density

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
        star.style.left = `${Math.random() * (containerWidth - 4) + 2}px`;
        star.style.top = `${Math.random() * (containerHeight - 4) + 2}px`;
        container.appendChild(star);
    }
  }, []);
  return (
    <div className='gallery-container star-bg'>
      <Link to="/" className="home-link">
        <RiHome2Fill  className="home-icon" />
      </Link>
      <div id='title2'>Constellation Gallery</div>
      <div className='gallery'>
        {stars.map((item) => {
          return <GalleryItem key={item.title} title={item.title} author={item.author} date={item.date} points={item.points}></GalleryItem>
        })}

      </div>
      
    </div>
  );
}

export default GalleryPage;