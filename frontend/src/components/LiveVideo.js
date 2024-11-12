import React from 'react';
import '../styles/YouTubeEmbed.css'; 

function YouTubeEmbed({ url }) {
    const videoId = url.split("v=")[1]?.split("&")[0];

    if (!videoId) {
        return <p>Invalid YouTube URL</p>;
    }

    const iframeStyles = {
        maxWidth: '100%',
        width: '100%',
        height: '500px', // You can adjust this height as needed
        border: 'none',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        margin: '20px 0',
      };

    return (
        <>
        <h1 className="text-center mb-4">LiveStream Video</h1>
        <div className="video-container" style={{ padding: '0 20px' }}>
      <iframe
        style={iframeStyles}
        src={`https://www.youtube.com/embed/${videoId}`}
        frameBorder="0"
        allowFullScreen
        title="Embedded YouTube Video"
      ></iframe>
    </div>
        </>
    );
}

export default YouTubeEmbed;
