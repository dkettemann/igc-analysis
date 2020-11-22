let curve90 = [],
    curve180 = [],
    circles = [];


async function displayResults(results, mapCtrl) {
    mapControl = mapCtrl;
    curve90 = results.shapeDetection.curve90;
    curve180 = results.shapeDetection.curve180;
    if (curve90.length > 0) {
        setCheckboxValue(curve90Checkbox, true);
        displayCurves(curve90, "curve90")
    } else curve90Checkbox.disabled = true;
    if (curve180.length > 0) {
        setCheckboxValue(curve180Checkbox, true);
        displayCurves(curve180, "curve180");
    } else curve180Checkbox.disabled = true;
}

function displayCurves(curves, layerName = "") {
    for (const curve of curves) {
        mapControl.addMarkerTo(layerName, latLong[curve[1]]); // position 1 is the center of a curve
        const curvePoints = latLong.slice(curve[0], curve[2]+1);
        mapControl.addCurve(curvePoints);
    }
}

function displayThetaCurves(curves, layerName = "") {
    for (const shape of curves) {
        for (const curve of shape) {
            mapControl.addMarkerTo(layerName, latLong[curve[0]]);
            const curvePoints = latLong.slice(curve[0], curve[1]+1);
            mapControl.addCurve(curvePoints);
        }
    }
}

function displayCircles(circles, color) {
    for (const circle of circles) {
        mapControl.addMarkerTo("circles", latLong[circle[0]]);
        const circlePoints = latLong.slice(circle[0], circle[1] + 1);
        mapControl.addShape(circlePoints, color);
    }
    if(circles.length === 0) console.log(false)
    circleCheckbox.disabled = circles.length === 0;
}

function displayEights(eights) {
    for (const item of eights) {
        const points = latLong.slice(item[0], item[1] + 1);
        mapControl.addMarkerTo("eights", latLong[item[0]]);
        mapControl.addShape(points);
    }
}

circleCheckbox.addEventListener('change', () => {
    if (circleCheckbox.checked)
        displayCircles(results.shapeDetection.circle);
    else
        mapControl.clearLayer("circles");

});

curve90Checkbox.addEventListener('change', () => {
    if (curve90Checkbox.checked)
        displayCurves(results.shapeDetection.curve90, "curve90");
    else
        mapControl.clearLayer("curve90");
});

curve180Checkbox.addEventListener('change', () => {
    if (curve180Checkbox.checked)
        displayCurves(results.shapeDetection.curve180, "curve180");
    else
        mapControl.clearLayer("curve180");
});
