/**
 * Verify if the bearing angle for p0 and p1 qualifies as a turning movement
 */
function validTurningAngle(p0, p1) {
    if (p1 + 1 >= latLong.length) return false;
    let angle = getAngle(p0, p1);
    angle = (angle + 360.0) % 360.0; // ensure that the resulting angle is a positive number
    return angle > thetaMinValue && angle < thetaMaxValue;
}

/**
 * Calculates the sum of all angles between subsequent vectors of a turn
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
    for (let i = 0; i < latLong.length - 1; i++) {
        bearings.push(getBearing(latLong[i], latLong[i+1]))
    }
    return bearings;
}

/**
 * Calculates the angle between the bearing of two points:
 * The calculation approximates the angle without including of the earth's curvature.
 */
function getAngle(p0, p1) {
    if (latLong[p1 + 1] === undefined) console.log(p0, p1)
    return bearings[p0] - bearings[p1];
}