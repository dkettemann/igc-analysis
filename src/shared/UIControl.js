function setOutput(text) {
    outputElement.textContent = text;
    algorithmButtons.style.display = 'inline-block';
}

function circleDetectionOutput(timeSpent, circlesCount) {
    const msg = circlesCount > 0 ? circlesCount + " circles found!" : "no circles were detected"
    circlesTimeSpent.textContent = "circle detection finished in " + timeSpent + " seconds: " + msg;
    if (circlesCount > 0) setCheckboxValue(circleCheckbox, true);
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

function getTimeLineValue() {
    return parseInt(timeSliderElement.value, 10);
}

function setTimelineValue(timeIndex) {
    if(timeIndex < 0) return;
    updateTimeline(timeIndex, mapControl);
    timeSliderElement.value = timeIndex;
}
