const serverAddress = "https://api.igc.onestudies.com/";
const displayDefaultFileOnStartup = false;

// --- CPU usage ---
let domUpdateInterval = 2000; // Every n iterations of an algorithm, the DOM is updated
let calculationSlowdown = 100;
const showCpuUsageWarning = false; // True will enable the modal popup to warn the user about high cpu usage

// --- Algorithm parameters ---
const curveMaxDeviation = 0.05;
const circleMaxGap = 0.015; // maximum distance between start- and endPoint
const circleDiameterMaxDeviation = 0.25;

// The angle θ between two subsequent vectors in a turn needs to fit between the below defined min and max angles.
// e.g. for a circle of 10 vectors (11 different points) the average angle should be 36° (360 / 10)
const thetaMinValue = 3;
const thetaMaxValue = 60;
