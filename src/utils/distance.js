/**
 * Calculates the distance between two geographic coordinates in kilometers.
 * @param p1
 * @param p2
 * @returns {number}
 */
function distance(p1, p2) {
    if(latLong[p1]===undefined || latLong[p2]===undefined) console.log("distance(" + p1 + ", " + p2 + "): invalid coordinates passed");
    const lat1 = latLong[p2][0], lon1 = latLong[p2][1], lat2 = latLong[p1][0], lon2 = latLong[p1][1];
    const p = 0.017453292519943295;    // Math.PI / 180
    const c = Math.cos;
    const a = 0.5 - c((lat2 - lat1) * p)/2 +
        c(lat1 * p) * c(lat2 * p) *
        (1 - c((lon2 - lon1) * p))/2;

    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
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
 * Calculates the mean of an array of numbers.
 * @param values numbers for which the mean should be calculated.
 */
function average(values) {
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = (sum / values.length) || 0;

    console.log(`The sum is: ${sum}. The average is: ${avg}.`);
}
