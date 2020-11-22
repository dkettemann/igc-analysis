'use strict';

async function runAlgorithms(track) {
    latLong = track.latLong;
    distances = calcDistances(latLong);
    bearings = await getBearings();
    maxPointDistance = Math.max(...distances);
    const curves = await curveDetection(track.latLong, distances, 0.3, false);
    results = getResultObject(curves);
    await displayResults(results, mapControl)
    results.shapeDetection.circle = await circleDetection(true);
    // results.shapeDetection.circle = await circleDetection(false);
    results.shapeDetection.eight = await eightDetection();
    console.log(results)
    return results;
}

async function pauseCalculations() {
    await domUpdate();
    await sleep(calculationSlowdown);
}

function getResultObject(curves) {
    return {
        igcHeader: getIGCHeader(),
        additionalData: getKeyFigures(),
        shapeDetection: {
            curve90: curves[0],
            c180: curves[1],
            circle: null,
            eight: null
        }
    };
}

function getIGCHeader() {
    const igcHeader = getIGCHeaderFrame();
    return setHeaderData(igcHeader);
}

function getIGCHeaderFrame() {
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
