/**
 A circle curve should be defined as a broken line of at least 300m length, while start- and end point
 have a distance of at max 30m between themselves. Also, the distance from every point to it's opposing point
 should be at least 1.8 * radius.
 The radius should be calculated from the circumference of the potential circle ( r = C / ( 2 * π ) ).
 Hough Circle Recognition: https://en.wikipedia.org/wiki/Circle_Hough_Transform
 More research: https://www.google.com/search?q=circle+detection+definition+&oq=circle+detection+definition
 */
async function circleDetection() {
    const start = window.performance.now();
    console.time("circleDetection");

    // latLong = latLong.slice(0,1000)
    // distances = distances.slice(0,1000)
    const circles = await findCircles(latLong, distances);

    console.timeEnd("circleDetection");
    const end = window.performance.now();
    const secondsSpent = ((end - start) / 1000).toFixed(3);
    circleDetectionProgress(100);
    circleDetectionOutput(secondsSpent, circles.length);
    displayCircles(circles);
    return circles;
}

async function findCircles(latLong, distances) {
    let circles = [];
    circleIndices = [];
    let circlesFound = false;
    for (let p0 = 0; p0 < latLong.length; p0++) {
        if (p0 % numberOfCalculations === 0) {
            if (!circlesFound && circles.length > 0) {
                circlesFound = true;
                setCheckboxValue(circleCheckbox, true);
            }
            await setCircleDetectionProgress(p0, latLong.length);
            await pauseCalculations();
        }
        for (let p1 = nextPointInDistance(0.1, p0, distances); p1 < latLong.length; p1++) {
            if (p1 < 0) break;
            if (circleCondition1(p0, p1) && circleCondition2(latLong, distances, p0, p1)){
                circles.push([latLong[p0], latLong[p1]]);
                circleIndices.push([p0, p1]);
                p0 = p1-1;
                break;
            }
        }
    }
    closeModal();
    return circles;
}

/**
 * Calculates the circle detection algorithm progress in a percent value between 0 and 100.
 * @returns {number}
 */
function getProgressValue(currentIndex, arrayLength) {
    return (currentIndex / arrayLength) * 100;
}

/**
 * A circle should have a gap smaller than 30m between start and end.
 * @returns {boolean}
 */
function circleCondition1(p0, p1) {
    return distance(p0, p1) < circleMaxGap;
}

/**
 * Every point in the circle should have a distance of at least 1.8 * radius to it's opposing point.
 * @returns {boolean}
 */
function circleCondition2(latLong, distances, p0, p1) {
    const circumference = coveredDistance(distances, p0, p1);
    const radius = circumference / (2 * Math.PI);
    for (let px = p0 + 1; px < p1; px++) {
        const opposite = getOppositeCirclePoint(circumference, px, );
        if (opposite < 0) return true; // end of circle is reached
        const oppositeDistance = distance(px, opposite);
        if (oppositeDistance < (1 - circleDiameterMaxDeviation) * radius * 2) {
            return false;
        }
    }
    return true;
}

function getOppositeCirclePoint(circumference, px){
    // console.log(distances)
    return nextPointInDistance(circumference / 2, px, distances);
}
