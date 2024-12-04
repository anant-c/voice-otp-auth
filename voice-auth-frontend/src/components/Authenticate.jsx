import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AudioRecorder from './AudioRecorder'; // Ensure you have this component
import languageIcon from '../assets/languagechat.png'; // Ensure the image path is correct

function Authenticate() {
  const [userId, setUserId] = useState('');
  const [audioSample, setAudioSample] = useState(null);
  const [randomPrompt, setRandomPrompt] = useState('');
  const [translatedPrompt, setTranslatedPrompt] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [outputMessage, setOutputMessage] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpVerificationMessage, setOtpVerificationMessage] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  // Language options
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'kn', name: 'Kannada' },
    { code: 'mr', name: 'Marathi' },
    { code: 'bn', name: 'Bengali' },
  ];

  // Fetch random prompt and optionally translate it
  const fetchRandomPrompt = async () => {
    try {
      const response = await fetch('http://metaphorpsum.com/paragraphs/1/6');
      const text = await response.text();

      if (selectedLanguage === 'en') {
        setRandomPrompt(text);
      } else {
        const resData = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
            text
          )}&langpair=en|${selectedLanguage}`
        );
        const data = await resData.json();
        setTranslatedPrompt(data.responseData.translatedText || text);
        setRandomPrompt(data.responseData.translatedText || text);
      }
    } catch (error) {
      console.error('Error fetching prompt:', error);
      alert('Failed to fetch prompt. Please try again.');
    }
  };

  // Translate prompt to selected language
  const translatePrompt = async (text, targetLanguage) => {
    if (targetLanguage === 'en') {
      setTranslatedPrompt(text);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
          text
        )}&langpair=en|${targetLanguage}`
      );
      const data = await response.json();
      setTranslatedPrompt(data.responseData.translatedText || text);
    } catch (error) {
      console.error('Translation failed:', error);
      setTranslatedPrompt(text); // Fallback to original text
    }
  };

  // Handle language change and re-translate prompt
  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setSelectedLanguage(newLanguage);
    translatePrompt(randomPrompt, newLanguage);
  };

  // Capture audio recording
  const handleAudioCapture = (audioBlob) => {
    if (!audioBlob) {
      alert('Audio recording failed. Please try again.');
      return;
    }
    console.log('Captured audio blob:', audioBlob);
    setAudioSample(audioBlob);
  };

  // Submit data to backend for voice authentication
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!audioSample) {
      alert('Please record an audio sample before submitting.');
      return;
    }

    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('prompt', randomPrompt);
    formData.append('audio_sample', audioSample, 'audio_sample.wav'); // Ensure consistent file naming

    try {
      const response = await axios.post('https://fc09-34-85-237-134.ngrok-free.app/authenticate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Check response and set the message accordingly
      if (response.data.status === 'success') {
        setOutputMessage(`Authentication successful. Avg decision: ${response.data.avg_decision}`);
        setIsOtpSent(true); // Proceed to OTP
      } else {
        setOutputMessage(`Authentication failed. Avg decision: ${response.data.avg_decision}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error.response || error.message);
      setOutputMessage('Submission failed. Please try again.');
    }
  };

  // Send OTP
  const handleSendOtp = async () => {
    try {
      const response = await axios.post('https://fc09-34-85-237-134.ngrok-free.app/send-otp', {
        phone: phoneNumber,
      });
      if (response.data.message) {
        alert('OTP sent successfully!');
      }
    } catch (error) {
      console.error('Error sending OTP:', error.response || error.message);
      alert('Failed to send OTP. Please try again.');
    }
  };

  // Verify OTP
  const handleOtpSubmit = async () => {
    try {
      const response = await axios.post('https://fc09-34-85-237-134.ngrok-free.app/verify-otp', {
        phone: phoneNumber,
        otp: otp,
      });
      if (response.data.message) {
        setIsOtpVerified(true);
        setOtpVerificationMessage('OTP verified successfully!');
      } else {
        setIsOtpVerified(false);
        setOtpVerificationMessage(response.data.error || 'Invalid OTP.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error.response || error.message);
      setOtpVerificationMessage('OTP verification failed. Please try again.');
    }
  };

  // Fetch a new prompt on component load
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
          <label className="block text-sm font-medium text-dark dark:text-white">User ID:</label>
          <input
            type="text"
            placeholder="Enter your User ID"
            className="my-5 border-stroke dark:text-body-color-dark w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary"
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
          <blockquote className="max-w-[800px] mb-5 border-stroke dark:text-body-color-dark w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color">
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
        {outputMessage && (
          <div className="output-message text-center mt-5">
            <p className={`text-lg ${outputMessage.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>
              {outputMessage}
            </p>
          </div>
        )}
      </form>
      {isOtpSent && (
        <div
          className="otp-verification wow fadeInUp shadow-three dark:bg-gray-dark mb-12 rounded-sm bg-white px-8 py-11 sm:p-[55px] lg:mb-5 lg:px-8 xl:p-[55px]"
          data-wow-delay=".15s"
        >
          <label className="block text-sm font-medium text-dark dark:text-white">Phone Number:</label>
          <input
            type="tel"
            placeholder="Enter your Phone Number"
            className="my-5 border-stroke dark:text-body-color-dark w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <button
            type="button"
            onClick={handleSendOtp}
            className="shadow-submit w-full text-center dark:shadow-submit-dark rounded-sm bg-primary px-9 py-4 text-base font-medium text-white duration-300 hover:bg-primary/90"
          >
            Send OTP
          </button>
          <label className="block text-sm font-medium text-dark dark:text-white mt-5">Enter OTP:</label>
          <input
            type="text"
            placeholder="Enter OTP"
            className="my-5 border-stroke dark:text-body-color-dark w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button
            type="button"
            onClick={handleOtpSubmit}
            className="shadow-submit w-full text-center dark:shadow-submit-dark rounded-sm bg-primary px-9 py-4 text-base font-medium text-white duration-300 hover:bg-primary/90"
          >
            Verify OTP
          </button>
          {otpVerificationMessage && (
            <p
              className={`otp-message text-lg mt-5 ${
                isOtpVerified ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {otpVerificationMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default Authenticate;
