import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AudioRecorder from './AudioRecorder';
import languageIcon from '../assets/languagechat.png';

function Authenticate() {
  const [userId, setUserId] = useState('');
  const [audioSample, setAudioSample] = useState(null);
  const [randomPrompt, setRandomPrompt] = useState('');
  const [translatedPrompt, setTranslatedPrompt] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'kn', name: 'Kannada' },
    { code: 'mr', name: 'Marathi' },
    { code: 'bn', name: 'Bengali' },
  ];

  const fetchRandomPrompt = async () => {
    try {
      const response = await fetch('http://metaphorpsum.com/paragraphs/1/6');
      const text = await response.text();
      setRandomPrompt(text);
      translatePrompt(text, selectedLanguage);
    } catch (error) {
      console.error('Failed to fetch random prompt', error);
    }
  };

  const translatePrompt = async (text, targetLanguage) => {
    if (targetLanguage === 'en') {
      setTranslatedPrompt(text);
      return;
    }

    try {
      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLanguage}`);
      const data = await response.json();
      setTranslatedPrompt(data.responseData.translatedText || text);
    } catch (error) {
      console.error('Translation failed', error);
      setTranslatedPrompt(text); // Fallback to the original text if translation fails
    }
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setSelectedLanguage(newLanguage);
    translatePrompt(randomPrompt, newLanguage);
  };

  const handleAudioCapture = (audioBlob) => {
    setAudioSample(audioBlob);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!audioSample) {
      alert('Please record an audio sample before submitting.');
      return;
    }

    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('prompt', randomPrompt);
    formData.append('audio_sample', audioSample, 'sample.wav');

    try {
      const response = await axios.post('http://localhost:5000/authenticate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert(response.data.message);
    } catch (error) {
      alert(error.response?.data?.message || 'Submission failed. Please try again.');
    }
  };

  useEffect(() => {
    fetchRandomPrompt();
  }, []);

  return (
    <div className="bg-bkg text-content min-h-screen w-screen grid place-items-center bg-fixed">
      <h2 className="font-bold text-center py-10 text-6xl underline decoration-accent-1">Authenticate</h2>
      <div className="flex w-screen items-center justify-end py-5">
        <img src={languageIcon} alt="Language Icon" className="w-8 h-8 justify-self-end invert" />
        <select
          className="border-stroke dark:text-body-color-dark dark:shadow-two rounded-sm border bg-[#f8f8f8] p-1 m-2 mr-9 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
          value={selectedLanguage}
          onChange={handleLanguageChange}
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>
      <form onSubmit={handleSubmit}>
        <div
          className="wow fadeInUp shadow-three dark:bg-gray-dark mb-12 rounded-sm bg-white px-8 py-11 sm:p-[55px] lg:mb-5 lg:px-8 xl:p-[55px]"
          data-wow-delay=".15s"
        >
          <p className="max-w-[800px] text-center mb-12 text-lg !leading-relaxed text-body-color-dark">
            Please perform the voice recognition first then proceed with the OTP verification.
          </p>
          <label className="block text-sm font-medium text-dark dark:text-white">User ID:</label>
          <input
            type="text"
            placeholder="Enter your User ID"
            className="my-5 border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={fetchRandomPrompt}
            className="shadow-submit w-full text-center dark:shadow-submit-dark rounded-sm bg-primary px-9 py-4 text-base font-medium text-white duration-300 hover:bg-primary/90"
          >
            Generate a Random Prompt
          </button>
          <p className="max-w-[800px] text-center my-5 text-lg !leading-relaxed text-body-color-dark">
            Please loudly read the below text ...
          </p>
          <blockquote className="max-w-[800px] mb-5 border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none">
            {translatedPrompt || randomPrompt}
          </blockquote>
          <AudioRecorder onRecordingComplete={handleAudioCapture} />
          <button
            type="submit"
            className="shadow-submit w-full text-center dark:shadow-submit-dark rounded-sm bg-primary px-9 py-4 text-base font-medium text-white duration-300 hover:bg-primary/90"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

export default Authenticate;
