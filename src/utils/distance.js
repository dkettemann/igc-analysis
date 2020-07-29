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
