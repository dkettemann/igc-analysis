'use strict';

async function runAlgorithms(track) {
    latLong = track.latLong;
    results = formatResults();
    distances = calcDistances(latLong);
    let result = await curveDetection(track.latLong, distances, 0.3);
    results.shapeDetection.curve90 = result[0];
    results.shapeDetection.curve180 = result[1];
    fetchIGCData();

    updateResultHeaders();
    return results;
}

function fetchIGCData() {
    fetch(serverAddress + 'api/igc/getIGCDocuments.php')
        .then( async response => {
            if (!response.ok) throw new Error("HTTP error " + response.status);
            response = await response.json();
        })
}

async function pauseCalculations(){
    await domUpdate();
    await sleep(calculationSlowdown);
}

function formatResults(){
    return {
        igcHeader: {
            date: null,
            pilotName: null,
            gliderType: null,
            startLocation: "Bremmer Calmont",
            country: "DE",
            gpsTracker: "",
            flightRecorder: ""
        },
        shapeDetection: {
            curve90: curve90,
            curve180: curve180,
            circle: circles,
            eight: ""
        },
        additionalData: {
            flightTime: "6:03",
            totalDistance: "223.1",
            maxSpeed: "76.1",
            maxAltitude: "1223",
            minAltitude: "201",
            maxAltitudeAboveStart: "1022",
            startLocation: "Bremmer Calmont",
            landingLocation: "Nehren",
            startLandingDistance: "7500"
        }
    };
}

function updateResultHeaders(){
    results.igcHeader.date = moment(igcFile.recordTime[0]).format('LL');
    for (let headerIndex = 0; headerIndex < igcFile.headers.length; headerIndex++) {
        const name = igcFile.headers[headerIndex].name;
        const value = igcFile.headers[headerIndex].value;
        console.log(name + " --> " + value);
        switch (name) {
            case "Pilot":
                results.igcHeader.pilotName = value;
                break;
            case "Glider type":
                results.igcHeader.gliderType = value;
                break;
        }
    }
}
