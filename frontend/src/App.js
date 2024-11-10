import React from 'react';
import './App.css';
import CrowdDensity from './components/crowdDensity';
import Unmatched from './components/Fetch_from_unmatched';
import Navbar from './components/navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import CurrentUTC from './components/CurrentTime';
import YouTubeEmbed from './components/LiveVideo';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <CurrentUTC/>
      <YouTubeEmbed url="https://www.youtube.com/watch?v=vAZcPhMACeo"/>
      <CrowdDensity/>
      <div className="mt-4">
        <Unmatched />
      </div>
    </div>
  );
}

export default App;
