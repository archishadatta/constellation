import React, { useEffect, useState } from 'react';
import starCatalog from './starCatalog.json'; // Importing the JSON file
import './App.css';

const App = () => {
  const observerLocation = {
    latitude: 34.017795,  // USC Coordinates: 34.017795, -118.297777
    longitude: -118.297777
  };

  const observingDate = new Date();  // Use the current date
  const J2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0, 0)); //J2000 epoch date

  // Function to calculate LST
  const calculateLST = (latitude, longitude, observingDate) => {
    const JD = getJulianDate(observingDate);
    const T = (JD - 2451545) / 36525;  // Julian centuries from J2000.0
  
    // Calculate Greenwich Mean Sidereal Time (GMST) in degrees
    const GMST = 280.46061837 + 360.98564736629 * (JD - 2451545) + 0.000387933 * T * T - (T / 38710000);
    
    // Ensure GMST is in the range [0, 360)
    let normalizedGMST = GMST % 360;
    if (normalizedGMST < 0) {
      normalizedGMST += 360;
    }
  
    // Calculate Local Sidereal Time (LST) in degrees
    const LST = normalizedGMST + (longitude / 15);
  
    // Ensure LST is in the range [0, 360)
    const normalizedLST = LST % 360;
    return normalizedLST;
  };
  
  const getJulianDate = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;  // Months are 0-indexed
    const day = date.getDate() + (date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600) / 24;
  
    // For January and February, treat them as months 13 and 14 of the previous year
    if (month <= 2) {
      year -= 1;
      month += 12;
    }
  
    const A = Math.floor(year / 100);
    const B = 2 - A + Math.floor(A / 4);
  
    // Calculate Julian Date
    const JD = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
    return JD;
  };

  // Function to determine star visibility
  const isStarVisible = (star, lst) => {
    const starRAHours = convertRAtoHours(star.RA); // Convert star's RA to decimal hours
  
    // Set a tolerance for visibility (in decimal hours) around the star's RA
    const tolerance = 1.0; 
  
    // Check if the LST is within the tolerance range of the star's RA
    const minRA = starRAHours - tolerance / 2;
    const maxRA = starRAHours + tolerance / 2;
  
    // Normalize RA to be within [0, 24) hours
    const normalizedLST = (lst + 24) % 24;
  
    return normalizedLST >= minRA && normalizedLST <= maxRA;
  };
  
  const convertRAtoHours = (ra) => {
    const parts = ra.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseFloat(parts[2]);
    return hours + minutes / 60 + seconds / 3600;
  };
  

  const [visibleStars, setVisibleStars] = useState([]);

  useEffect(() => {
    // Calculate LST for the observer
    const lst = calculateLST(observerLocation.latitude, observerLocation.longitude, observingDate);
    // Filter out visible stars
    const visibleStars = starCatalog.filter(star => isStarVisible(star, lst));

    setVisibleStars(visibleStars);
  }, [observerLocation, observingDate]);

  function RAToDeg(ra){
    const parts = ra.split(':');
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    const seconds = parseFloat(parts[2]);
    return (hours + minutes/60 + seconds/3600) * 15;
  }
  function DecToDeg(dec){
    const parts = dec.substr(1).split(":");
    const sign = dec[0];
    const deg = parseInt(parts[0]);
    const arcminutes = parseInt(parts[1]);
    const arcseconds = parseFloat(parts[2]);
    return (sign == "-" ? -1:1) * (deg + arcminutes/60 + arcseconds/3600);
  }

  function calcLST(longitude, date){
    //LST = 100.46 + 0.985647*d + long + 15 * UT
    const uniTime = date.getUTCHours() + date.getUTCMinutes()/60 + date.getUTCSeconds()/3600;
    const dUniTime = uniTime/24 * 10;
    const daysSinceEpoch = (date.getTime() - J2000.getTime())/(24 * 60 * 60 * 1000);
    const LSTDeg = 100.46 + 0.985647 * daysSinceEpoch + longitude + 15 * dUniTime;
    return LSTDeg % 360;
  }

  function isVisible(dec, latitude){
    if(Math.abs(latitude - dec) > 0){
      return -1; //never visible
    }
    if(Math.abs(latitude - dec) > 90){
      return 1; //always visible
    }
    return 0;
  }
  function calcAltAz(ra, dec, latitude, longitude, date){
    const hourAngle = (calcLST(longitude, date) - ra) * Math.PI/180;
    dec *= Math.PI/180;
    latitude *= Math.PI/180;
    let alt = Math.sin(dec) * Math.sin(latitude);
    alt += Math.cos(dec) * Math.cos(latitude) * Math.cos(hourAngle);
    alt = Math.asin(alt);
    let az = Math.sin(dec) - Math.sin(alt) * Math.sin(latitude);
    az /= Math.cos(alt) * Math.cos(latitude);
    az = Math.acos(az);
    return [alt, az];
  }

  const ra = RAToDeg("18:37:43.7");
  const dec = DecToDeg("+38:48:33.5");
  const result = calcAltAz(ra, dec, observerLocation.latitude, observerLocation.longitude, observingDate);
  //at like 10/19/23, 10:07 PM, it should be 296 degrees (azimuth) and +36 degrees (altitude)
  //should be 
  return (
    <div className="App">
      <header className="App-header">
        <p>
          wow, constellations are so cool!
        </p>
        <p>RA: {ra}, Dec: {dec}</p>
        <p>Altitude: {(result[0] * 180/Math.PI).toFixed(3)}, Azimuth: {(result[1] * 180/Math.PI).toFixed(3)}</p>
        <div>
          <h2>visible Stars:</h2>
          <ul>
            {visibleStars.map((star, index) => (
              <li key={index}>
                {`Star ${index + 1}: RA - ${star.RA}, DEC - ${star.DEC}`}
              </li>
            ))}
          </ul>
        </div>
      </header>
    </div>
  );
};

export default App;
