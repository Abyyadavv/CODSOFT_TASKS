// ==========================================
// VIBEWAVE MUSIC PLAYER
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // FIND HTML ELEMENTS
    // ==========================================

    const get = (...selectors) => {
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) return element;
        }
        return null;
    };

    // Audio element
    let audio = get("#audioPlayer", "#audio", "audio");

    if (!audio) {
        audio = document.createElement("audio");
        audio.id = "audioPlayer";
        audio.preload = "metadata";
        document.body.appendChild(audio);
    }

    // Controls
    const fileInput = get(
        "#fileInput",
        "#audioInput",
        "#songInput",
        'input[type="file"]'
    );

    const playButton = get(
        "#playPauseBtn",
        "#playBtn",
        "#playPause",
        ".play-btn"
    );

    const nextButton = get("#nextBtn", "#next", ".next-btn");

    const previousButton = get(
        "#prevBtn",
        "#previousBtn",
        "#previous",
        ".prev-btn"
    );

    const progressBar = get(
        "#progressBar",
        "#seekBar",
        "#progress",
        'input[type="range"][data-progress]'
    );

    const volumeSlider = get(
        "#volumeSlider",
        "#volume",
        'input[type="range"][data-volume]'
    );

    const muteButton = get("#muteBtn", "#muteButton");
    const shuffleButton = get("#shuffleBtn", "#shuffle");
    const repeatButton = get("#repeatBtn", "#repeat");

    // Song information
    const songTitle = get(
        "#songTitle",
        "#trackTitle",
        ".song-title"
    );

    const artistName = get(
        "#artistName",
        "#trackArtist",
        ".artist-name"
    );

    const albumArtwork = get(
        "#albumArtwork",
        "#albumArt",
        ".album-art"
    );

    const currentTimeElement = get(
        "#currentTime",
        "#current-time"
    );

    const durationElement = get(
        "#duration",
        "#totalDuration"
    );

    // Playlist
    const playlistElement = get(
        "#playlist",
        "#songList",
        ".playlist"
    );

    const songCountElement = get("#songCount", "#totalSongs");

    const favoritesButton = get(
        "#favoritesBtn",
        "#favoritesTab",
        '[data-filter="favorites"]'
    );

    // ==========================================
    // PLAYER VARIABLES
    // ==========================================

    let songs = [];
    let currentIndex = -1;
    let isShuffle = false;
    let repeatMode = "off";
    let showingFavorites = false;
    let lastVolume = 1;

    const favorites = new Set(
        JSON.parse(
            localStorage.getItem("vibewaveFavorites") || "[]"
        )
    );

    // ==========================================
    // INDEXEDDB STORAGE
    // ==========================================

    const DB_NAME = "VibeWaveMusicDB";
    const DB_VERSION = 1;
    const STORE_NAME = "songs";

    function openMusicDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = () => {
                const database = request.result;

                if (!database.objectStoreNames.contains(STORE_NAME)) {
                    database.createObjectStore(STORE_NAME, {
                        keyPath: "id"
                    });
                }
            };

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async function saveSongToDatabase(song) {
        const database = await openMusicDatabase();

        return new Promise((resolve, reject) => {
            const transaction = database.transaction(
                STORE_NAME,
                "readwrite"
            );

            transaction.objectStore(STORE_NAME).put({
                id: song.id,
                file: song.file,
                title: song.title,
                artist: song.artist,
                artwork: song.artwork || ""
            });

            transaction.oncomplete = () => {
                database.close();
                resolve();
            };

            transaction.onerror = () => {
                database.close();
                reject(transaction.error);
            };

            transaction.onabort = () => {
                database.close();
                reject(transaction.error);
            };
        });
    }

    async function getSavedSongsFromDatabase() {
        const database = await openMusicDatabase();

        return new Promise((resolve, reject) => {
            const transaction = database.transaction(
                STORE_NAME,
                "readonly"
            );

            const request = transaction
                .objectStore(STORE_NAME)
                .getAll();

            request.onsuccess = () => {
                const result = request.result || [];
                database.close();
                resolve(result);
            };

            request.onerror = () => {
                database.close();
                reject(request.error);
            };
        });
    }

    async function deleteSongFromDatabase(id) {
        const database = await openMusicDatabase();

        return new Promise((resolve, reject) => {
            const transaction = database.transaction(
                STORE_NAME,
                "readwrite"
            );

            transaction.objectStore(STORE_NAME).delete(id);

            transaction.oncomplete = () => {
                database.close();
                resolve();
            };

            transaction.onerror = () => {
                database.close();
                reject(transaction.error);
            };
        });
    }

    function saveFavorites() {
        localStorage.setItem(
            "vibewaveFavorites",
            JSON.stringify([...favorites])
        );
    }

    // ==========================================
    // HELPER FUNCTIONS
    // ==========================================

    function formatTime(seconds) {
        if (!Number.isFinite(seconds) || seconds < 0) {
            return "0:00";
        }

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
    }

    function updateTime() {
        if (currentTimeElement) {
            currentTimeElement.textContent =
                formatTime(audio.currentTime);
        }

        if (durationElement) {
            durationElement.textContent =
                formatTime(audio.duration);
        }

        if (progressBar && Number.isFinite(audio.duration)) {
            progressBar.value =
                (audio.currentTime / audio.duration) * 100;
        }
    }

    function updatePlayButton() {
        if (!playButton) return;

        const playing = !audio.paused;

        playButton.textContent = playing ? "❚❚" : "▶";

        playButton.setAttribute(
            "aria-label",
            playing ? "Pause" : "Play"
        );
    }

    function updateSongInformation(song) {
        if (!song) return;

        if (songTitle) {
            songTitle.textContent = song.title;
        }

        if (artistName) {
            artistName.textContent = song.artist;
        }

        if (albumArtwork && song.artwork) {
            albumArtwork.src = song.artwork;
            albumArtwork.alt = `${song.title} artwork`;
        }
    }

    function getVisibleSongs() {
        if (!showingFavorites) {
            return songs;
        }

        return songs.filter(song => favorites.has(song.id));
    }

    // ==========================================
    // PLAYLIST RENDERING
    // ==========================================

    function renderPlaylist() {
        if (!playlistElement) return;

        const visibleSongs = getVisibleSongs();

        playlistElement.replaceChildren();

        if (songCountElement) {
            songCountElement.textContent = songs.length;
        }

        if (visibleSongs.length === 0) {
            const message = document.createElement("p");

            message.textContent = showingFavorites
                ? "No favorite songs yet."
                : "Your playlist is waiting. Add audio files to start listening.";

            playlistElement.appendChild(message);
            return;
        }

        visibleSongs.forEach(song => {
            const row = document.createElement("div");
            row.className = "song-item";

            if (song.id === songs[currentIndex]?.id) {
                row.classList.add("active");
            }

            const details = document.createElement("button");
            details.type = "button";
            details.className = "song-details";

            const title = document.createElement("span");
            title.textContent = song.title;

            const artist = document.createElement("small");
            artist.textContent = song.artist;

            details.append(title, artist);

            details.addEventListener("click", () => {
                const index = songs.findIndex(
                    item => item.id === song.id
                );

                if (index !== -1) {
                    playSong(index);
                }
            });

            const favorite = document.createElement("button");
            favorite.type = "button";
            favorite.className = "favorite-btn";

            favorite.textContent = favorites.has(song.id)
                ? "♥"
                : "♡";

            favorite.setAttribute(
                "aria-label",
                "Toggle favorite"
            );

            favorite.addEventListener("click", () => {
                toggleFavorite(song.id);
            });

            row.append(details, favorite);
            playlistElement.appendChild(row);
        });
    }

    // ==========================================
    // ADD SONGS FROM YOUR COMPUTER
    // ==========================================

    async function addFiles(files) {
        const audioFiles = Array.from(files).filter(file => {
            return file.type.startsWith("audio/") ||
                /\.(mp3|wav|ogg|m4a|aac|flac|opus|webm)$/i.test(file.name);
        });

        if (audioFiles.length === 0) {
            alert("Please select valid audio files.");
            return;
        }

        for (const file of audioFiles) {
            // Prevent duplicate imports with the same filename.
            const alreadyExists = songs.some(
                song => song.title === file.name.replace(/\.[^/.]+$/, "")
            );

            if (alreadyExists) {
                continue;
            }

            const song = {
                title: file.name.replace(/\.[^/.]+$/, ""),
                artist: "Local Audio",
                artwork: ""
            };

            try {
                await saveSongToDatabase(song);
                songs.push(song);

            } catch (error) {
                console.error("Could not save song:", error);

                URL.revokeObjectURL(song.url);

                alert(
                    `Could not save "${file.name}". Check available browser storage.`
                );
            }
        }

        renderPlaylist();

        if (currentIndex === -1 && songs.length > 0) {
            const firstIndex = songs.length - 1;
            await playSong(firstIndex);
        }
    }

    if (fileInput) {
        fileInput.addEventListener("change", async event => {
            await addFiles(event.target.files);
            fileInput.value = "";
        });
    }

    // ==========================================
    // PLAY A SONG
    // ==========================================

    async function playSong(index) {
        if (songs.length === 0) {
            alert("Please add some songs first.");
            return;
        }

        if (index < 0 || index >= songs.length) return;

        currentIndex = index;

        const song = songs[currentIndex];

        audio.src = song.url;
        audio.load();

        updateSongInformation(song);
        renderPlaylist();

  try {
    await audio.play();
} catch (error) {
    if (error.name !== "AbortError") {
        console.error("Playback error:", error);
    }
}

updatePlayButton();
    }

    // ==========================================
    // PLAY / PAUSE
    // ==========================================

    if (playButton) {
        playButton.addEventListener("click", async () => {
            if (songs.length === 0) {
                alert("Upload audio files to start listening.");
                return;
            }

            if (audio.paused) {
                try {
                    await audio.play();
                } catch (error) {
                    if (error.name !== "AbortError") {
                        console.error("Playback error:", error);
                    }
                }
            } else {
                audio.pause();
            }

            updatePlayButton();
        });
    }

    audio.addEventListener("play", updatePlayButton);
    audio.addEventListener("pause", updatePlayButton);

    // ==========================================
    // NEXT / PREVIOUS
    // ==========================================

    function playNext() {
        if (songs.length === 0) return;

        if (isShuffle && songs.length > 1) {
            let nextIndex;

            do {
                nextIndex = Math.floor(Math.random() * songs.length);
            } while (nextIndex === currentIndex);

            playSong(nextIndex);
            return;
        }

        if (currentIndex < songs.length - 1) {
            playSong(currentIndex + 1);
        } else if (repeatMode === "all") {
            playSong(0);
        } else {
            audio.pause();
            audio.currentTime = 0;
            updatePlayButton();
        }
    }

    function playPrevious() {
        if (songs.length === 0) return;

        if (audio.currentTime > 3) {
            audio.currentTime = 0;
            return;
        }

        if (currentIndex > 0) {
            playSong(currentIndex - 1);
        } else if (repeatMode === "all") {
            playSong(songs.length - 1);
        } else {
            audio.currentTime = 0;
        }
    }

    if (nextButton) {
        nextButton.addEventListener("click", playNext);
    }

    if (previousButton) {
        previousButton.addEventListener("click", playPrevious);
    }

    audio.addEventListener("ended", () => {
        if (repeatMode === "one") {
            audio.currentTime = 0;
            audio.play();
        } else {
            playNext();
        }
    });

    // ==========================================
    // PROGRESS BAR / SEEK
    // ==========================================

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateTime);
    audio.addEventListener("durationchange", updateTime);

    if (progressBar) {
        progressBar.addEventListener("input", () => {
            if (Number.isFinite(audio.duration)) {
                audio.currentTime =
                    (Number(progressBar.value) / 100) * audio.duration;
            }
        });
    }

    // ==========================================
    // VOLUME / MUTE
    // ==========================================

    if (volumeSlider) {
        volumeSlider.value = audio.volume;

        volumeSlider.addEventListener("input", () => {
            audio.volume = Number(volumeSlider.value);
            audio.muted = false;

            if (audio.volume > 0) {
                lastVolume = audio.volume;
            }

            updateMuteButton();
        });
    }

    function updateMuteButton() {
        if (!muteButton) return;

        muteButton.textContent =
            audio.muted || audio.volume === 0 ? "🔇" : "🔊";
    }

    if (muteButton) {
        muteButton.addEventListener("click", () => {
            if (audio.muted || audio.volume === 0) {
                audio.muted = false;
                audio.volume = lastVolume || 1;

                if (volumeSlider) {
                    volumeSlider.value = audio.volume;
                }
            } else {
                lastVolume = audio.volume;
                audio.muted = true;
            }

            updateMuteButton();
        });
    }

    // ==========================================
    // SHUFFLE
    // ==========================================

    if (shuffleButton) {
        shuffleButton.addEventListener("click", () => {
            isShuffle = !isShuffle;

            shuffleButton.classList.toggle("active", isShuffle);

            shuffleButton.setAttribute(
                "aria-pressed",
                String(isShuffle)
            );
        });
    }

    // ==========================================
    // REPEAT: OFF -> ALL -> ONE
    // ==========================================

    if (repeatButton) {
        repeatButton.addEventListener("click", () => {
            if (repeatMode === "off") {
                repeatMode = "all";
            } else if (repeatMode === "all") {
                repeatMode = "one";
            } else {
                repeatMode = "off";
            }

            repeatButton.classList.toggle(
                "active",
                repeatMode !== "off"
            );

            repeatButton.textContent =
                repeatMode === "one" ? "🔂" : "🔁";

            repeatButton.title = `Repeat: ${repeatMode}`;
        });
    }

    // ==========================================
    // FAVORITES
    // ==========================================

    function toggleFavorite(id) {
        if (favorites.has(id)) {
            favorites.delete(id);
        } else {
            favorites.add(id);
        }

        saveFavorites();
        renderPlaylist();
    }

    if (favoritesButton) {
        favoritesButton.addEventListener("click", () => {
            showingFavorites = !showingFavorites;

            favoritesButton.classList.toggle(
                "active",
                showingFavorites
            );

            renderPlaylist();
        });
    }

    // ==========================================
    // LOAD DEFAULT SONGS FROM PROJECT FOLDER
    // ==========================================

