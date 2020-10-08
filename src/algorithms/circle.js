let circlesFound = false;

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

    const circles = await findCircles(latLong, distances);

    console.timeEnd("circleDetection");
    const end = window.performance.now();
    const secondsSpent = ((end - start) / 1000).toFixed(3);
    circleDetectionProgress(100);
    circleDetectionOutput(secondsSpent, circles.length);
    displayCircles(circles);
    return circles;
}

/**
 * Finds optimal circles in the track log.
 * @param latLong
 * @param distances
 * @returns {Promise<[]>}
 */
async function findCircles(latLong, distances) {
    let currentCircleCandidates = [];
    circleIndices = [];
    circlesFound = false;

    for (let p0 = 0; p0 < latLong.length; p0++) {
        if (p0 % numberOfCalculations === 0) await updateProgressBar(p0);
        for (let p1 = nextPointInDistance(0.1, p0, distances); p1 < latLong.length; p1++) {
            if (p1 < 0) break; // nextPointInDistance did not find a point
            const distP0P1 = distance(p0, p1);
            const circleCondition1 = distP0P1 < circleMaxGap;

            // check for a circle - the order of conditions minimizes the runtime
            if (circleCondition1 && optimalP1(p0, p1) && circleCondition2(latLong, distances, p0, p1)){
                currentCircleCandidates.push([p0, p1]);
                break;
            }
            // skip as many points as necessary so that the next iteration could possibly close the circle gap
            const skipIndices = Math.floor((distP0P1 - circleMaxGap) / maxPointDistance ) - 1;
            if(skipIndices > 0) p1 = p1 + skipIndices;

            if(p1 >= latLong.length-1 && currentCircleCandidates.length > 0){ // end of loop and there are circle candidates
                    const bestCandidate = getBestCircle(currentCircleCandidates);
                    circles.push([bestCandidate[0], bestCandidate[1]]);
                    circleIndices.push(bestCandidate);
                    p0 = bestCandidate[1]-1; // fast-forward to the end of the chosen circle
                    currentCircleCandidates = [];
            }
        }
    }
    closeModal();
    return circles;
}

/**
 * Awaits the updating of the circle detection progress bar.
 * @param p0
 * @returns {Promise<void>}
 */
async function updateProgressBar(p0){
        if (!circlesFound && circles.length > 0) {
            circlesFound = true;
            setCheckboxValue(circleCheckbox, true);
        }
        await setCircleDetectionProgress(p0, latLong.length);
        await pauseCalculations();
}

/**
 * Finds the best circle in a given array of circles.
 * @param candidatesArray
 * @returns {*} the best circle.
 */
function getBestCircle(candidatesArray){
    let minimalGap = circleMaxGap;
    let optimalCircle;
    for(let key in candidatesArray){
        const value = distance(candidatesArray[key][0], candidatesArray[key][1]);
        if(value < minimalGap) {
            minimalGap = value;
            optimalCircle = candidatesArray[key];
        }
    }
    return optimalCircle;
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
 * Checks if there is a better circle starting at p0 and ending with the succeeding point of p1.
 * Whether a circle is better or not, is determined by the distance gap between start and end point.
 * @returns {boolean} whether the circle including the next point p1+1 is better or not.
 */
function optimalP1(p0, p1){
    return distance(p0, p1) <= distance(p0, p1 + 1) || !isCircle(p0, p1+1);
}

/**
 * Checks whether the track between two points is a circle or not.
 * @returns {boolean}
 */
function isCircle(p0, p1){
    return circleCondition1(p0, p1) && circleCondition2(latLong, distances, p0, p1)
}

/**
 * Every point in the circle should have a distance of at least 1.8 * radius to it's opposing point.
 * @returns {boolean}
 */
function circleCondition2(latLong, distances, p0, p1) {
    const circumference = coveredDistance(distances, p0, p1);
    const radius = circumference / (2 * Math.PI);
    for (let px = p0 + 1; px < p1; px++) {
        const opposite = getOppositeCirclePoint(circumference, px);
        if (opposite < 0) return true; // end of circle is reached
        const oppositeDistance = distance(px, opposite);
        if (oppositeDistance < (1 - circleDiameterMaxDeviation) * radius * 2) {
            return false;
        }
    }
    return true;
}

function getOppositeCirclePoint(circumference, px){
    return nextPointInDistance(circumference / 2, px, distances);
}
