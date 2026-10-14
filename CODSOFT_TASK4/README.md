# VibeWave Music Player 🎵

VibeWave is a modern, responsive, web-based music player built using
HTML, CSS, and JavaScript.

It allows users to play local audio files, manage a playlist, control
playback, and save their music collection in browser storage.

## Features

- Modern dark UI with orange accents
- Play and pause controls
- Next and previous track controls
- Progress bar with seeking functionality
- Current playback time and song duration
- Volume control and mute option
- Playlist management
- Add audio files from the device
- Default songs loaded from the songs folder
- Save songs using IndexedDB
- Favorite songs
- Shuffle playback
- Repeat modes
- Autoplay option
- Responsive layout for desktop and mobile screens

## Technologies Used

- HTML5
- CSS3
- JavaScript
- HTML Audio API
- IndexedDB
- Local Storage

## Project Structure

CODSOFT_TASK4/
├── index.html
├── style.css
├── script.js
└── songs/
    ├── song1.mp3
    ├── song2.mp3
    └── song3.mp3

## How to Run

1. Download or clone the project.
2. Open the project folder in Visual Studio Code.
3. Make sure the audio files are inside the songs folder.
4. Open index.html using the Live Server extension.
5. Add your own audio files or play the available songs.

## Browser Storage

VibeWave uses IndexedDB to store audio files and Local Storage
to remember favorite songs.

Saved songs are available after refreshing the page in the same
browser, provided the browser data has not been cleared.

## Developer

Abhishek Yadav

VibeWave Music Player — 2026