let mapControl;
let curve90 = [],
    curve180 = [],
    circles = [];



async function displayResults(results, mapCtrl) {
    mapControl = mapCtrl;
    setOutput("curve detection completed.");
    for (const [algorithmName, algorithmResults] of Object.entries(results)) {
        if (algorithmName === 'curveDetection') {
            curve90 = algorithmResults[0];
            curve180  = algorithmResults[1];
            if (curve90.length > 0) {
                setCheckboxValue(curve90Checkbox, true);
                setMarkers(curve90, "curve90")
            } else curve90Checkbox.disabled = true;
            if (curve180.length > 0){
                setCheckboxValue(curve180Checkbox, true);
                setMarkers(curve180, "curve180")
            } else curve180Checkbox.disabled = true;
        }
    }
}

function setMarkers(positionArray, layerName=""){
    for (let key in positionArray) {
        mapControl.addMarkerTo(layerName, positionArray[key]);
    }
}

function displayCircles(algorithmOutput){
    circles = algorithmOutput;
    for (let circle in circleIndices) {
        mapControl.addMarkerTo("circles", latLong[circleIndices[circle][0]]);
        const circlePoints = latLong.slice(circleIndices[circle][0], circleIndices[circle][1])
        mapControl.addCircle(circlePoints);
    }
    if(circles.length === 0) circleCheckbox.disabled = true;
    else circleCheckbox.disabled = false;
}

circleCheckbox.addEventListener( 'change', () => {
    if(circleCheckbox.checked)
        circles.forEach(circle => setMarkers(circle, "circles"))
    else
        mapControl.clearLayer("circles");

});

curve90Checkbox.addEventListener( 'change', () => {
    if(curve90Checkbox.checked)
        setMarkers(curve90, "curve90");
    else
        mapControl.clearLayer("curve90");
});

curve180Checkbox.addEventListener( 'change', () => {
    if(curve180Checkbox.checked)
        setMarkers(curve180, "curve180");
    else
        mapControl.clearLayer("curve180");
});
