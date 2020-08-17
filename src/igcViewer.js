(function ($) {
    'use strict';

    let igcFile = null;
    altitudeConversionFactor = 1.0; // Conversion from metres to required units

    function positionDisplay(position) {
        function toDegMins(degreevalue) {
            let wholedegrees = Math.floor(degreevalue);
            let minutevalue = (60 * (degreevalue - wholedegrees)).toFixed(3);
            return wholedegrees + '\u00B0\u00A0' + minutevalue + '\u00B4';
        }

        let positionLatitude = toDegMins(Math.abs(position[0]));
        let positionLongitude = toDegMins(Math.abs(position[1]));
        if (position[0] > 0) {
            positionLatitude += "N";
        } else {
            positionLatitude += "S";
        }
        if (position[1] > 0) {
            positionLongitude += "E";
        } else {
            positionLongitude += "W";
        }
        return positionLatitude + ",   " + positionLongitude;
    }

    updateTimeline = (timeIndex, mapControl) => {
        let currentPosition = igcFile.latLong[timeIndex];
        console.log(timeIndex)
        let positionText = positionDisplay(currentPosition);
        let unitName = $('#altitudeUnits').val();
        $('#timePositionDisplay').text(
            moment(igcFile.recordTime[timeIndex]).format('HH:mm:ss') + ': ' +
            (igcFile.pressureAltitude[timeIndex] * altitudeConversionFactor).toFixed(0) + ' ' +
            unitName + ' (barometric) / ' +
            (igcFile.gpsAltitude[timeIndex] * altitudeConversionFactor).toFixed(0) + ' ' +
            unitName + ' (GPS); ' +
            positionText
        );

        mapControl.setTimeMarker(timeIndex);
    }

    function displayIgc(mapControl) {
        // Display the headers.
        let displayDate = moment(igcFile.recordTime[0]).format('LL');
        let headerTable = $('#headerInfo tbody');
        headerTable.html('')
            .append(
                $('<tr></tr>').append($('<th></th>').text('Date'))
                    .append($('<td></td>').text(displayDate))
            );
        let headerName;
        let headerIndex;
        for (headerIndex = 0; headerIndex < igcFile.headers.length; headerIndex++) {
            headerTable.append(
                $('<tr></tr>').append($('<th></th>').text(igcFile.headers[headerIndex].name))
                    .append($('<td></td>').text(igcFile.headers[headerIndex].value))
            );
        }

        // Show the task declaration if it is present.

        if (igcFile.task.coordinates.length > 0) {
            //eliminate anything with empty start line coordinates
            if (igcFile.task.coordinates[0][0] !== 0) {
                $('#task').show();
                let taskList = $('#task ul').first().html('');
                let j;
                //Now add TP numbers.  Change to unordered list
                if (igcFile.task.takeoff.length > 0) {
                    taskList.append($('<li> </li>').text("Takeoff: " + igcFile.task.takeoff));
                }
                for (j = 0; j < igcFile.task.names.length; j++) {
                    switch (j) {
                        case 0:
                            taskList.append($('<li> </li>').text("Start: " + igcFile.task.names[j]));
                            break;
                        case (igcFile.task.names.length - 1):
                            taskList.append($('<li> </li>').text("Finish: " + igcFile.task.names[j]));
                            break;
                        default:
                            taskList.append($('<li></li>').text("TP" + (j).toString() + ": " + igcFile.task.names[j]));
                    }
                }
                if (igcFile.task.landing.length > 0) {
                    taskList.append($('<li> </li>').text("Landing: : " + igcFile.task.landing));
                }
                mapControl.addTask(igcFile.task.coordinates, igcFile.task.names);
            }
        } else {
            $('#task').hide();
        }

        // Reveal the map and graph. We have to do this before
        // setting the zoom level of the map or plotting the graph.
        $('#igcFileDisplay').show();

        mapControl.addTrack(igcFile.latLong);

        $('#timeSlider').prop('max', igcFile.recordTime.length - 1);
        updateTimeline(0, mapControl);
        return "done";
    }

    function storePreference(name, value) {
        if (window.localStorage) {
            try {
                localStorage.setItem(name, value);
            } catch (e) {
                console.log('%ccould not save preferences into local storage:', 'color: gray', e);
            }
        }
    }

    function sendData(file) {
        let data = new FormData();
        data.append("igcfile", file);

        fetch(serverAddress + "api/igc/readFromForm.php?XDEBUG_SESSION_START=TRUE", {
            method: 'post',
            body: data,
        }).then(async response => {
            response = await response.json();
            console.log(response);
            $('.igc-container').css("display", "flex");
            $('#download-p').text("The file is available here: ");
            $('#download-url').text(response.url);
            $('#download-url').attr("href", response.url)
        })
    }

    $(document).ready(function () {
        mapControl = createMapControl('map');

        let timeZoneSelect = $('#timeZoneSelect');
        $.each(moment.tz.names(), function (index, name) {
            timeZoneSelect.append(
                $('<option></option>', {value: name}).text(name));
        });

        timeZoneSelect.change(function () {
            let selectedZone = $(this).val();
            moment.tz.setDefault(selectedZone);
            if (igcFile !== null) {
                updateTimeline($('#timeSlider').val(), mapControl);
                $('#headerInfo td').first().text(moment(igcFile.recordTime[0]).format('LL'));
            }

            storePreference('timeZone', selectedZone);
        });

        handleFileInput = async (file) => {
            return new Promise(resolve => {
                const reader = new FileReader();
                reader.onload = async function (e) {
                    try {
                        $('#errorMessage').text('');
                        mapControl.reset();
                        $('#timeSlider').val(0);
                    } catch (ex) {
                        errorHandler(ex);
                    }

                    igcFile = parseIGC(reader.result);
                    displayIgc(mapControl);
                    const results = await runAlgorithms(igcFile);
                    console.log(results);
                    await displayResults(results, mapControl);
                    plotBarogramChart(igcFile);
                    return resolve();
                };
                $('.igc-container').hide();
                reader.readAsText(file);

            })
        };

        $('#fileControl').change(async function () {
            if (this.files.length < 1) return;
            sendData(this.files[0]);
            handleFileInput(this.files[0]);
        });

        function displayDefaultFile() {
            fetch(serverAddress + 'api/igc/getFile.php')
                .then(res => res.blob())
                .then(blob => {
                    let reader = new FileReader();
                    reader.onload = async function (e) {
                        try {
                            $('#errorMessage').text('');
                            mapControl.reset();
                            $('#timeSlider').val(0);
                        } catch (ex) {
                            errorHandler(ex);
                        }

                        igcFile = parseIGC(this.result);
                        displayIgc(mapControl);
                        const results = await runAlgorithms(igcFile);
                        console.log(results);
                        displayResults(results, mapControl);
                    };
                    $('.igc-container').hide();
                    reader.readAsText(blob);
                });
        }

        $("#display-default-file").click(function () {
            displayDefaultFile();
        });


        $('#altitudeUnits').change(function (e, raisedProgrammatically) {
            let altitudeUnit = $(this).val();
            if (altitudeUnit === 'feet') {
                altitudeConversionFactor = 3.2808399;
            } else {
                altitudeConversionFactor = 1.0;
            }

            if (igcFile !== null) {
                updateTimeline($('#timeSlider').val(), mapControl);
            }

            if (!raisedProgrammatically) {
                storePreference("altitudeUnit", altitudeUnit);
            }
        });

        // We need to handle the 'change' event for IE, but
        // 'input' for Chrome and Firefox in order to update smoothly
        // as the range input is dragged.
        $('#timeSlider').on('input', function () {
            let t = parseInt($(this).val(), 10);
            updateTimeline(t, mapControl);
        });
        $('#timeSlider').on('change', function () {
            let t = parseInt($(this).val(), 10);
            updateTimeline(t, mapControl);
        });

        $('#timeBack').click(function () {
            let slider = $('#timeSlider');
            let curTime = parseInt(slider.val(), 10);
            curTime--;
            if (curTime < 0) {
                curTime = 0;
            }
            slider.val(curTime);
            updateTimeline(curTime, mapControl);
        });

        $('#timeForward').click(function () {
            let slider = $('#timeSlider');
            let curTime = parseInt(slider.val(), 10);
            let maxval = slider.prop('max');
            curTime++;
            if (curTime > maxval) {
                curTime = maxval;
            }
            slider.val(curTime);
            updateTimeline(curTime, mapControl);
        });

        $('#barogram').on('plotclick', function (event, pos, item) {
            if (item) {
                setTimelineValue(item.dataIndex, mapControl);
            }
        });

        // Load preferences from local storage, if available.

        let altitudeUnit = '';
        let timeZone = '';

        if (window.localStorage) {
            try {
                altitudeUnit = localStorage.getItem('altitudeUnit');
                if (altitudeUnit) {
                    $('#altitudeUnits').val(altitudeUnit).trigger('change', true);
                }

                timeZone = localStorage.getItem('timeZone');
            } catch (e) {
                // If permission is denied, ignore the error.
            }
        }

        if (!timeZone) {
            timeZone = 'UTC';
        }

        timeZoneSelect.val(timeZone);
        moment.tz.setDefault(timeZone);

        if (displayDefaultFileOnStartup) displayDefaultFile();
    });
}(jQuery));
