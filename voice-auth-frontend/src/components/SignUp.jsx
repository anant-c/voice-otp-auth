// src/components/SignUp.js
import React, { useState } from 'react';
import axios from 'axios';

function SignUp() {
  const [userId, setUserId] = useState('');
  const [audioSamples, setAudioSamples] = useState([]);

  const handleFileChange = (e) => {
    setAudioSamples(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('user_id', userId);

    for (let i = 0; i < audioSamples.length; i++) {
      formData.append('audio_samples', audioSamples[i]);
    }

    try {
      const response = await axios.post('http://localhost:5000/enroll', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert(response.data.message);
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  return (
    <div className="signup">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <label>User ID:</label>
        <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} required />

        <label>Upload Voice Samples (5-10):</label>
        <input type="file" multiple accept="audio/*" onChange={handleFileChange} required />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default SignUp;
