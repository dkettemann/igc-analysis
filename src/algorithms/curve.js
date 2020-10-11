/**
 A 90° curve should be defined as a broken line of 2km length, while start- and end point
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
            nextPointInDistance(radius, idx, distances),
            nextPointInDistance(2 * radius, idx, distances)
        ]);
    })
    result.c180.forEach(idx => {
        curves[1].push([
            idx,
            nextPointInDistance(radius, idx, distances),
            nextPointInDistance(2 * radius, idx, distances)
        ]);
    })
    console.timeEnd("curveDetection");
    return curves;
}

/**
 * measure distances in km from every nth track log point to point n + stepSize
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

/**
 *
 * @param {[number, number]} latLong
 * @param {number[]} distances
 * @param {number} stepSize
 * @returns {{curve180: [], curve90: []}}
 */
async function findCurves(latLong, distances, stepSize, radius) {
    const curves = {
        c90: [],
        c180: []
    };
    let i = 0, curve90PreviousScore = 0, curve180PreviousScore = 0;
    for (i = 0; i < distances.length; i += stepSize) {
        // get three successive points with one radius distance
        const p0 = i,
            p1 = nextPointInDistance(radius, i, distances),
            p2 = nextPointInDistance(radius, p1, distances);
        if (p2 < 0) break; // point would be outside of the track log
        if (p0 % 2000 === 0) {
            await domUpdate();
        }
        const distP1P0 = distance(p1, p0),
            distP2P1 = distance(p2, p1),
            distP2P0 = distance(p2, p0),
            sum = distP1P0 + distP2P1;

        if (sum > 2 * (1 - curveMaxDeviation) * radius
            && distP2P0 > (1.44 * (1 - curveMaxDeviation)) * radius
            && distP2P0 < (1.44 * (1 + curveMaxDeviation)) * radius) {
            const score = (1.44 * radius - distP2P0) ** 2 - (distP1P0 - distP2P1) ** 2;
            curves.c90.push(i);

            if (curves.c90.length > 1)
                removeDuplicateCurves(latLong, radius, curve90PreviousScore, score, curves.c90);
            curve90PreviousScore = score;
        }
        if (sum > 1.86 * radius && distP2P0 < 0.2 * radius) {
            const score = radius - distP2P0;
            curves.c180.push(i);
            if (curves.c180.length > 1)
                removeDuplicateCurves(latLong, radius, curve180PreviousScore, score, curves.c180);

            curve180PreviousScore = score;
        }
    }
    return curves;
}

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
