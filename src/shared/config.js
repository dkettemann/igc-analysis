const serverAddress = "https://api.igc.onestudies.com/";
const displayDefaultFileOnStartup = false;

// --- CPU usage ---
let domUpdateInterval = 2000; // At least every n milliseconds, the DOM needs to be updated
const runtimeModalTimeout = 4000; // The runtime info modal will be shown after this timeout, if the algorithms are still running

// --- Algorithm parameters ---
const curveMaxDeviation = 0.18;
const curve180MaxGap = 0.2;
const circleMaxLength = 0.5;
const circleMaxGap = 0.01; // maximum distance between start- and endPoint
const circleDiameterMaxDeviation = 0.25;
const maxEightGapPercentage = 0.1;
// The angle θ between two subsequent vectors in a turn needs to fit between the below defined min and max angles.
// e.g. for a circle of 10 vectors (11 different points) the average angle should be 36° (360 / 10)
const thetaMinValue = 3;
const thetaMaxValue = 60;
