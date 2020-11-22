/*
Variables
*/

// DOM variables
let $audio;
let audio;
let $queue;

// Audio settings
let volume = 1;
let playbackRate = 1;
let shuffle = false;
let repeat = false;

// Music queue
let queue = [];
let currentVideoid;
let currentTitle;

// Variables to help with shuffling

// Array: videoid of all music that were played
// Only used when shuffle is true if not it is empty
let history = [];
// Array: videoid of all the music that were not played
let queueForShuffle = [];

/* 
On ready
*/

$(document).ready(function () {
    $audio = $("#audio");
    audio = $audio[0];
    $queue = $("#queue");

    // Check if playback rate settings already exists if not create
    if (getLocallySavedPlaybackRate() != false) {
        playbackRate = getLocallySavedPlaybackRate();
        $("#playback-rate").html(playbackRate);
        audio.playbackRate = playbackRate;
    } else {
        saveLocallyAudioSettings();
        playbackRate = getLocallySavedPlaybackRate();
        $("#playback-rate").html(playbackRate);
        audio.playbackRate = playbackRate;
    }

    // Check if volume settings already exists if not create
    if (getLocallySavedVolume() != false || getLocallySavedVolume() == 0) {
        volume = getLocallySavedVolume();
        audio.volume = volume;
    } else {
        saveLocallyAudioSettings();
        volume = getLocallySavedVolume();
        audio.volume = volume;
    }

    // Load saved queueDOM
    $("#queue").html(localStorage.getItem("queueDOM"));
    // Load saved array queue if it's not empty
    if (JSON.parse(localStorage.getItem("queue"))) {
        queue = JSON.parse(localStorage.getItem("queue"));
        queueForShuffle = [...queue];
    }

    noUiSlider.create($("#progress-bar")[0], {
        start: 0,
        connect: [true, false],
        range: {
            min: 0,
            max: 100,
        },
    });
    noUiSlider.create($("#slider-playback-rate")[0], {
        start: playbackRate,
        connect: [true, true],
        range: {
            min: 0.1,
            max: 2,
        },
    });
    noUiSlider.create($("#slider-volume")[0], {
        start: volume,
        connect: [true, true],
        range: {
            min: 0,
            max: 1,
        },
    });

    /* 
    Events
    */

    // Change current time when changing progress bar
    $("#progress-bar")[0].noUiSlider.on("slide", function () {
        if (audio.readyState) {
            // position 0 to 100
            let position = $("#progress-bar")[0].noUiSlider.get();
            audio.currentTime = (position * audio.duration) / 100;
        }
    });

    // Change playback rate when changing slider-playback-rate
    $("#slider-playback-rate")[0].noUiSlider.on("slide", function () {
        // position 0.1 to 2
        let position = $("#slider-playback-rate")[0].noUiSlider.get();
        updateAndSaveLocallyPlaybackRate(parseFloat(position));
    });

    // Change volume when changing slider-volume
    $("#slider-volume")[0].noUiSlider.on("slide", function () {
        if (audio.muted) {
            audio.muted = false;
        }
        // position 0 to 1
        let position = $("#slider-volume")[0].noUiSlider.get();
        updateAndSaveLocallyVolume(parseFloat(position));
    });

    // Play music when clicking on music's title or thumb
    $(document).on("click", ".title, .thumb-img-dashboard", function () {
        history = [];
        eel.play_music($(this).closest(".music").data("videoid"));
    });

    // Unfocus slider handles when focused
    $(document).on("focus", ".noUi-handle", function () {
        $(this).blur();
    });

    // Keyboard shortcuts
    $(document).keydown(function (e) {
        if ($("#url").is(":focus")) {
            return;
        }
        switch (e.which) {
            // Skip forward 5 sec
            // Left arrow
            case 37:
                audio.currentTime -= 5;
                break;

            // Rewind 5 sec
            // Right arrow
            case 39:
                audio.currentTime += 5;
                break;

            // Volume +0.02
            // Up arrow
            case 38:
                if (volume >= 0 && volume < 1) {
                    updateAndSaveLocallyVolume(
                        Math.round((volume + 0.02) * 100) / 100
                    );
                    $("#slider-volume")[0].noUiSlider.set(volume);
                }
                break;

            // Volume -0.02
            // Down arrow
            case 40:
                if (volume > 0 && volume <= 1) {
                    updateAndSaveLocallyVolume(
                        Math.round((volume - 0.02) * 100) / 100
                    );
                    $("#slider-volume")[0].noUiSlider.set(volume);
                }
                break;

            // Toggle mute
            // M key
            case 77:
                toggleMute();
                break;

            // Next music
            // N key
            case 78:
                nextMusic();
                break;

            // Previous music
            // P key
            case 80:
                previousMusic();
                break;

            // Previous music
            // Backspace key
            case 8:
                previousMusic();
                break;

            // Toggle shuffle
            // S key
            case 83:
                toggleShuffle();
                break;

            // Toggle repeat
            // R key
            case 82:
                toggleRepeat();
                break;

            // Play/Resume
            // Space
            case 32:
                togglePlay();
                break;

            // Faster playback rate
            // [ key
            case 219:
                slowerPlaybackRate();
                break;

            // Slower playback rate
            // ] key
            case 221:
                fasterPlaybackRate();
                break;
        }
    });

    // Remove music after clicking .remove
    $(document).on("click", ".remove", function () {
        let videoidToRemove = $(this).closest(".music").data("videoid");

        if (videoidToRemove == currentVideoid) {
            if (videoidToRemove == queue[0] && queue.length != 1) {
                eel.play_music(queue[queue.indexOf(videoidToRemove) + 1]);
            } else if (queue.length != 1) {
                eel.play_music(queue[queue.indexOf(videoidToRemove) - 1]);
            } else {
                removeAudioSrcAndMetadata();
                currentVideoid = false;
            }
        }

        // Remove videoid from queues and history
        if (queueForShuffle.includes(videoidToRemove)) {
            queueForShuffle.splice(queueForShuffle.indexOf(videoidToRemove), 1);
        }
        if (history.includes(videoidToRemove)) {
            history.splice(history.indexOf(videoidToRemove), 1);
        }
        queue.splice(videoidToRemove, 1);

        // Remove music from queueDOM
        $(this).closest(".music").remove();
    });
});

