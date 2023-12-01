export const observerLocation = {
  latitude: 34.017795,  // USC Coordinates: 34.017795, -118.297777
  longitude: -118.297777
};
export const observingDate = new Date(Date.UTC(2023, 11, 2, 3, 30, 0, 0));  // Use the current date

//parsing functions
export function RAToDeg(ra){
  const parts = ra.split(':');
  const hours = parseInt(parts[0]);
  const minutes = parseInt(parts[1]);
  const seconds = parseFloat(parts[2]);
  return (hours + minutes/60 + seconds/3600) * 15;
}
export function DecToDeg(dec){
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
export function calcAlt(LHA, dec, lat){
  return Math.asin(Math.cos(LHA) * Math.cos(dec) * Math.cos(lat) + Math.sin(dec) * Math.sin(lat));
}

//function to calculate azimuth given local hour angle, declination, and latitude in radians
//also returns in radians, 0 to 2PI
export function calcAz(LHA, dec, lat){
  let az = Math.atan2(-Math.sin(LHA), Math.tan(dec) * Math.cos(lat) - Math.sin(lat) * Math.cos(LHA));
  if(az < 0){
    az += Math.PI * 2;
  }
  return az;
}
  
//calculates the altitude and azimuth of a star relative to an observer's position
//taken from https://aa.usno.navy.mil/faq/alt_az (uses GMST instead of GAST though)
//returns both in degrees (altitude: -90 to +90, azimuth: 0 to 360)
export function calcAltAz(ra, dec, lat, long, date){
  //calculating local hour angle
  const LHA = calcLHA(date, ra, long);
  //converting things to radians for trig calculations
  const rDec = dec * Math.PI/180;
  const rLat = lat * Math.PI/180;

  //REVERSED FOR PROJECTION (azimuth, then altitude)
  return [calcAz(LHA, rDec, rLat) * 180/Math.PI, calcAlt(LHA, rDec, rLat) * 180/Math.PI];
}