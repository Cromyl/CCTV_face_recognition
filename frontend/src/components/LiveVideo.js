import React from 'react';
import '../styles/YouTubeEmbed.css'; 

function YouTubeEmbed({ url }) {
    const videoId = url.split("v=")[1]?.split("&")[0];

    if (!videoId) {
        return <p>Invalid YouTube URL</p>;
    }

    return (
        <div className="video-container">
            <iframe
                width="560"
                height="315"
                src={`https://www.youtube.com/embed/${videoId}`}
                frameBorder="0"
                allowFullScreen
                title="Embedded YouTube Video"
            ></iframe>
        </div>
    );
}

export default YouTubeEmbed;
