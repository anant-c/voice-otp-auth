// src/AudioRecorder.js
import React, { useState, useRef } from 'react';
import axios from 'axios';

const AudioRecorder = () => {
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const audioChunks = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    
    recorder.ondataavailable = event => {
      audioChunks.current.push(event.data);
    };

    recorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
      audioChunks.current = [];
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(audioUrl);

      const formData = new FormData();
      formData.append('audioFile', audioBlob, 'recording.wav');

      console.log(formData)
      try {
        await axios.post('https://53c4-34-126-126-246.ngrok-free.app/upload_audio', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        alert('Audio uploaded successfully!');
      } catch (error) {
        console.error('Error uploading audio:', error);
      }
    };

    recorder.start();
    setMediaRecorder(recorder);
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
  };

  return (
    <div>
      <button onClick={startRecording}>Start Recording</button>
      <button onClick={stopRecording} disabled={!mediaRecorder}>Stop Recording</button>
      {audioUrl && <audio controls src={audioUrl} />}
    </div>
  );
};

export default AudioRecorder;
