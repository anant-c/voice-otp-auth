// src/components/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
// import './Home.css'; // Add some styles (optional)

function Home() {
  return (
    <div className="bg-bkg text-content h-screen w-screen place-items-center">
      <h1 className="font-bold text-center py-10 text-6xl underline decoration-accent-1 ">Welcome to Voice OTP Authentication</h1>
      
      <p className="max-w-[800px] text-center mb-12 text-lg !leading-relaxed text-body-color-dark">
        Experience the future of secure authentication with our multilingual, deep learning-powered system. 
        Seamlessly verify users using advanced voice recognition technology and persona lized enrollment.
      </p>

      <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
        <Link to="/signup">
          <button className= "rounded-sm bg-primary px-8 py-4 text-base font-semibold text-white duration-300 ease-in-out hover:bg-primary/80">Sign Up</button>
        </Link>
      
        <Link to="/authenticate">
          <button className="inline-block rounded-sm bg-black px-8 py-4 text-base font-semibold text-white duration-300 ease-in-out hover:bg-black/90 dark:bg-white/10 dark:text-white dark:hover:bg-white/5">Authenticate</button>
        </Link>
      </div>
    </div>
  );
}

export default Home;
