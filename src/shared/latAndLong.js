/**
 * Calculates the sum of all angles between subsequent vectors of a turn.
 */
function totalTurningAngle(p0){
    let angle = 0;
    while (validTurningAngle(p0, p0+1) && p0 < latLong.length - 2) {
        angle += Math.abs(getAngle(p0, p0+1));
        p0++;
    }
    return angle;
}

/**
 * Calculates all bearings once.
 */
function getBearings(){
    bearings = [];
    for (let i = 0; i < latLong.length - 1; i++) {
        bearings.push(getBearing(latLong[i], latLong[i+1]))
    }
    return bearings;
}

/**
 * Calculates the angle between the bearing of two points:
 * The calculation does not take into account the impact of the earth's curvature (which is very little).
 */
function getAngle(p0, p1) {
    return bearings[p0] - bearings[p1];
}

/**
 * Calculates a degree value with minutes for a given degree value.
 */
function getDegreeMinutes(degreeValue) {
    const wholeDegrees = Math.floor(degreeValue);
    const minuteValue = (60 * (degreeValue - wholeDegrees)).toFixed(3);
    return wholeDegrees + '\u00B0\u00A0' + minuteValue + '\u00B4';
}

/**
 * Generates a string representation for a given position
 * @param {number[]} position latitude and longitude
 * @returns {string}
 */
function getPositionString(position) {
    return getLatitudeString(position) + ",   " + getLongitudeString(position);
}

/**
 * Generates a string representation for a given latitude.
 */
function getLatitudeString(position){
    const positionLatitude = getDegreeMinutes(Math.abs(position[0]));
    if (position[0] > 0) {
        return positionLatitude + "N";
    } else {
        return positionLatitude + "S";
    }
}

/**
 * Generates a string representation for a given longitude.
 */
function getLongitudeString(position){
    const positionLongitude = getDegreeMinutes(Math.abs(position[1]));
    if (position[1] > 0) {
        return positionLongitude + "E";
    } else {
        return positionLongitude + "W";
    }
}