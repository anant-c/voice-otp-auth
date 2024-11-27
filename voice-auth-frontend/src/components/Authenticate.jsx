// src/components/Authenticate.js
import React, { useState } from 'react';
import axios from 'axios';
import AudioRecorder from './AudioRecorder';

function Authenticate() {
  const [userId, setUserId] = useState('');
  const [audioSample, setAudioSample] = useState(null);

  const handleAudioCapture = (audioBlob) => {
    setAudioSamples(prevSamples => [...prevSamples, audioBlob]);
    setSampleCount(count => count + 1);

    if (sampleCount + 1 < requiredSamples) {
      fetchRandomPrompt();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('audio_sample', audioSample);

    try {
      const response = await axios.post('http://localhost:5000/authenticate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert(response.data.message);
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  return (
    <div className="bg-bkg text-content min-h-screen w-screen grid place-items-center bg-fixed">
      <h2 className= "font-bold text-center py-10 text-6xl underline decoration-accent-1 ">Authenticate</h2>
      <form onSubmit={handleSubmit}>
        <div className="wow fadeInUp shadow-three dark:bg-gray-dark mb-12 rounded-sm bg-white px-8 py-11 sm:p-[55px] lg:mb-5 lg:px-8 xl:p-[55px]" data-wow-delay=".15s">
          <p className= "max-w-[800px] text-center mb-12 text-lg !leading-relaxed text-body-color-dark">
            Please perform the voice recognition first then proceed with the otp verification.  
          </p>
          <label className="block text-sm font-medium text-dark dark:text-white">
            User ID:
          </label>
          <input 
            type="text" 
            placeholder="Enter your User ID"
            className="my-5 border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
            value={userId} 
            onChange={(e) => setUserId(e.target.value)} 
            required />

          <AudioRecorder onRecordingComplete={handleAudioCapture} />

          <button type="submit" className="shadow-submit w-full text-center dark:shadow-submit-dark rounded-sm bg-primary px-9 py-4 text-base font-medium text-white duration-300 hover:bg-primary/90">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

export default Authenticate;
