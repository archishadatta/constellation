import {React, useEffect} from 'react';
import { Link } from "react-router-dom";
import './App.css'


function LandingPage() {

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
    <div className='star-bg landing-container'>
        <div className='landing'>
            <h1 id="title">Constellation Creator</h1>
            <Link to='/drawing' className='text-btn'>
                <span>Create a constellation</span>
            </Link>

            <Link to='/gallery' className='text-btn'>
                <span>View gallery</span>
            </Link>
        </div>
    </div>
  );
}

export default LandingPage;
