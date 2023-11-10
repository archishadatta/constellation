import {React, useEffect} from 'react';
import { Link } from 'react-router-dom';
import { RiHome2Fill  } from 'react-icons/ri'; // Import the home icon

function DrawingPage() {
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
  }, []);
  return (
    <div className='drawing-container star-bg'>
      <Link to="/" className="home-link">
        <RiHome2Fill  className="home-icon" />
      </Link>
      <div className='drawing'>
        <div className='drawing-sidebar'>
          <p>Draw your constellation here...</p>
          <button className='text-btn'>
              <span>Clear</span>
          </button>
          <Link to='/constellation' className='text-btn'>
                <span>Map to sky</span>
          </Link>
        </div>
        <div className='drawing-whiteboard'>

        </div>
      </div>
      
    </div>
  );
}

export default DrawingPage;
