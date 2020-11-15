let _circlesFound = false;

async function circleDetection() {
    const start = window.performance.now();
    const circles = await findCircles(latLong, distances);
    const end = window.performance.now();
    const secondsSpent = ((end - start) / 1000).toFixed(3);

    applyCircleDetectionProgress(100);
    setCircleDetectionOutput(secondsSpent, circles.length);
    displayCircles(circles);
    return circles;
}

async function findCircles(latLong, distances) {
    let currentCircleCandidates = [];
    let p0 = 0;
    while (p0 < latLong.length) {
        if (p0 % domUpdateInterval === 0) await updateProgressBar(p0);
        let p1 = getNextPointRecursive(0.1, p0, distances);
        while (p1 < latLong.length) {
        // for (let p1 = getNextPointRecursive(0.1, p0, distances); p1 < latLong.length; p1++) {
            if (p1 < 0) break; // nextPointInDistance could not find a point
            const distP0P1 = distance(p0, p1);
            const circleCondition1 = distP0P1 < circleMaxGap;

            // circle check - the order of conditions minimizes runtime
            if (circleCondition1 && locallyOptimalP1(p0, p1) && circleDiameterCondition(latLong, distances, p0, p1)) {
                currentCircleCandidates.push([p0, p1]);
                break;
            }
            // runtime optimization - skip points until p1 might fulfill the circleGap condition again
            const skipIndices = Math.floor((distP0P1 - circleMaxGap) / maxPointDistance) - 1;
            if (skipIndices > 0) p1 += skipIndices;

            if (p1 >= latLong.length - 1 && currentCircleCandidates.length > 0) {
                // circles were found in previous iterations - now optimize p0
                const bestCandidate = getP0OptimalCircle(currentCircleCandidates);
                circles.push([bestCandidate[0], bestCandidate[1]]);
                p0 = bestCandidate[1] - 1; // intersections are forbidden - fast-forward to the circle end
                currentCircleCandidates = [];
            }
            p1++;
        }
        p0++;
    }
    closeModal();
    return circles;
}

async function updateProgressBar(p0) {
    if (!_circlesFound && circles.length > 0) {
        _circlesFound = true;
        setCheckboxValue(circleCheckbox, true);
    }
    await applyCircleDetectionProgress(
        getProgressValue(p0, latLong.length)
    );
    await pauseCalculations();
}

function getP0OptimalCircle(circleCandidates) {
    let bestCandidate;
    let minimalGap = circleMaxGap;
    for (const key in circleCandidates) {
        const value = distance(circleCandidates[key][0], circleCandidates[key][1]);
        // optimization criterion is minimizing the circle gap.
        if (value < minimalGap) {
            minimalGap = value;
            bestCandidate = circleCandidates[key];
        }
    }
    circleIndices.push(bestCandidate);
    return bestCandidate;
}

function getProgressValue(currentIndex, arrayLength) {
    return (currentIndex / arrayLength) * 100;
}

function getOppositeCirclePoint(circumference, px) {
    return getNextPointRecursive(circumference / 2, px, distances);
}

function circleGapCondition(p0, p1) {
    return distance(p0, p1) < circleMaxGap;
}

function circleDiameterCondition(latLong, distances, p0, p1) {
    const circumference = pathLength(distances, p0, p1);
    const diameter = circumference / (2 * Math.PI);
    for (let px = p0 + 1; px < p1; px++) {
        const opposite = getOppositeCirclePoint(circumference, px);
        if (opposite < 0) return true; // end of circle is reached
        const oppositeDistance = distance(px, opposite);
        if (oppositeDistance < (1 - circleDiameterMaxDeviation) * diameter) {
            return false;
        }
    }
    return true;
}

function locallyOptimalP1(p0, p1) {
    if (p1 + 1 >= latLong.length) return false;
    // is there a circle from p0 to p1+1 and does it have a smaller circle gap?
    return distance(p0, p1) <= distance(p0, p1 + 1) || !isCircle(p0, p1 + 1);
}

function isCircle(p0, p1) {
    if (p1 >= latLong.length) return false;
    return circleGapCondition(p0, p1) && circleDiameterCondition(latLong, distances, p0, p1);
}
