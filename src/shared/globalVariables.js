const outputElement = document.querySelector('#curve-detection-output');
const algorithmButtons = document.querySelector('.algorithm-buttons');
const curve90Checkbox = document.querySelector('#curve-90');
const curve180Checkbox = document.querySelector('#curve-180');

const circleDetectionContainer = document.querySelector('.circle-detection');
const circleCheckbox = document.querySelector('#circle-checkbox');
const circlesTimeSpent = document.querySelector('#time-spent-circles');
const circleAlgorithmProgressBar = document.querySelector('#circle-progress');
const chartElement = document.querySelector('#barogram-chart');
const altitudeUnits = document.querySelector('#altitudeUnits');
const timePositionDisplay = document.querySelector('#timePositionDisplay');
const timeSliderElement = document.querySelector('#timeSlider');
let headerTableElement = document.querySelector('#headerInfo tbody');
const taskElement = document.querySelector('#task');
const taskListElement = document.querySelector('#task ul');
const igcFileDisplay = document.querySelector('#igcFileDisplay');
const igcContainer = document.querySelector('.igc-container');
const timeZoneSelect = document.querySelector('#timeZoneSelect');
const errorMessageElement = document.querySelector('#errorMessage');
const displayDefaultFileButton = document.querySelector('#display-default-file');
const timeBackButton = document.querySelector('#timeBack');
const timeForwardButton = document.querySelector('#timeForward');
const fileControl = document.querySelector('#fileControl');

let handleFileInput;
let mapControl;
let updateTimeline;
let altitudeConversionFactor = 1.0; // Convert from metres to required units

let igcFile;
let latLong = [];
let distances = [];
let bearings = [];
let thetaTurnings = [];
let maxPointDistance = NaN;
let results;
