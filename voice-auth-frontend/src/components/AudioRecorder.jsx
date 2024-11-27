import React, { useState, useRef } from 'react';

const AudioRecorder = ({ onRecordingComplete }) => {
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const audioChunks = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    recorder.ondataavailable = event => {
      audioChunks.current.push(event.data);
    };

    recorder.onstop = () => {
      const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
      audioChunks.current = [];
      setAudioUrl(URL.createObjectURL(audioBlob));
      onRecordingComplete(audioBlob); // Send audio blob to SignUp
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
    <div className="flex justify-between">
      <button onClick={startRecording} className="shadow-submit mx-20 mb-5 text-center dark:shadow-submit-dark rounded-sm bg-primary px-9 py-4 text-base font-medium text-white duration-300 hover:bg-primary/90">Start Recording</button>
      <button onClick={stopRecording} disabled={!mediaRecorder} className=" mb-5 mx-20 shadow-submit text-center dark:shadow-submit-dark rounded-sm bg-primary px-9 py-4 text-base font-medium text-white duration-300 hover:bg-primary/90">Stop Recording</button>
      {audioUrl && <audio controls src={audioUrl}  />}
    </div>
  );
};

export default AudioRecorder;