/*
Plugins
*/

// Plugin to scroll to an element within the middle of an overflowed div
// Numbers set for #dashboard-container
(function ($) {
    $.fn.scrollTo = function (elem) {
        let $elem = $(elem);
        this.scrollTop(
            this.scrollTop() +
                ($elem.position().top - this.offset().top) -
                this.height() / 9 +
                $elem.height() / 2
        );
    };
})(jQuery);

/* 
Local JS Functions
*/

function addToQueue() {
    url = $("#url").val();
    eel.add_to_queue(url);
}

function clearQueue() {
    $("#queue").empty();
    queue = [];
    queueForShuffle = [];
}

function removeAudioSrcAndMetadata() {
    audio.pause();
    audio.src = "";
    $("#current-thumb").attr("src", "img/empty_thumb.png");
    $("#current-time").html("00:00");
    $("#duration").html("00:00");
    $("#current-title").html("");
    $("#current-author").html("");
    $("#progress-bar")[0].noUiSlider.set(0);
}

function getLocallySavedPlaybackRate() {
    let audioSettings = JSON.parse(localStorage.getItem("audioSettings"));
    if (!audioSettings) {
        return false;
    }
    return parseFloat(audioSettings.playbackRate);
}

function getLocallySavedVolume() {
    let audioSettings = JSON.parse(localStorage.getItem("audioSettings"));
    if (!audioSettings) {
        return false;
    }
    return parseFloat(audioSettings.volume);
}

function saveLocallyAudioSettings() {
    let audioSettings = {
        volume: volume,
        playbackRate: playbackRate,
    };
    localStorage.setItem("audioSettings", JSON.stringify(audioSettings));
}
function updateAndSaveLocallyVolume(value) {
    volume = value;
    audio.volume = volume;
    saveLocallyAudioSettings();
}

function updateAndSaveLocallyPlaybackRate(value) {
    playbackRate = value;
    audio.playbackRate = playbackRate;
    saveLocallyAudioSettings();
}

