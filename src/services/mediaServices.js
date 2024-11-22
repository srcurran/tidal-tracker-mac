const express = require('express');
const applescript = require('applescript');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;
const lastfmApiKey = process.env.lastfmApiKey;
app.use(cors());

app.get('/now-playing', async (req, res) => {
    console.log("running script");
    const script = `
    if application "TIDAL" is running then
        tell application "System Events"
            tell process "TIDAL"
                try
                    set windowTitle to name of window 1
                    return windowTitle
                on error
                    return "No track playing"
                end try
            end tell
        end tell
    else
        return "TIDAL not running"
    end if
  `;

    applescript.execString(script, async (err, result) => {
        if (err || !result || result === "TIDAL not running" || result === "No track playing") {
            return res.json({ error: 'No track playing' });
        }

        // Parse the window title
        const parts = result.split(' - ');
        if (parts.length >= 2) {
            try {
                // Fetch artwork (replace with actual Tidal or music metadata API)
                const artworkUrl = await fetchAlbumArtwork(parts[0], parts[1]);

                res.json({
                    title: parts[0],
                    artist: parts[1],
                    album: parts[2] || 'Unknown Album',
                    artworkUrl: artworkUrl,
                    isPlaying: true
                });
            } catch (artworkError) {
                res.json({
                    title: parts[0],
                    artist: parts[1],
                    album: parts[2] || 'Unknown Album',
                    artworkUrl: '',
                    isPlaying: true
                });
            }
        } else {
            res.json({ error: 'Could not parse track info' });
        }
    });
});

// Placeholder function for artwork retrieval
async function fetchAlbumArtwork(title, artist) {
    try {
        // Example using last.fm API (you'll need to sign up for an API key)
        const response = await axios.get('http://ws.audioscrobbler.com/2.0/', {
            params: {
                method: 'track.getInfo',
                api_key: lastfmApiKey,
                artist: artist,
                track: title,
                format: 'json'
            }
        });

        // Extract artwork URL from response
//        return response.data.track.album.image[3]['#text'] || '';
        const images = response.data.track.album.image;
        const originalUrl = images[images.length - 1]['#text'];
        // Replace size in URL to get larger image
        return originalUrl.replace(/300x300/, '1200x1200');
    } catch (error) {
        console.error('Failed to fetch artwork:', error);
        return '';
    }
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});