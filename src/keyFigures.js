function getKeyFigures() {
    return {
        flightTime: getFlightTime(),
        totalDistance: getTotalDistance(),
        maxSpeed: getMaxSpeed(),
        minAltitude: getMinAltitude(),
        maxAltitude: getMaxAltitude(),
        maxAltitudeAboveStart: getMaxAltitudeAboveStart(),
        startLocation: getStartLocation(),
        landingLocation: getLandingLocation(),
        startLandingDistanceInKM: getStartLandingDistanceKM()
    }
}

function getFlightTime() {
    const firstRecord = igcFile.recordTime[0];
    const lastRecord = igcFile.recordTime[igcFile.recordTime.length-1];
    const flightTimeMS = moment(lastRecord).diff(moment(firstRecord));

    return moment(flightTimeMS).format('HH:mm:ss');
}

function getTotalDistance() {
    console.log(latLong[0])
    return distances.reduce((a, b) => a + b, 0);
}

function getMaxSpeed() {
    if(igcFile.recordTime.length < 1) return null;
    let maxSpeed = 0;
    let moments = [ moment(igcFile.recordTime[0]) ];
    for (let i = 0; i < distances.length; i++) {
        moments.push(moment(igcFile.recordTime[i+1])); // recordTime[i+1] corresponds to distances[i]
        const h = moments[i+1].diff(moments[i]) / 1000 / 60 / 60;
        const km = distances[i];
        if ((km/h) > maxSpeed) maxSpeed = km/h;
    }
    return maxSpeed;
}

function getMinAltitude() {
    let minAltitude = Number.MAX_VALUE;
    for (let i = 0; i < igcFile.gpsAltitude.length; i++) {
        const altitude = igcFile.gpsAltitude[i];
        if (altitude < minAltitude) minAltitude = altitude;
    }
    return minAltitude;
}

function getMaxAltitude() {
    let maxAltitude = Number.MIN_VALUE;
    for (let i = 0; i < igcFile.gpsAltitude.length; i++) {
        const altitude = igcFile.gpsAltitude[i];
        if (altitude > maxAltitude) maxAltitude = altitude;
    }
    return maxAltitude;
}

function getMaxAltitudeAboveStart() {
    console.log(igcFile.gpsAltitude[igcFile.gpsAltitude.length-1])
    return getMaxAltitude() - igcFile.gpsAltitude[0];
}

function getStartLocation() {
    return "Bremmer Calmont";
}

function getLandingLocation() {
    return "Nehren";
}

function getStartLandingDistanceKM() {
    return +distance(0, distances.length).toFixed(2);
}