function resetPlaybackRate() {
    playbackRate = 1;
    $("#slider-playback-rate")[0].noUiSlider.set(playbackRate);
    updateAndSaveLocallyPlaybackRate();
}

function fasterPlaybackRate() {
    if (playbackRate >= 2) {
        return;
    }
    // playbackRate = Math.round((playbackRate + 0.05) * 100) / 100;
    updateAndSaveLocallyPlaybackRate(
        Math.round((playbackRate + 0.05) * 100) / 100
    );
    $("#slider-playback-rate")[0].noUiSlider.set(playbackRate);
}

function slowerPlaybackRate() {
    if (playbackRate <= 0.1) {
        return;
    }
    // playbackRate = Math.round((playbackRate - 0.05) * 100) / 100;
    updateAndSaveLocallyPlaybackRate(
        Math.round((playbackRate - 0.05) * 100) / 100
    );
    $("#slider-playback-rate")[0].noUiSlider.set(playbackRate);
}

// Returns random videoid from queue
function randomVideoidFromQueueShuffle() {
    return queueForShuffle[Math.floor(Math.random() * queueForShuffle.length)];
}

// Plays next music
function nextMusic() {
    // If music is not chosen do nothing
    if (!currentVideoid) {
        return;
    }

    if (!queueForShuffle.length && shuffle) {
        queueForShuffle = [...queue];
        eel.play_music(randomVideoidFromQueueShuffle());
    } else if (
        history.indexOf(currentVideoid) == history.length - 1 &&
        shuffle
    ) {
        if (!history.length) {
            history.push(currentVideoid);
        }
        eel.play_music(randomVideoidFromQueueShuffle());
        return;
    } else if (history.indexOf(currentVideoid) < history.length - 1) {
        eel.play_music(history[history.indexOf(currentVideoid) + 1]);
        return;
    } else if (shuffle) {
        let randomVideoid = randomVideoidFromQueueShuffle();
        if (!history.length) {
            history.push(randomVideoid);
        }
        eel.play_music(randomVideoid);
        return;
    } else {
        if (queue.indexOf(currentVideoid) + 1 <= queue.length) {
            eel.play_music(queue[queue.indexOf(currentVideoid) + 1]);
            return;
        } else {
            history = [];
            eel.play_music(queue[0]);
            return;
        }
    }
}

// Plays previous music
function previousMusic() {
    if (audio.currentTime > 5) {
        audio.currentTime = 0;
    } else if (
        !currentVideoid ||
        (currentVideoid == queue[0] && !shuffle) ||
        (currentVideoid == history[0] && shuffle) ||
        (!history.length && shuffle)
    ) {
        return;
    } else if (shuffle) {
        eel.play_music(history[history.indexOf(currentVideoid) - 1]);
    } else {
        eel.play_music(queue[queue.indexOf(currentVideoid) - 1]);
    }
}

function forwardMusic() {
    audio.currentTime += 5;
}

function rewindMusic() {
    audio.currentTime -= 5;
}

function saveLocallyQueue() {
    let queueDOM = $("#queue").html();
    // Remove current-music class from queue
    queueDOM = queueDOM.replace(" current-music", "");
    localStorage.setItem("queueDOM", queueDOM);

    // Save array queue
    if (queue) {
        localStorage.setItem("queue", JSON.stringify(queue));
    }
}

function togglePlay() {
    if (audio.readyState) {
        if (audio.paused || audio.ended) {
            audio.play();
        } else {
            audio.pause();
        }
    } else {
        if (!queue.length) {
            return;
        } else if (shuffle) {
            eel.play_music(randomVideoidFromQueueShuffle());
        } else {
            // Play first music in queue
            eel.play_music(queue[0]);
        }
    }
}
function toggleMute() {
    if (audio.muted) {
        audio.muted = false;
        $("#slider-volume")[0].noUiSlider.set(volume);
    } else {
        audio.muted = true;
    }
}

function onVolumeChange() {
    if (audio.muted || audio.volume == 0) {
        $("#slider-volume")[0].noUiSlider.set(0);
        $("#a-volume").removeClass().addClass("fa fa-volume-off fa-2x");
    } else {
        $("#a-volume").removeClass().addClass("fa fa-volume-up fa-2x");
    }
}

