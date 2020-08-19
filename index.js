async function loadFileByURL(fileURL) {
    const res = await fetch(fileURL);
    const blob = await res.blob();
    await handleFileInput(blob);
}

const fileURL = 'https://api.igc.onestudies.com/api/igc/getFile.php';

window.onload = async () => {
    await loadFileByURL(fileURL);
    // runCircleDetection();
}

async function runCircleDetection() {
    if (showCpuUsageWarning) openModal();
    const circles = await circleDetection();
    let results = {
        igcHeader: {
            date: "August 21, 2019",
            pilotName: "Uli",
            gliderType: "BGD Cure",
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
    }
    console.group('algorithm results');
    console.log('%c IGC Header', 'color: gray', results.igcHeader)
    console.log('%c Shape Detection', 'color: blue', results.shapeDetection)
    console.log('%c Additional Data', 'color: green', results.additionalData)
    console.groupEnd();
}
