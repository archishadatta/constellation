import React, { useEffect, useState } from 'react';
import starCatalog from './starCatalog.json'; // Importing the JSON file
import './App.css';

const App = () => {
  const observerLocation = {
    latitude: 34.017795,  // USC Coordinates: 34.017795, -118.297777
    longitude: -118.297777
  };

  const observingDate = new Date();  // Use the current date

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
    return (sign === "-" ? -1:1) * (deg + arcminutes/60 + arcseconds/3600);
  }

  //calculates Greenwich Mean Sidereal Time (taken from https://aa.usno.navy.mil/faq/GAST)
  //and returns it in hours
  function calcGMST(date){
    const prevMidnight = new Date(date.getTime());
    prevMidnight.setUTCHours(0, 0, 0, 0);
    const JulianDate = prevMidnight.getTime()/86400000 - 10957.5; 
    const hoursElapsed = date.getUTCHours() + date.getUTCMinutes()/60 + date.getUTCSeconds()/3600 + date.getUTCMilliseconds()/3600000;
    const GMST = (6.697375 + 0.065709824279 * JulianDate + 1.0027379 * hoursElapsed) % 24;
    return GMST;
  }

  //calculates the local hour angle given right ascension and longitude in degrees, and date
  //returns the local hour angle in radians
  function calcLHA(date, ra, long){
    return ((calcGMST(date) - ra/360 * 24) * 15 + long) * Math.PI/180;
  }

  //function to calculate altitude given local hour angle, declination, and latitude in radians
  //also returns in radians, -pi/2 to pi/2
  function calcAlt(LHA, dec, lat){
    return Math.asin(Math.cos(LHA) * Math.cos(dec) * Math.cos(lat) + Math.sin(dec) * Math.sin(lat));
  }

  //function to calculate azimuth given local hour angle, declination, and latitude in radians
  //also returns in radians, 0 to 2PI
  function calcAz(LHA, dec, lat){
    let az = Math.atan2(-Math.sin(LHA), Math.tan(dec) * Math.cos(lat) - Math.sin(lat) * Math.cos(LHA));
    if(az < 0){
      az += Math.PI * 2;
    }
    return az;
  }
  
  //calculates the altitude and azimuth of a star relative to an observer's position
  //taken from https://aa.usno.navy.mil/faq/alt_az (uses GMST instead of GAST though)
  //returns both in degrees (altitude: -90 to +90, azimuth: 0 to 360)
  function calcAltAz(ra, dec, lat, long, date){
    //calculating local hour angle
    const LHA = calcLHA(date, ra, long);
    //converting things to radians for trig calculations
    const rDec = dec * Math.PI/180;
    const rLat = lat * Math.PI/180;

    return [calcAlt(LHA, rDec, rLat) * 180/Math.PI, calcAz(LHA, rDec, rLat) * 180/Math.PI];
  }

  //returns if a star is always (1), never (-1), or sometimes visible (0)
  //given declination and latitude in degrees
  function isVisibleCertain(dec, latitude){
    if(dec - latitude < -90 || dec - latitude > 90){
      return -1; //never visible
    }
    if(Math.abs(latitude + dec) > 90){
      return 1; //always visible, circumpolar
    }
    return 0; //sometimes visible; further calculation needed
  }

  //return if star is visible
  function isStarVisible(ra, dec, lat, long, date){
    ra = RAToDeg(ra);
    dec = DecToDeg(dec);
    const certainVisible = isVisibleCertain(dec, lat);
    if(certainVisible == 0){
      return calcAlt(calcLHA(date, ra, long), dec * Math.PI/180, lat * Math.PI/180) > 0;
    }
    return certainVisible == 1;
  }

  const RAStr = "18:37:43.7"; //Vega
  const decStr = "+38:48:33.5";
  const ra = RAToDeg(RAStr);
  const dec = DecToDeg(decStr);
  const result = calcAltAz(ra, dec, observerLocation.latitude, observerLocation.longitude, observingDate);
  
  /*
  const [visibleStars, setVisibleStars] = useState([]);

  useEffect(() => {
    const visibleStars = starCatalog.filter(star => isStarVisible(star, lst));

    setVisibleStars(visibleStars);
  }, [observerLocation, observingDate]);*/
  const visibleStars = starCatalog.filter(function(star){
    return isStarVisible(star.RA, star.DEC, observerLocation.latitude, observerLocation.longitude, observingDate);
  });

  return (
    <div className="App">
      <header className="App-header">
        <p>
          wow, constellations are so cool!
        </p>
        <p>RA: {ra}, Dec: {dec}</p>
        <p>Altitude: { result[0].toFixed(3) } degrees, Azimuth: { result[1].toFixed(3) } degrees</p>
        <p>Is visible? { isStarVisible(RAStr, decStr, observerLocation.latitude, observerLocation.longitude, observingDate) ? "true":"false" }</p>
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
