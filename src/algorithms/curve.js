const _curves = {
    c90: [],
    c180: []
};
// Cache previous curve scores for optimization with Greedy Local Search (Hill Climbing).
// https://courses.cs.washington.edu/courses/cse573/12sp/lectures/04-lsearch.pdf
let _curve90PreviousScore = 0,
    _curve180PreviousScore = 0;

/**
 A 90-degree curve should be defined as a broken line of 2km length, while start- and end point
 have a distance of 1.3km to 1.5km between themselves and at least 0.9km to the turning point.
 */
async function curveDetection(latLong, distances, radius) {
    const curves = [[], []];
    console.time("curveDetection");
    // console.log(Math.max(...distances));
    const result = await findCurves(latLong, distances, 1, radius);
    result.c90.forEach(idx => {
        curves[0].push([
            idx,
            getNextPointRecursive(radius, idx, distances),
            getNextPointRecursive(2 * radius, idx, distances)
        ]);
    })
    result.c180.forEach(idx => {
        curves[1].push([
            idx,
            getNextPointRecursive(radius, idx, distances),
            getNextPointRecursive(2 * radius, idx, distances)
        ]);
    })
    console.timeEnd("curveDetection");
    return curves;
}

/**
 * Identifies both 90-degree and 180-degree curves.
 * @param {[number, number]} latLong
 * @param {number[]} distances
 * @param {number} stepSize
 * @param radius
 * @returns {{curve180: [], curve90: []}} The curve detection result object with 90-degree and 180-degree curves.
 */
async function findCurves(latLong, distances, stepSize, radius) {
    let p0 = 0;
    for (p0; p0 < distances.length; p0 += stepSize) {
        const p1 = getNextPointRecursive(radius, p0, distances),
            p2 = getNextPointRecursive(radius, p1, distances);

        if (p2 < 0) break; // no next point exists
        if (p0 % 2000 === 0) await domUpdate();

        const distP0P1 = distance(p1, p0),
            distP1P2 = distance(p2, p1),
            distP0P2 = distance(p2, p0);
        if (curve90Criterion(distP0P1, distP1P2, distP0P2, radius)) {
            onCurve90Detected(p0, distP0P1, distP1P2, distP0P2, radius);
        } else if (curve180Criterion(distP0P1, distP1P2, distP0P2, radius)) {
            onCurve180Detected(p0, distP0P2, radius);
        }

        // runtime optimization - skip points until distP0P1 might fulfill the criteria
        const skipIndices = Math.floor((radius - distP0P1 - radius * curveMaxDeviation) / maxPointDistance)
            - stepSize;
        if (skipIndices > 0 && p0 + skipIndices + stepSize) p0 += skipIndices;
    }
    return _curves;
}

/**
 * Handles a 90-degree curve.
 */
function onCurve90Detected(p0, distP0P1, distP1P2, distP0P2, radius){
    const score = get90DegreeScore(distP0P1, distP1P2, distP0P2, radius);
    _curves.c90.push(p0);
    if (_curves.c90.length > 1)
        removeDuplicateCurves(latLong, radius, _curve90PreviousScore, score, _curves.c90);
    _curve90PreviousScore = score;
}

/**
 * Handles a 180-degree curve.
 */
function onCurve180Detected(p0, distP0P2, radius){
    const score = get180DegreeScore(distP0P2, radius);
    _curves.c180.push(p0);
    if (_curves.c180.length > 1)
        removeDuplicateCurves(latLong, radius, _curve180PreviousScore, score, _curves.c180);
    _curve180PreviousScore = score;
}

/**
 * Checks if a line through p0, p1 and p2 is a 90-degree curve.
 * @returns {boolean} True if the points form a 90-degree curve.
 */
function curve90Criterion(distP0P1, distP1P2, distP0P2, radius) {
    return (distP0P1 + distP1P2) > 2 * (1 - curveMaxDeviation) * radius
        && distP0P2 > (1.44 * (1 - curveMaxDeviation)) * radius
        && distP0P2 < (1.44 * (1 + curveMaxDeviation)) * radius;
}

/**
 * Checks if a line through p0, p1 and p2 is a 180-degree curve.
 * @returns {boolean} True if the points form a 180-degree curve.
 */
function curve180Criterion(distP0P1, distP1P2, distP0P2, radius) {
    return (distP0P1 + distP1P2) > 1.86 * radius && distP0P2 < 0.2 * radius;
}

/**
 * Calculates the score for a 90-degree curve.
 * @returns {number}
 */
const get90DegreeScore = (distP0P1, distP1P2, distP0P2, radius) =>
    (1.44 * radius - distP0P2) ** 2 - (distP0P1 - distP1P2) ** 2;

/**
 * Calculates the score for a 90-degree curve.
 * @returns {number}
 */
const get180DegreeScore = (distP0P2, radius) => radius - distP0P2;


/**
 * Verify that one curve is not detected twice. If that is the case, remove the one with the lower score.
 */
function removeDuplicateCurves(latLong, radius, previousScore, currentScore, arr) {
    const p0 = arr[arr.length - 2];
    const p1 = arr[arr.length - 1];
    if (distance(p1, p0) > radius) return false;
    if (previousScore > currentScore) arr.splice(-1, 1) // remove current element
    else arr.splice(-2, 1) // remove previous element
    return true;
}

/**
 * Measures distance in km from every nth track point up to point n + stepSize.
 * @returns {[]}
 * @param {[number, number]} latLong latitude and longitude of every track log point in an array
 * @param {number} stepSize define if subsequent points should be used (stepSize = 1) or every nth
 * point (stepSize = n)
 */
function calcDistances(latLong, stepSize = 1) {
    const distances = [];
    for (let i = stepSize; i < latLong.length; i += stepSize) {
        const dist = distance(i, i - stepSize);
        distances.push(dist);
    }
    return distances;
}

/**
 * Measures the traveled distance through all points of the track log from p0 to and including p1.
 * @returns {*}
 */
function coveredDistance(distances, p0, p1) {
    const p0ToP1 = distances.slice(p0, p1 + 1);
    return p0ToP1.reduce((a, b) => a + b, 0);
}
