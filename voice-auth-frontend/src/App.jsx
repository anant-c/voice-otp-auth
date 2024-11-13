// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignUp from './components/SignUp';
import Authenticate from './components/Authenticate';
import Home from './components/Home';
import './App.css'
import AudioRecorder from './components/AudioRecorder';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path = "/audiorecorder" element = {<AudioRecorder/>}/>
          <Route path="/authenticate" element={<Authenticate />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
