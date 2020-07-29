/**
 A 90° curve should be defined as a broken line of 2km length, while start- and end point
 have a distance of 1.3km to 1.5km between themselves and at least 0.9km to the turning point.
 */
async function curveDetection(latLong, distances, radius) {
    let curves = [[], []];
    console.time("curveDetection");
    // console.log(Math.max(...distances));
    const result = await findCurves(latLong, distances, 1, radius);
    result.curve90.forEach(idx => {
        // curves[0].push(latLong[idx]);
        curves[0].push(latLong[nextPointInDistance(radius, idx, distances)]);
        // curves[0].push(latLong[nextPointInDistance(2 * radius, idx, distances)]);
    })
    result.curve180.forEach(idx => {
        // curves[1].push(latLong[idx]);
        curves[1].push(latLong[nextPointInDistance(radius, idx, distances)]);
        // curves[1].push(latLong[nextPointInDistance(2 * radius, idx, distances)]);
    })
    console.timeEnd("curveDetection");
    return curves;
}

/**
 * measure distances in km from every nth track log point to point n + stepSize
 * @returns {[]}
 * @param {[number, number]} latLong latitude and longitude of every track log point in an array
 * @param {number} stepSize define if subsequent points should be used (stepSize = 1) or every nth point (stepSize = n)
 */
function calcDistances(latLong, stepSize = 1) {
    let distances = [];
    for (let i = stepSize; i < latLong.length; i += stepSize) {
        const dist = distance(i, i-stepSize);
        distances.push(dist);
    }
    return distances;
}

/**
 * Calculates the mean of an array of numbers.
 * @param values numbers for which the mean should be calculated.
 */
function average(values) {
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = (sum / values.length) || 0;

    console.log(`The sum is: ${sum}. The average is: ${avg}.`);
}

/**
 * Finds the next track log point with a distance greater than dist starting from index idx in distances.
 * @returns {number}
 */
function nextPointInDistance(dist, idx, distances) {
    for (let i = idx+1; i < distances.length; i++) {
        const arr = distances.slice(idx, i);
        const sum = arr.reduce((a, b) => a + b, 0);
        if (sum > dist) return i;
    }
    return -1;
}

/**
 * Measures the traveled distance through all points of the track log from p0 to and including p1.
 * @returns {*}
 */
function coveredDistance(distances, p0, p1){
    const p0ToP1 = distances.slice(p0, p1+1);
    return p0ToP1.reduce((a, b) => a + b, 0);
}

/**
 *
 * @param {[number, number]} latLong
 * @param {number[]} distances
 * @param {number} stepSize
 * @returns {{curve180: [], curve90: []}}
 */
async function findCurves(latLong, distances, stepSize, radius) {
    let curves = {
        curve90: [],
        curve180: []
    };
    let i = 0, curve90PreviousScore = 0, curve180PreviousScore = 0;
    for (i = 0; i < distances.length; i += stepSize) {
        // get three successive points with one radius distance
        const p0 = i, p1 = nextPointInDistance(radius, i, distances), p2 = nextPointInDistance(radius, p1, distances);
        if(p2 < 0) break; // point would be outside of the track log
        if (p0 % 2000 === 0) {
            await domUpdate();
        }
        const distP1P0 = distance(p1, p0),
            distP2P1 = distance(p2, p1),
            distP2P0 = distance(p2, p0),
            sum = distP1P0 + distP2P1,
            deviation = 0.2;
        if(sum > 1.875 * radius && distP2P0 < (1.44 + deviation) * radius && distP2P0 > (1.44 - deviation) * radius) {
            const score = (1.44 * radius - distP2P0) * (1.44 * radius - distP2P0) - (distP1P0 - distP2P1) * (distP1P0 - distP2P1);
            // console.log("new maximum with dist " + distP2P0 + " and score " + score);
            curves.curve90.push(i);
            const c90 = curves.curve90;
            if(c90.length > 1) removeDuplicateCurves(latLong, radius, curve90PreviousScore, score, c90[c90.length-2], c90[c90.length-1], c90);
            curve90PreviousScore = score;
        }
        if(sum > 1.86 * radius && distP2P0 < 0.2 * radius) {
            // console.log("180 curve with p2p0 " + distP2P0);
            const score = radius - distP2P0;
            curves.curve180.push(i);
            const c180 = curves.curve180;
            if(c180.length > 1) removeDuplicateCurves(latLong, radius, curve180PreviousScore, score, c180[c180.length-2], c180[c180.length-1], c180);
            curve180PreviousScore = score;
        }
    }
    return curves;
}

/**
 * Verify that one curve is not detected twice. If that is the case, remove the one with the lower score
 */
function removeDuplicateCurves(latLong, radius, previousScore, currentScore, p0, p1, arr) {
    if(distance(p1, p0) > radius) return false;
    if(previousScore > currentScore) arr.splice(-1, 1) // remove the current element (last element in the array)
    else arr.splice(-2, 1) // remove the previous element (second last in the array)
    return true;
}
