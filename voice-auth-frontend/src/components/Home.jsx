// src/components/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
// import './Home.css'; // Add some styles (optional)

function Home() {
  return (
    <div className="home">
      <h1>Welcome to Voice OTP Authentication</h1>
      <div className="buttons">
        <Link to="/signup">
          <button className="home-button">Sign Up</button>
        </Link>
        <Link to="/authenticate">
          <button className="home-button">Authenticate</button>
        </Link>
      </div>
    </div>
  );
}

export default Home;
