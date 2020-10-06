async function loadFileByURL(fileURL) {
    const res = await fetch(fileURL);
    const blob = await res.blob();
    await handleFileInput(blob);
}

const fileURL = 'https://api.igc.onestudies.com/api/igc/getFile.php';
// const fileURL = 'https://jsigc.test/data/example.igc';

window.onload = async () => {
    await loadFileByURL(fileURL);
    // runCircleDetection();
}

async function runCircleDetection() {
    if (showCpuUsageWarning) openModal();
    results.shapeDetection.circle = await circleDetection();
    let eights = await eightDetection();

    console.group('algorithm results');
    console.log('%c IGC Header', 'color: gray', results.igcHeader)
    console.log('%c Shape Detection', 'color: blue', results.shapeDetection)
    console.log('%c Additional Data', 'color: green', results.additionalData)
    console.groupEnd();
}
