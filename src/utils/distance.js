/**
 * Calculates the distance between two geographic coordinates, given through track indices, in kilometers.
 * @param {number} p0 A track index.
 * @param {number} p1 A track index.
 * @returns {number} The distance in kilometers.
 */
function distance(p0, p1) {
    if(latLong[p0]===undefined || latLong[p1]===undefined) console.log("distance(" + p0 + ", " + p1 + "): invalid coordinates passed");
    const lat1 = latLong[p1][0], lon1 = latLong[p1][1], lat2 = latLong[p0][0], lon2 = latLong[p0][1];
    const p = 0.017453292519943295;    // Math.PI / 180
    const c = Math.cos;
    const a = 0.5 - c((lat2 - lat1) * p)/2 +
        c(lat1 * p) * c(lat2 * p) *
        (1 - c((lon2 - lon1) * p))/2;

    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

/**
 * Calculates the distance between two geographic coordinates, given through latitude and longitude, in kilometers.
 * @param {number[]} p0 A coordinate with lat and lon.
 * @param {number[]} p1 A coordinate with lat and lon.
 * @returns {number} The distance in kilometers.
 */
function geographicDistance(p0, p1) {
    const lat1 = p0[0];
    const lon1 = p0[1];
    const lat2 = p1[0];
    const lon2 = p1[1];
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
    for (let i = idx; i < distances.length - 1; i++) {
        const arr = distances.slice(idx, i + 1);
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
