'use strict';

async function runAlgorithms(track) {
    latLong = track.latLong;
    let result = {
        curveDetection: [],
        circleDetection: [],
    };
    distances = calcDistances(latLong);
    result.curveDetection = await curveDetection(track.latLong, distances, 0.3);
    fetchIGCData();
    // result.circleDetection = circleDetection(track.latLong, distances);
    return result;
}

function fetchIGCData() {
    fetch(serverAddress + 'api/igc/getIGCDocuments.php')
        .then( async response => {
            if (!response.ok) throw new Error("HTTP error " + response.status);
            response = await response.json();
            console.log(response)
        })
}
