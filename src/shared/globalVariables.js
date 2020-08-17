const outputElement = document.querySelector('#curve-detection-output');
const algorithmButtons = document.querySelector('.algorithm-buttons');
const curve90Checkbox = document.querySelector('#curve-90');
const curve180Checkbox = document.querySelector('#curve-180');

const circleDetectionContainer = document.querySelector('.circle-detection');
const circleCheckbox = document.querySelector('#circle-checkbox');
const circlesTimeSpent = document.querySelector('#time-spent-circles');
const circleAlgorithmProgressBar = document.querySelector('#circle-progress');
let chartElement = document.getElementById("barogram-chart");

let latLong = [];
let distances = [];
let circleIndices = [];

let handleFileInput;
let mapControl;
let updateTimeline;
let altitudeConversionFactor = 1.0; // Conversion from metres to required units
