import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/navbar.css'
import CurrentUTC from './CurrentTime.js'
function Navbar() {
  return (
    <header className="navbar navbar-expand-lg navbar-dark bg-black sticky-top">
      <div className="container">
        <a href="/" className="navbar-brand custom-brand ">App Name</a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {/* <li className="nav-item">
              <a href="#home" className="nav-link">Home</a>
            </li>
            <li className="nav-item">
              <a href="#features" className="nav-link">Features</a>
            </li>
            <li className="nav-item">
              <a href="#about" className="nav-link">About</a>
            </li> */}
            <li className="" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' , marginBottom:0}}>
                <CurrentUTC/>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
