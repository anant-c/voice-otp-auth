import React, { useState } from 'react';
import AudioRecorder from './AudioRecorder';

function SignUp() {
  const [userId, setUserId] = useState('');
  const [audioSamples, setAudioSamples] = useState([]);
  const [randomPrompt, setRandomPrompt] = useState('');
  const [sampleCount, setSampleCount] = useState(0);
  const requiredSamples = 10;

  const fetchRandomPrompt = async () => {
    const response = await fetch('http://metaphorpsum.com/paragraphs/1/6');
    const text = await response.text();
    setRandomPrompt(text);
  };

  const handleAudioCapture = (audioBlob) => {
    setAudioSamples(prevSamples => [...prevSamples, audioBlob]);
    setSampleCount(count => count + 1);

    if (sampleCount + 1 < requiredSamples) {
      fetchRandomPrompt();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (audioSamples.length < requiredSamples) {
      alert("Please record the required number of samples before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('prompt', randomPrompt);

    audioSamples.forEach((audioBlob, index) => {
      formData.append(`audioFile${index}`, audioBlob, `sample${index}.wav`);
    });

    try {
      const response = await fetch('https://d8da-34-145-86-226.ngrok-free.app/upload_audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error("Submission failed");
      
      const data = await response.json();
      alert("Submission successful!");
    } catch (error) {
      alert("Submission failed. Please try again.");
    }
  };

  return (  
    <div className="bg-bkg text-content min-h-screen w-screen grid place-items-center bg-fixed">
      <h2 className= "font-bold text-center py-10 text-6xl underline decoration-accent-1 ">Sign Up</h2>
      <form onSubmit={handleSubmit}>
      <div className="wow fadeInUp shadow-three dark:bg-gray-dark mb-12 rounded-sm bg-white px-8 py-11 sm:p-[55px] lg:mb-5 lg:px-8 xl:p-[55px]"
              data-wow-delay=".15s">
                <p className= "max-w-[800px] text-center mb-12 text-lg !leading-relaxed text-body-color-dark">This is a one time process to enroll the user. You have to give 10 voice prints and submit for the signup then you can authenticate for the otp verification.</p>
        <label className="block text-sm font-medium text-dark dark:text-white">User ID</label>
        <input
          type="text"
          placeholder="Enter your User ID"
          className="my-5 border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        />

        {sampleCount < requiredSamples && (
          <>
            <button type="button" onClick={fetchRandomPrompt} className="shadow-submit w-full text-center dark:shadow-submit-dark rounded-sm bg-primary px-9 py-4 text-base font-medium text-white duration-300 hover:bg-primary/90">
              Generate a Random Prompt
            </button>
            <p className="max-w-[800px] text-center my-5 text-lg !leading-relaxed text-body-color-dark">Please loudly read the below text  ...</p>
            <blockquote className="max-w-[800px] mb-5 border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none">{randomPrompt}</blockquote>
            <AudioRecorder onRecordingComplete={handleAudioCapture} />
          </>
        )}

        <p className="mb-3 block text-sm font-medium text-dark dark:text-white">Captured Samples: {sampleCount}/{requiredSamples}</p>
        <button type="submit" disabled={sampleCount < requiredSamples} className="shadow-submit w-full text-center dark:shadow-submit-dark rounded-sm bg-primary px-9 py-4 text-base font-medium text-white duration-300 hover:bg-primary/90">
          Submit
        </button>
        </div>
      </form>
    </div>
  );
}

export default SignUp;
