import React from 'react';
import './App.css';
import CrowdDensity from './components/crowdDensity';
import Unmatched from './components/Fetch_from_unmatched';
import Navbar from './components/navbar';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <div className="mt-4">
        <Unmatched />
      </div>
    </div>
  );
}

export default App;
