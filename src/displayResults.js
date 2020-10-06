let curve90 = [],
    curve180 = [],
    circles = [];


async function displayResults(results, mapCtrl) {
    mapControl = mapCtrl;
    setOutput("curve detection completed.");
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

function displayCurves(positionArray, layerName = "") {
    for (let key in positionArray) {
        let array = positionArray[key];
        mapControl.addMarkerTo(layerName, latLong[array[1]]); // position 1 is the center of a curve
        const curvePoints = latLong.slice(array[0], array[2]);
        mapControl.addCurve(curvePoints);
    }
}

function displayCircles(algorithmOutput) {
    circles = algorithmOutput;
    for (let circle in circleIndices) {
        const circlePoints = latLong.slice(circleIndices[circle][0], circleIndices[circle][1]+1);
        mapControl.addMarkerTo("circles", latLong[circleIndices[circle][0]]);
        mapControl.addCircle(circlePoints);
    }
    if (circles.length === 0) circleCheckbox.disabled = true;
    else circleCheckbox.disabled = false;
}

function displayEights(algorithmOutput) {
    for (let i = 0; i < algorithmOutput.length; i++) {
        const points = latLong.slice(algorithmOutput[i][0], algorithmOutput[i][1]+1);
        mapControl.addMarkerTo("eights", latLong[algorithmOutput[i][0]]);
        mapControl.addCircle(points);
    }
}

circleCheckbox.addEventListener('change', () => {
    if (circleCheckbox.checked)
        displayCircles(circles);
    else
        mapControl.clearLayer("circles");

});

curve90Checkbox.addEventListener('change', () => {
    if (curve90Checkbox.checked)
        displayCurves(curve90, "curve90");
    else
        mapControl.clearLayer("curve90");
});

curve180Checkbox.addEventListener('change', () => {
    if (curve180Checkbox.checked)
        displayCurves(curve180, "curve180");
    else
        mapControl.clearLayer("curve180");
});
