// import React from 'react';
// import './App.css';
// import CrowdDensity from './components/crowdDensity';
// import Unmatched from './components/Fetch_from_unmatched';
// import Navbar from './components/navbar';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import CurrentUTC from './components/CurrentTime';
// import YouTubeEmbed from './components/LiveVideo';

// function App() {
//   return (
//     <div className="app-container">
//       <Navbar />
//       <CurrentUTC/>
//       <YouTubeEmbed url="https://www.youtube.com/watch?v=vAZcPhMACeo"/>
//       <CrowdDensity/>
//       <div className="mt-4">
//         <Unmatched />
//       </div>
//     </div>
//   );
// }

// export default App;
import React from 'react';
import { BrowserRouter , Route, Routes, Link } from 'react-router-dom';
import './App.css';
import CrowdDensity from './components/crowdDensity';
import Unmatched from './components/Fetch_from_unmatched';
import Matched from './components/fetch_from_matched';
import Navbar from './components/navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import CurrentUTC from './components/CurrentTime';
import YouTubeEmbed from './components/LiveVideo';
import LandingPage from './components/LandingPage';

function App() {
  return (
    <>
    
    <BrowserRouter>
      <Navbar />
      <div className="app-container d-flex">
        {/* Side Panel */}
        <div className="side-panel bg-dark p-4">
          <h5 className="mb-4">Features</h5>
          <ul className="list-unstyled">
            <li>
              <Link to="/" className="text-decoration-none">Welcome!</Link>
            </li>
            <li>
              <Link to="/video" className="text-decoration-none">Live Video</Link>
            </li>
            <li>
              <Link to="/crowddensity" className="text-decoration-none">Crowd Density</Link>
            </li>
            <li>
              <Link to="/unmatched" className="text-decoration-none">Unmatched Faces</Link>
            </li>
            <li>
              <Link to="/matched" className="text-decoration-none">Matched Faces</Link>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="main-content flex-grow-1 p-4">
          {/* <CurrentUTC /> */}
          <Routes>
            <Route path="/" element={<LandingPage/>}/>
            <Route path="/video" element={<YouTubeEmbed url="https://www.youtube.com/watch?v=vAZcPhMACeo" />} />
            <Route path="/crowddensity" element={<CrowdDensity />} />
            <Route path="/unmatched" element={<Unmatched />} />
            <Route path="/matched" element={<Matched />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
    </>
  );
}

export default App;