function onEnded() {
    if (!repeat) {
        nextMusic();
    } else {
        audio.currentTime = 0;
        audio.play();
    }
}

function onPause() {
    $("#toggle-play").html('<i class="fa fa-play fa-lg"></i>');
    document.title = "YMPlayer";
}
function onPlay() {
    $("#toggle-play").html('<i class="fa fa-pause fa-lg"></i>');
    document.title = currentTitle;
}

function timeUpdate() {
    $("#progress-bar")[0].noUiSlider.set(
        (audio.currentTime / audio.duration) * 100
    );

    if (audio.readyState) {
        let playedMinutes = parseInt(audio.currentTime / 60);
        let playedSeconds = parseInt(audio.currentTime % 60);
        $("#current-time").html(
            String(playedMinutes).padStart(2, "0") +
                ":" +
                String(playedSeconds).padStart(2, "0")
        );
    }
}

function updateDuration() {
    let minutes = parseInt(audio.duration / 60);
    let seconds = parseInt(audio.duration % 60);
    $("#duration").html(
        String(minutes).padStart(2, "0") +
            ":" +
            String(seconds).padStart(2, "0")
    );
}

function toggleShuffle() {
    $("#a-shuffle").toggleClass("inactive-a");
    shuffle = !shuffle;
}

function toggleRepeat() {
    $("#a-repeat").toggleClass("inactive-a");
    repeat = !repeat;
}

function scrollToCurrent() {
    $("#queue-container").scrollTo(".current-music");
}

/*
EEL Exposed Functions
*/

eel.expose(playMusic);
function playMusic(url, metadata) {
    // Update player with meta data
    $("#current-thumb").attr("src", metadata.thumb);
    $("#current-title").html(metadata.title);
    $("#current-author").html(metadata.author);
    $audio.attr("src", url);

    audio.play();
    audio.playbackRate = playbackRate;

    currentVideoid = metadata.videoid;
    if (!shuffle) {
        history = [];
    } else {
        if (!history.includes(metadata.videoid)) {
            history.push(metadata.videoid);
        }
    }

    if (queueForShuffle.includes(metadata.videoid)) {
        queueForShuffle.splice(queueForShuffle.indexOf(metadata.videoid), 1);
    }

    currentTitle = metadata.title;

    // Remove .current-music from every music
    $(".music").removeClass("current-music");

    // Add class current-music to current music
    $(`div[data-videoid="${metadata.videoid}"]`).addClass("current-music");

    // Scroll dashboard to current music
    $("#queue-container").scrollTo(".current-music");
}

let divMusic = ({ videoid, thumb, title, author, duration }) => `
    <div class="music row p-2" data-videoid="${videoid}">
        <div class="col-3">
            <img
                src="${thumb}"
                class="thumb-img-dashboard img-thumbnail"
            />
        </div>
        <div class="col-9">
            <div class="title row h4 text-truncate">${title}</div>
            <div class="row">
                <div class="author col-5 h4 text-truncate">${author}</div>
                <div class="duration col-5 h4 text-truncate">${duration}</div>
                <div class="col-2">
                    <a class="remove">Remove</a>
                </div>
            </div>
        </div>
    </div>
`;

eel.expose(addPlaylistToQueue);
function addPlaylistToQueue(playlist) {
    for (let metadata in playlist) {
        // Skip if videoid is already in queue
        if (!$(`[data-videoid="${playlist[metadata].videoid}"`).length) {
            $("#queue").append(divMusic(playlist[metadata]));
            // Add videoid to array queue
            queue.push(playlist[metadata].videoid);
            queueForShuffle.push(playlist[metadata].videoid);
        }
    }
}

eel.expose(addMusicToQueue);
function addMusicToQueue(metadata) {
    // Skip if videoid is already in queue
    if (!$(`[data-videoid="${metadata.videoid}"`).length) {
        $("#queue").append(divMusic(metadata));
        // Add to the of array queue
        queue.push(metadata.videoid);
        queueForShuffle.push(metadata.videoid);
    }
}

eel.expose(alertError);
function alertError(error) {
    alert(error);
}
