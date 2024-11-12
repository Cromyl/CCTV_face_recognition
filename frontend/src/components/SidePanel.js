import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const SidePanel = () => {
  const [selectedLink, setSelectedLink] = useState('/');

  const handleLinkClick = (path) => {
    setSelectedLink(path);
  };

  const styles = {
    maxWidth: '300px',
  };

  return (
    <div className="side-panel bg-dark p-4" style={styles}>
      <h5 className="mb-4">Features</h5>
      <ul className="list-unstyled">
        <li>
          <Link
            to="/"
            className={`text-decoration-none ${selectedLink === '/' ? 'active' : ''}`}
            onClick={() => handleLinkClick('/')}
          >
            Welcome!
          </Link>
        </li>
        <li>
          <Link
            to="/video"
            className={`text-decoration-none ${selectedLink === '/video' ? 'active' : ''}`}
            onClick={() => handleLinkClick('/video')}
          >
            Live Video
          </Link>
        </li>
        <li>
          <Link
            to="/crowddensity"
            className={`text-decoration-none ${selectedLink === '/crowddensity' ? 'active' : ''}`}
            onClick={() => handleLinkClick('/crowddensity')}
          >
            Crowd Analysis
          </Link>
        </li>
        <li>
          <Link
            to="/unmatched"
            className={`text-decoration-none ${selectedLink === '/unmatched' ? 'active' : ''}`}
            onClick={() => handleLinkClick('/unmatched')}
          >
            Unknown Faces
          </Link>
        </li>
        <li>
          <Link
            to="/matched"
            className={`text-decoration-none ${selectedLink === '/matched' ? 'active' : ''}`}
            onClick={() => handleLinkClick('/matched')}
          >
            Known Faces
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default SidePanel;