// ==========================================
// LOAD DEFAULT SONGS FROM PROJECT FOLDER
// ==========================================

async function loadDefaultSongs() {
    const defaultSongs = [
        {
            id: "default-song-1",
            title: "Song 1",
            artist: "VibeWave",
            url: "songs/song1.mp3"
        },
        {
            id: "default-song-2",
            title: "Song 2",
            artist: "VibeWave",
            url: "songs/song2.mp3"
        },
        {
            id: "default-song-3",
            title: "Song 3",
            artist: "VibeWave",
            url: "songs/song3.mp3"
        }
    ];

    for (const item of defaultSongs) {
        // Don't add the same default song twice.
        if (songs.some(song => song.id === item.id)) {
            continue;
        }

        try {
            const response = await fetch(item.url);

            if (!response.ok) {
                console.error(
                    "Could not load song:",
                    item.url,
                    response.status
                );
                continue;
            }

            const blob = await response.blob();

            const song = {
                id: item.id,
                title: item.title,
                artist: item.artist,
                file: blob,
                url: URL.createObjectURL(blob),
                artwork: ""
            };

            // Save song so it remains available after refresh.
            await saveSongToDatabase(song);

            songs.push(song);

        } catch (error) {
            console.error(
                "Error loading default song:",
                item.url,
                error
            );
        }
    }

    renderPlaylist();
}

    // ==========================================
    // INITIALIZE PLAYER
    // ==========================================

    async function initializePlayer() {
        audio.volume = 1;

        try {
            // First load songs already saved in IndexedDB.
            const savedSongs = await getSavedSongsFromDatabase();

            songs = savedSongs.map(savedSong => ({
                ...savedSong,
                url: URL.createObjectURL(savedSong.file)
            }));

            // IMPORTANT: Automatically load songs from the songs folder.
            await loadDefaultSongs();

            // Remove favorites that no longer exist.
            const validIds = new Set(songs.map(song => song.id));

            for (const id of favorites) {
                if (!validIds.has(id)) {
                    favorites.delete(id);
                }
            }

            saveFavorites();

        } catch (error) {
            console.error("Could not initialize saved songs:", error);

            alert(
                "Songs could not be loaded. Check the browser console for errors."
            );
        }

        updatePlayButton();
        updateMuteButton();
        updateTime();
        renderPlaylist();

        console.log("VibeWave Music Player initialized.");
    }

    // Start the player.
    initializePlayer();

});