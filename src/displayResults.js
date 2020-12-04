let curve90 = [],
    curve180 = [];


async function displayResults(results) {
    curve90 = results.shapeDetection.curve90;
    curve180 = results.shapeDetection.curve180;
    setDisabledProperty();
    for (const algorithm of algorithms) {
        displayShape(algorithm);
    }
}

function setDisabledProperty() {
    for (const algorithm of algorithms) {
        if (arrayIsEmpty(algorithm.result)) algorithm.checkbox.disabled = true;
    }
}

function displayShape(algorithm) {
    for (const shape of algorithm.result) {
        if (algorithm.checkbox.checked) mapControl.addMarkerTo(algorithm.name, latLong[shape[0]]);
        const points = latLong.slice(shape[0], lastElementOfArray(shape) + 1);
        mapControl.addShape(points, algorithm.color);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    for (const algorithm of algorithms) {
        algorithm.checkbox.addEventListener('change', () => {
            storePreference(algorithm.name, algorithm.checkbox.checked);
            if (!mapControl) return;
            if (algorithm.checkbox.checked) {
                displayShape(algorithm);
            } else {
                mapControl.clearLayer(algorithm.name);
            }
        });
    }

    curveAlgorithm.addEventListener('change', () => {
        storePreference("curveAlgorithm", curveAlgorithm.value);
        resetMap();
        displayIgc(mapControl);
        runAlgorithms(igcFile);
    });

    circleAlgorithm.addEventListener('change', () => {
        storePreference("circleAlgorithm", circleAlgorithm.value);
        resetMap();
        displayIgc(mapControl);
        runAlgorithms(igcFile);
    });

});