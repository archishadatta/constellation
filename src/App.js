import React, { useEffect, useState } from 'react';
import starCatalog from './starCatalog.json'; // Importing the JSON file
import './App.css';

const App = () => {
  const observerLocation = {
    latitude: 34.017795,  // USC Coordinates: 34.017795, -118.297777
    longitude: -118.297777
  };

  const observingDate = new Date();  // Use the current date
  const J2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0, 0));
  const yearSinceEpoch = (observingDate - J2000)/(1000 * 60 * 60 * 24 * 365); //doesn't account for leap years

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
  function calcAltAz(ra, dec, rpm, dpm, lat, long, date){
    //accounting for proper motion
    ra += rpm * yearSinceEpoch;
    dec += dpm * yearSinceEpoch;
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
  function isStarVisible(ra, dec, rpm, dpm, lat, long, date){
    ra = RAToDeg(ra) + yearSinceEpoch * parseFloat(rpm);
    dec = DecToDeg(dec) + yearSinceEpoch * parseFloat(dpm);
    const certainVisible = isVisibleCertain(dec, lat);
    if(certainVisible === 0){
      return calcAlt(calcLHA(date, ra, long), dec * Math.PI/180, lat * Math.PI/180) > 0;
    }
    return certainVisible === 1;
  }

  //convert altitude and azimuth (given in degrees) to 2D points mapped in a circle of radius R
  //+y corresponds with "down" on screen, +x corresponds with "up" on screen, the center of the circle
  //will be (R, R)
  function AltAzTo2D(alt, az, R){
    alt *= Math.PI/180;
    az *= Math.PI/180;
    const z3 = Math.sin(alt);
    const y3 = Math.cos(az) * Math.cos(alt);
    const x3 = Math.sin(az) * Math.cos(alt);
    return [R * (1 + x3/(z3 + 1)), R * (1 + y3/(z3 + 1))];
  }

  /*const RAStr = "18:37:43.7"; //Vega
  const decStr = "+38:48:33.5";
  const ra = RAToDeg(RAStr);
  const dec = DecToDeg(decStr);
  const result = calcAltAz(ra, dec, observerLocation.latitude, observerLocation.longitude, observingDate);
  */
  /*
  const [visibleStars, setVisibleStars] = useState([]);

  useEffect(() => {
    const visibleStars = starCatalog.filter(star => isStarVisible(star, lst));

    setVisibleStars(visibleStars);
  }, [observerLocation, observingDate]);*/

  const visibleStars = starCatalog.filter(function(star){
    if(star.MAG > 5){
      return false;
    }
    return isStarVisible(star.RA, star.DEC, star["RA PM"], star["DEC PM"], observerLocation.latitude, observerLocation.longitude, observingDate);
  });

  const starCoords = visibleStars.map(function(star){
    const altAz = calcAltAz(RAToDeg(star.RA), DecToDeg(star.DEC), parseFloat(star["RA PM"]), parseFloat(star["DEC PM"]), observerLocation.latitude, observerLocation.longitude, observingDate);
    const coord = AltAzTo2D(altAz[0], altAz[1], 400);
    return coord;
  });

  /*
  return (
    <div className="App">
      <header className="App-header">
        <p>
          wow, constellations are so cool!
        </p>
        <p>RA: {ra}, Dec: {dec}</p>
        <p>Altitude: { result[0].toFixed(3) } degrees, Azimuth: { result[1].toFixed(3) } degrees</p>
        <p>Is visible? { isStarVisible(RAStr, decStr, 0, 0, observerLocation.latitude, observerLocation.longitude, observingDate) ? "true":"false" }</p>
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
  );*/
  return (
    <div className="App">
      <header className="App-header">
        <p>
          wow, constellations are so cool!
        </p>
        <div>
          <h2>visible stars:</h2>
          <svg viewBox = "0 0 800 800" width = "100%">
            {starCoords.map((coord, index) => (
              <circle key={index} cx ={coord[0]} cy = {coord[1]} r ="2" fill = "white"/>
            ))}
          </svg>
        </div>
      </header>
    </div>
  );
};

export default App;
