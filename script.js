let trackList = [];
let currentTrackIndex = null;
let audioElement = new Audio(); // Audio element for playback

// Display the modal to add a new track
function addTrackPrompt() {
    // Clear the modal fields for adding a new track
    document.getElementById('track-list-modal').style.display = 'flex';
    document.getElementById('track-name').value = '';
    document.getElementById('track-artist').value = '';
    document.getElementById('track-artwork').value = '';
    document.getElementById('track-file').value = '';
    currentTrackIndex = null; // Reset the currentTrackIndex to null when adding a new track
}

// Display the modal to edit an existing track
function editTrackPrompt() {
    if (currentTrackIndex === null) {
        alert("Select a track to edit.");
        return;
    }

    const track = trackList[currentTrackIndex];
    document.getElementById('track-name').value = track.name;
    document.getElementById('track-artist').value = track.artist;
    document.getElementById('track-artwork').value = track.artwork;
    document.getElementById('track-file').value = track.file;

    document.getElementById('track-list-modal').style.display = 'flex';
}

// Save the track (either add a new one or update an existing one)
function saveTrack() {
    const name = document.getElementById('track-name').value;
    const artist = document.getElementById('track-artist').value;
    const artwork = document.getElementById('track-artwork').files[0];
    const file = document.getElementById('track-file').files[0];

    if (!name || !artist || !artwork || !file) {
        alert("All fields are required.");
        return;
    }

    const track = {
        name,
        artist,
        artwork: URL.createObjectURL(artwork),
        file: URL.createObjectURL(file)
    };

    // If editing an existing track, update it; otherwise, add a new one
    if (currentTrackIndex === null) {
        trackList.push(track);
    } else {
        trackList[currentTrackIndex] = track;
    }

    updateTrackList(); // Update the track list UI after saving the track
    closeModal(); // Close the modal after saving
}

// Close the modal without saving
function closeModal() {
    document.getElementById('track-list-modal').style.display = 'none';
}

// Display the list of tracks
function updateTrackList() {
    const trackListContainer = document.getElementById('track-list-container');
    trackListContainer.innerHTML = ''; // Clear current list

    trackList.forEach((track, index) => {
        const trackElement = document.createElement('div');
        trackElement.classList.add('track-item');
        
        trackElement.innerHTML = `
            <div class="track-art" style="background-image: url('${track.artwork}')"></div>
            <div class="track-details">
                <div class="track-name">${track.name}</div>
                <div class="track-artist">${track.artist}</div>
            </div>
        `;

        // When a track is clicked, it selects that track for editing or deleting
        trackElement.addEventListener('click', () => selectTrack(index));
        
        trackListContainer.appendChild(trackElement);
    });

    // Update the "PLAYING x OF y" label
    updateNowPlaying();
}

// Update the "PLAYING x OF y" label
function updateNowPlaying() {
    const nowPlayingLabel = document.querySelector('.now-playing');
    if (currentTrackIndex !== null && trackList.length > 0) {
        nowPlayingLabel.innerText = `Playing ${currentTrackIndex + 1} of ${trackList.length}`;
    } else {
        nowPlayingLabel.innerText = 'No track selected';
    }
}

// Select a track to edit or delete
function selectTrack(index) {
    currentTrackIndex = index; // Store the selected track's index
    const track = trackList[index];
    document.querySelector('.track-name').innerText = track.name;
    document.querySelector('.track-artist').innerText = track.artist;
    document.querySelector('.track-art').style.backgroundImage = `url('${track.artwork}')`;

    // Load the selected track into the audio element
    audioElement.src = track.file;
    audioElement.play(); // Automatically start playing the track
    updateNowPlaying(); // Update the playing track info
}

// Delete a track from the list
function deleteTrackPrompt() {
    if (currentTrackIndex === null) {
        alert("Select a track to delete.");
        return;
    }

    // Remove the track from the list
    trackList.splice(currentTrackIndex, 1);

    // Update the list UI
    updateTrackList();

    // Reset the selected track index
    currentTrackIndex = null;
}

// Play/pause the track
function playpauseTrack() {
    if (audioElement.paused) {
        audioElement.play();
        document.querySelector('.playpause-track i').classList.remove('fa-play-circle');
        document.querySelector('.playpause-track i').classList.add('fa-pause-circle');
    } else {
        audioElement.pause();
        document.querySelector('.playpause-track i').classList.remove('fa-pause-circle');
        document.querySelector('.playpause-track i').classList.add('fa-play-circle');
    }
}

// Play the next track
function nextTrack() {
    if (currentTrackIndex < trackList.length - 1) {
        currentTrackIndex++;
    } else {
        currentTrackIndex = 0; // Loop back to the start
    }

    selectTrack(currentTrackIndex); // Play the next track
}

// Play the previous track
function prevTrack() {
    if (currentTrackIndex > 0) {
        currentTrackIndex--;
    } else {
        currentTrackIndex = trackList.length - 1; // Loop back to the last track
    }

    selectTrack(currentTrackIndex); // Play the previous track
}

// Seek to a specific position in the track
function seekTo() {
    const seekSlider = document.querySelector('.seek_slider');
    const seekPosition = (seekSlider.value / 100) * audioElement.duration;
    audioElement.currentTime = seekPosition;
}

// Set the volume
function setVolume() {
    const volumeSlider = document.querySelector('.volume_slider');
    audioElement.volume = volumeSlider.value / 100;
}

function randomTrack() {
    if (trackList.length === 0) {
        alert("No tracks available to play.");
        return;
    }

    document.querySelector('.random-track i').classList.add('active');
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * trackList.length);
    } while (randomIndex === currentTrackIndex && trackList.length > 1);

    currentTrackIndex = randomIndex;
    selectTrack(currentTrackIndex);

    // Remove the active class after 1 second for a brief highlight effect
    setTimeout(() => {
        document.querySelector('.random-track i').classList.remove('active');
    }, 1000);
}
function repeatTrack() {
    if (audioElement.src) { // Check if there's a track loaded
        audioElement.currentTime = 0; // Reset the playback time to the start
        audioElement.play(); // Start playing the track
    } else {
        alert("No track is currently playing.");
    }
}
// Real-time duration display
function updateTimer() {
    const currentTimeDisplay = document.querySelector('.current-time');
    const durationTimeDisplay = document.querySelector('.total-duration');
    const seekSlider = document.querySelector('.seek_slider');

    if (audioElement.duration) {
        // Update current time
        let currentMinutes = Math.floor(audioElement.currentTime / 60);
        let currentSeconds = Math.floor(audioElement.currentTime % 60);
        if (currentSeconds < 10) currentSeconds = `0${currentSeconds}`;
        currentTimeDisplay.textContent = `${currentMinutes}:${currentSeconds}`;

        // Update duration time
        let durationMinutes = Math.floor(audioElement.duration / 60);
        let durationSeconds = Math.floor(audioElement.duration % 60);
        if (durationSeconds < 10) durationSeconds = `0${durationSeconds}`;
        durationTimeDisplay.textContent = `${durationMinutes}:${durationSeconds}`;

        // Update seek slider position
        seekSlider.value = (audioElement.currentTime / audioElement.duration) * 100;
    } else {
        currentTimeDisplay.textContent = '0:00';
        durationTimeDisplay.textContent = '0:00';
    }
}

// Update timer continuously during playback
audioElement.addEventListener('timeupdate', updateTimer);

// Update timer when a new track is loaded
audioElement.addEventListener('loadedmetadata', updateTimer);
