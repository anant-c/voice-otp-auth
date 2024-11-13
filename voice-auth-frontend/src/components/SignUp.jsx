// src/components/SignUp.jsx
import React, { useState } from 'react';
import axios from 'axios';

function SignUp() {
  const [userId, setUserId] = useState('');
  const [audioSamples, setAudioSamples] = useState([]); // Array to hold audio samples
  const [randomPrompt, setRandomPrompt] = useState('');
  const [sampleCount, setSampleCount] = useState(0);
  const requiredSamples = 5; // Number of samples required

  const fetchRandomPrompt = async () => {
    try {
      const response = await fetch('http://metaphorpsum.com/paragraphs/1/6');
      const text = await response.text();
      setRandomPrompt(text);
    } catch (error) {
      console.error("Error fetching random prompt:", error);
      alert("Failed to load the prompt. Please try again.");
    }
  };

  const handleVoiceCapture = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const audioSample = event.results[0][0].transcript; // This will simulate an audio capture
      setAudioSamples((prevSamples) => [...prevSamples, audioSample]);
      setSampleCount((count) => count + 1);

      if (sampleCount + 1 >= requiredSamples) {
        alert("Voice capture completed!");
      } else {
        fetchRandomPrompt();
      }
    };

    recognition.onerror = (event) => {
      console.error("Recognition error:", event.error);
      alert("Voice capture error. Please try again.");
    };

    recognition.start();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('user_id', userId);

    audioSamples.forEach((sample, index) => {
      formData.append(`audio_sample_${index + 1}`, sample);
    });

    try {
      const response = await axios.post('http://localhost:5173/signup', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert(response.data.message);
    } catch (error) {
      alert(error.response?.data?.message || "Enrollment failed.");
    }
  };

  return (
    <div className="signup">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <label>User ID:</label>
        <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} required />

        {sampleCount < requiredSamples && (
          <>
            <button type="button" onClick={fetchRandomPrompt}>Generate Prompt</button>
            <p>Please read the following text aloud:</p>
            <blockquote>{randomPrompt}</blockquote>
            <button type="button" onClick={handleVoiceCapture}>Start Recording</button>
          </>
        )}

        <p>Captured Samples: {sampleCount}/{requiredSamples}</p>

        <button type="submit" disabled={sampleCount < requiredSamples}>Submit</button>
      </form>
    </div>
  );
}

export default SignUp;
