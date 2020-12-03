let curve90 = [],
    curve180 = [];


async function displayResults(results, mapCtrl) {
    mapControl = mapCtrl;
    curve90 = results.shapeDetection.curve90;
    curve180 = results.shapeDetection.curve180;
    if (curve90.length > 0) displayCurves(curve90, "curve90", "#32cd32");
    if (curve180.length > 0) displayCurves(curve180, "curve180", "#00FF00");
    for (const algorithm of algorithms) {
        if (arrayIsEmpty(algorithm.result)) algorithm.checkbox.disabled = true;
    }
}

function displayCurves(curves, layerName = "", color) {
    for (const curve of curves) {
        mapControl.addMarkerTo(layerName, latLong[curve[1]]); // position 1 is the center of a curve
        const curvePoints = latLong.slice(curve[0], curve[2] + 1);
        mapControl.addShape(curvePoints, color);
    }
}

function displayThetaCurves(curves, layerName = "") {
    for (const shape of curves) {
        for (const curve of shape) {
            mapControl.addMarkerTo(layerName, latLong[curve[0]]);
            const curvePoints = latLong.slice(curve[0], curve[1] + 1);
            mapControl.addShape(curvePoints, "green");
        }
    }
}

function displayCircles(circles, color) {
    for (const circle of circles) {
        mapControl.addMarkerTo("circles", latLong[circle[0]]);
        const circlePoints = latLong.slice(circle[0], circle[1] + 1);
        mapControl.addShape(circlePoints, color);
    }
    circleCheckbox.disabled = circles.length === 0;
}

function displayEights(eights) {
    for (const item of eights) {
        const points = latLong.slice(item[0], item[1] + 1);
        mapControl.addMarkerTo("eights", latLong[item[0]]);
        mapControl.addShape(points, "yellow");
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    curve90Checkbox.addEventListener('change', () => {
        storePreference("curve90", curve90Checkbox.checked);
        if (curve90Checkbox.checked) {
            displayCurves(results.shapeDetection.curve90, "curve90");
        } else {
            mapControl.clearLayer("curve90");
        }
    });

    curve180Checkbox.addEventListener('change', () => {
        storePreference("curve180", curve180Checkbox.checked);
        if (curve180Checkbox.checked) {
            displayCurves(results.shapeDetection.curve180, "curve180");
        } else {
            mapControl.clearLayer("curve180");
        }
    });

    circleCheckbox.addEventListener('change', () => {
        storePreference("circle", circleCheckbox.checked);
        if (circleCheckbox.checked) {
            displayCircles(results.shapeDetection.circle);
        } else {
            mapControl.clearLayer("circles");
        }

    });

    eightCheckbox.addEventListener('change', () => {
        storePreference("eight", eightCheckbox.checked);
        if (eightCheckbox.checked) {
            displayEights(results.shapeDetection.eight);
        } else {
            mapControl.clearLayer("eights");
        }
    });

    curveAlgorithm.addEventListener('change', () => {
        storePreference("curveAlgorithm", curveAlgorithm.value);
    });

    circleAlgorithm.addEventListener('change', () => {
        storePreference("circleAlgorithm", circleAlgorithm.value);
    });

});

function arrayNotEmpty(array){
    // if array.length returns 0, the statement evaluates to false
    return Array.isArray(array) && array.length;
}

function arrayIsEmpty(array){
    return !arrayNotEmpty(array);
}