import React, { useState, useEffect } from 'react';

function NowPlaying() {
    const [trackInfo, setTrackInfo] = useState({
        title: '',
        artist: '',
        album: '',
        artworkUrl: '',
        isPlaying: false,
        error: null
    });

    useEffect(() => {
        const fetchNowPlaying = async () => {
            try {
                const response = await fetch('/now-playing');
                const data = await response.json();

                if (data.error) {
                    setTrackInfo({
                        title: '',
                        artist: '',
                        album: '',
                        artworkUrl: '',
                        isPlaying: false,
                        error: data.error
                    });
                } else {
                    setTrackInfo({
                        ...data,
                        isPlaying: true,
                        error: null
                    });
                }
            } catch (error) {
                setTrackInfo({
                    title: '',
                    artist: '',
                    album: '',
                    artworkUrl: '',
                    isPlaying: false,
                    error: 'Failed to fetch track information'
                });
            }
        };

        // Initial fetch
        fetchNowPlaying();

        // Poll every 10 seconds
        const intervalId = setInterval(fetchNowPlaying, 10000);

        // Cleanup interval on unmount
        return () => clearInterval(intervalId);
    }, []);

    if (!trackInfo.isPlaying) {
        return (
            <div>
                <h1>Now Playing</h1>
                <p>{trackInfo.error || 'No track currently playing'}</p>
            </div>
        );
    }

    return (
        <div>
            <div className="now-playing">
                <img
                    className="image-art"
                    src={trackInfo.artworkUrl}
                    alt={`${trackInfo.album} album art`}
                    style={{}}
                />
                <div className="image-text">
                    <div className="song-title">{trackInfo.title}</div>
                    <div className="artist">{trackInfo.artist}</div>
                </div>
            </div>
        </div>
    );
}

export default NowPlaying;