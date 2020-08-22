'use strict';

async function runAlgorithms(track) {
    latLong = track.latLong;
    distances = calcDistances(latLong);
    let curves = await curveDetection(track.latLong, distances, 0.3);
    results = getResultObject(curves);
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

function getResultObject(curves){
    return {
        igcHeader: getIGCHeader(),
        shapeDetection: {
            curve90: curves[0],
            curve180: curves[1],
            circle: null,
            eight: null
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

function getIGCHeader(){
    let igcHeader = getIGCHeaderFrame();
    return setHeaderData(igcHeader);
}

function getIGCHeaderFrame(){
    return {
        date: moment(igcFile.recordTime[0]).format('LL'),
        pilotName: null,
        gliderType: null,
        gliderID: null,
        gpsDatum: null,
        firmwareVersion: null,
        hardwareVersion: null,
        flightRecorderType: null,
        gpsTracker: null,
        pressureSensor: null
    };
}

function setHeaderData(igcHeader) {
    for (let headerIndex = 0; headerIndex < igcFile.headers.length; headerIndex++) {
        const name = igcFile.headers[headerIndex].name;
        const value = igcFile.headers[headerIndex].value;
        console.log(name + " --> " + value);
        switch (name) {
            case "Pilot":
                igcHeader.pilotName = value;
                break;
            case "Glider type":
                igcHeader.gliderType = value;
                break;
            case "Glider ID":
                igcHeader.gliderID = value;
                break;
            case "GPS Datum":
                igcHeader.gpsDatum = value;
                break;
            case "Firmware version":
                igcHeader.firmwareVersion = value;
                break;
            case "Hardware version":
                igcHeader.hardwareVersion = value;
                break;
            case "Flight recorder type":
                igcHeader.flightRecorderType = value;
                break;
            case "GPS":
                igcHeader.gpsTracker = value;
                break;
            case "Pressure sensor":
                igcHeader.pressureSensor = value;
                break;
        }
    }
    return igcHeader;
}
