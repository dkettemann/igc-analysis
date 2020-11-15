const _curves = {
    c90: [],
    c180: []
};
// Cache previous curve scores for optimization with Greedy Local Search (Hill Climbing).
// https://courses.cs.washington.edu/courses/cse573/12sp/lectures/04-lsearch.pdf
let _curve90PreviousScore = 0,
    _curve180PreviousScore = 0;

async function curveDetection(latLong, distances, radius) {
    const curves = [[], []];
    console.time("curveDetection");
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

async function findCurves(latLong, distances, stepSize, radius) {
    for (let p0 = 0; p0 < distances.length; p0 += stepSize) {
        const p1 = getNextPointRecursive(radius, p0, distances),
            p2 = getNextPointRecursive(radius, p1, distances);

        if (p2 < 0) break; // no next point exists
        if (p0 % domUpdateInterval === 0) await domUpdate();

        const distP0P1 = distance(p1, p0),
            distP1P2 = distance(p2, p1),
            distP0P2 = distance(p2, p0);
        // TODO: common straight-line check
        if (isCurve90(distP0P1, distP1P2, distP0P2, radius)) {
            onCurve90Detected(p0, distP0P1, distP1P2, distP0P2, radius);
        } else if (isCurve180(distP0P1, distP1P2, distP0P2, radius)) {
            onCurve180Detected(p0, distP0P2, radius);
        }

        // runtime optimization - skip points until distP0P1 might fulfill the criteria
        const skipIndices = Math.floor((radius - distP0P1 - radius * curveMaxDeviation) / maxPointDistance)
            - stepSize;
        if (skipIndices > 0 && p0 + skipIndices + stepSize) p0 += skipIndices;
    }
    return _curves;
}

function onCurve90Detected(p0, distP0P1, distP1P2, distP0P2, radius) {
    const score = get90DegreeScore(distP0P1, distP1P2, distP0P2, radius);
    _curves.c90.push(p0);
    if (_curves.c90.length > 1)
        removeDuplicates(latLong, radius, _curve90PreviousScore, score, _curves.c90);
    _curve90PreviousScore = score;
}

function onCurve180Detected(p0, distP0P2, radius) {
    const score = get180DegreeScore(distP0P2, radius);
    _curves.c180.push(p0);
    if (_curves.c180.length > 1)
        removeDuplicates(latLong, radius, _curve180PreviousScore, score, _curves.c180);
    _curve180PreviousScore = score;
}

// TODO: radius is not a very good variable name
function isCurve90(distP0P1, distP1P2, distP0P2, radius) {
    return (distP0P1 + distP1P2) > 2 * (1 - curveMaxDeviation) * radius
        && distP0P2 > (1.44 * (1 - curveMaxDeviation)) * radius
        && distP0P2 < (1.44 * (1 + curveMaxDeviation)) * radius;
}

// TODO: use maximum deviation parameter
function isCurve180(distP0P1, distP1P2, distP0P2, radius) {
    return (distP0P1 + distP1P2) > 1.86 * radius && distP0P2 < 0.2 * radius;
}

function get90DegreeScore(distP0P1, distP1P2, distP0P2, radius) {
    return (1.44 * radius - distP0P2) ** 2 - (distP0P1 - distP1P2) ** 2;
}

function get180DegreeScore(distP0P2, radius) {
    return radius - distP0P2;
}

function removeDuplicates(latLong, radius, previousScore, currentScore, arr) {
    const p0 = arr[arr.length - 2];
    const p1 = arr[arr.length - 1];
    if (distance(p1, p0) > radius) return false;
    if (previousScore > currentScore) arr.splice(-1, 1) // remove current element
    else arr.splice(-2, 1) // remove previous element
    return true;
}

function calcDistances(latLong, stepSize = 1) {
    const distances = [];
    for (let i = stepSize; i < latLong.length; i += stepSize) {
        const dist = distance(i, i - stepSize);
        distances.push(dist);
    }
    return distances;
}
