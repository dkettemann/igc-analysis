'use strict';

const outputElement = document.querySelector('#curve-detection-output');
const algorithmButtons = document.querySelector('.algorithm-buttons');
const curve90Checkbox = document.querySelector('#curve-90');
const curve180Checkbox = document.querySelector('#curve-180');

const circleDetectionContainer = document.querySelector('.circle-detection');
const circleCheckbox = document.querySelector('#circle-checkbox');
const circlesTimeSpent = document.querySelector('#time-spent-circles');
const circleAlgorithmProgressBar = document.querySelector('#circle-progress');
let latLong = [];
let distances = [];

/**
 * It might be necessary to wait some milliseconds in order to prevent
 * that Chrome postpones rendering due to high CPU usage
 * @param {number} ms
 * @returns {Promise}
 * */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function domUpdate(){
    return new Promise(resolve => {
        const fn = () => window.requestAnimationFrame(resolve);
        window.requestAnimationFrame(fn);
    })
}

function distance(p1, p2) {
    if(latLong[p1]===undefined || latLong[p2]===undefined) console.log("distance(" + p1 + ", " + p2 + "): invalid coordinates passed");
    const lat1 = latLong[p2][0], lon1 = latLong[p2][1], lat2 = latLong[p1][0], lon2 = latLong[p1][1];
    var p = 0.017453292519943295;    // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p)/2 +
        c(lat1 * p) * c(lat2 * p) *
        (1 - c((lon2 - lon1) * p))/2;

    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

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

function setOutput(text) {
    outputElement.textContent = text;
    algorithmButtons.style.display = 'inline-block';
}

/**
 *
 * @param timeSpent
 * @param circlesCount the number of circles detected
 */
function circleDetectionOutput(timeSpent, circlesCount){
    const msg = circlesCount > 0 ? circlesCount + " circles found!" : "no circles were detected"
    circlesTimeSpent.textContent = "circle detection finished in " + timeSpent + " seconds: " + msg;
    if(circlesCount > 0) setCheckboxValue(circleCheckbox, true);
}

function circleDetectionProgress(value) {
    circleAlgorithmProgressBar.value = value;
    circleDetectionContainer.style.display = 'block';
}

function setCircleDetectionProgress(currentIndex, arrayLength) {
    const value = getProgressValue(currentIndex, arrayLength);
    circleDetectionProgress(value);
}

function setCheckboxValue(checkbox, value) { checkbox.checked = value; }

document.addEventListener("DOMContentLoaded", () => {});

function fetchIGCData() {
    fetch(serverAddress + 'api/igc/getIGCDocuments.php')
        .then( async response => {
            if (!response.ok) throw new Error("HTTP error " + response.status);
            response = await response.json();
            console.log(response)
        })
}

function fetchExample() {
    fetch(serverAddress + 'api/igc/getIGCDocuments.php')
        .then( async response => {
            if (!response.ok) throw new Error("HTTP error " + response.status);
            response = await response.json();
            console.log(response)
        })
}
