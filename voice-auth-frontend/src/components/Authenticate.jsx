// src/components/Authenticate.js
import React, { useState } from 'react';
import axios from 'axios';

function Authenticate() {
  const [userId, setUserId] = useState('');
  const [audioSample, setAudioSample] = useState(null);

  const handleFileChange = (e) => {
    setAudioSample(e.target.files[0]);
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
    <div className="authenticate">
      <h2>Authenticate</h2>
      <form onSubmit={handleSubmit}>
        <label>User ID:</label>
        <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} required />

        <label>Upload Voice Sample:</label>
        <input type="file" accept="audio/*" onChange={handleFileChange} required />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default Authenticate;
