async function eightDetection() {
    const start = window.performance.now();
    console.time("eightDetection");

    const eights = await findEights(latLong, distances);

    console.timeEnd("eightDetection");
    const end = window.performance.now();
    const secondsSpent = ((end - start) / 1000).toFixed(3);
    displayEights(eights);
    return eights;
}

async function findEights() {
    const circles = results.shapeDetection.circle;
    const eights = [];
    for (let i = 0; i < circles.length - 1; i++) {
        const diff = circles[i + 1][0] - circles[i][1];
        if (diff < 5) {
            const center1 = getCenterPoint(circles[i][0], circles[i][1]);
            const radius1 = distanceBetweenCoordinates(latLong[circles[i][0]], center1);
            const center2 = getCenterPoint(circles[i + 1][0], circles[i + 1][1]);
            const radius2 = distanceBetweenCoordinates(latLong[circles[i + 1][0]], center2);
            const gap = distanceBetweenCoordinates(center1, center2);
            if (gap >= (radius1 + radius2) || i >= circles.length - 2) {
                // console.log('%c eight found: ', 'color: gray', 'idx ' + circles[i][0] + ' to ' + circles[i + 1][1] + ': ' +
                //     (radius1 + radius2) + ' <= ' + geographicDistance(center1, center2));
                eights.push([circles[i][0], circles[i+1][1]])
            }
        }
    }
    return eights;
}

function getCenterPoint(p0, pn) {
    const px = p0 + Math.floor((pn - p0) / 2);
    return [(latLong[p0][0] + latLong[px][0]) / 2, (latLong[p0][1] + latLong[px][1]) / 2];
}

