'use client'

import { IoSend } from "react-icons/io5";
import { TbMessageCircle2Filled } from "react-icons/tb";
import { FaMinus } from "react-icons/fa";
import { RxCross1 } from "react-icons/rx";
import { FaMicrophone } from "react-icons/fa6";
import { RiUserVoiceFill } from "react-icons/ri";
import { MdVoiceOverOff } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { RiRobot3Line } from "react-icons/ri";
import axios from 'axios';
import { LuUser } from "react-icons/lu";
import { menuItem } from "@/lib/menuItem";
import { extractLinks } from "@/lib/extractlink";
import MessagesShower from "./MessagesShower";
import { MdSwapHorizontalCircle } from "react-icons/md";
import { MdSwapVerticalCircle } from "react-icons/md";

const Voicebot = () => {

  const [showBot, setShowBot] = useState(false);
  const [voiceOutPut, setVoiceOutput] = useState(false);
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [onListening, setOnListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [language, setLanguage] = useState('en-US')
  const [modal, setModal] = useState(false);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [textLinks, setTextLinks] = useState([]);
  const [swap, setSwap] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Function to open the modal
  const openModal = () => setIsModalOpen(true);

  // Function to close the modal
  const closeModal = () => setIsModalOpen(false);

  // Modal component


  const sendTextToFlowise = async (text) => {
    setIsBotThinking(true);
    const url = 'https://aigeene-backend-bca9d58acf33.herokuapp.com/api/text-to-text';
    const data = {
      question: text
    };

    const usertext = {
      text,
      sender: 'user'
    }

    setMessages([...messages, usertext]);
    setText('');
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

    

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      const links = extractLinks(result.text);
      setTextLinks(...links);
      

      setIsBotThinking(false);

      const botText = {
        text: result.text,
        sender: 'bot'
      }

      setMessages(prevMessages => [...prevMessages, botText]);

    } catch (error) {
      console.error('Error:', error);
    }
  }

  // Define audio variable outside to make it globally accessible within this module
var audio = null;

const runSpeechRecognition = (state) => {
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var recognition = new SpeechRecognition();
  recognition.lang = language;

  if (state === 'start') {
    recognition.onstart = () => {
      setOnListening(true);
    };

    recognition.onspeechend = () => {
      recognition.stop();
      setOnListening(false);
    };

    recognition.onresult = async (event) => {
      var transcript = event.results[0][0].transcript;
      const usertext = {
        text: transcript,
        sender: 'user',
      };
      setMessages([...messages, usertext]);

      let res = await axios.post('https://aigeene-backend-bca9d58acf33.herokuapp.com/api/text-to-audio-file', {
        question: transcript,
        language,
      });
      
      const botText = {
        text: res.data.response.text,
        sender: 'bot',
      };

      setMessages((prevMessages) => [...prevMessages, botText]);

      setSpeaking(true);
      // Convert the Buffer to a Blob
      var arrayBuffer = new Uint8Array(res.data.audioResponse.data).buffer;
      var blob = new Blob([arrayBuffer], { type: 'audio/mp3' });

      // Create an object URL from the Blob
      var url = URL.createObjectURL(blob);

      // Stop any previously playing audio
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        URL.revokeObjectURL(audio.src); // Clean up the object URL to release resources
      }

      // Create a new Audio object and play the audio
      audio = new Audio(url);
      audio.play();
      audio.onended = () => {
        setSpeaking(false);
      };
    };

    recognition.start();
  } else if (state === 'stop') {
    // Stop the audio if it's playing
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      URL.revokeObjectURL(audio.src); // Clean up the object URL to release resources
      audio = null; // Clear the audio object to ensure it's fully stopped
    }
    // Stop speech recognition if it's running
    recognition.abort();
    setOnListening(false);
    setSpeaking(false);
  }
};


  const clearAllmessage = () => {
    setMessages([]);
    setShowBot(false);
    setModal(false);
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages]);

  const Modal = () => (
    <div className=" flex space-x-3 absolute top-3/4 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-5 rounded-lg shadow">
    <div className="cursor-pointer" onClick={() => runSpeechRecognition('start')}>Start Speaking</div>
    
    <button onClick={closeModal} className="ml-2">X</button>
  </div>
  );

  return (
    <section className="absolute bottom-4 right-4  rounded-2xl  ">
      {showBot && <div className=" flex flex-col  w-[400px] h-[85vh]  rounded-3xl border">
        <div className="bg-white border-b-2 flex-grow-0 p-3 flex justify-between items-center rounded-t-2xl  shadow-md ">
          <Image src={'https://i.ibb.co/LP36Jnb/Aigeenee-logo.png'} width={150} height={100} alt="bot_logo" />

          <div className=" space-x-2 flex items-center ">
         { swap ? <MdSwapHorizontalCircle onClick={() => setVoiceOutput(!voiceOutPut)}  size={25} className="cursor-pointer" /> : <MdSwapVerticalCircle  onClick={() => setVoiceOutput(!voiceOutPut)} size={25} className="cursor-pointer" /> }
            <select defaultValue="en-US" className="border rounded-lg p-2 " onChange={(event) => setLanguage(event.target.value)} >
              <option value="en-US">English</option>
              <option value="ar">Arabic</option>
            </select>
            <FaMinus color="#47AC47" onClick={() => setShowBot(!showBot)} className="cursor-pointer " size={25} />
            <RxCross1 color="#47AC47" onClick={() => setModal(!modal)} className="cursor-pointer" size={25} />
          </div>
        </div>

        {!voiceOutPut &&  <div className=" bg-[#F8F8F8] flex-grow overflow-y-auto p-4 relative">

          {modal &&
            <div className=" z-20  inset-0 flex items-center justify-center absolute ">
              {modal &&
                <div className="bg-white rounded-lg shadow-2xl  p-6 w-64 m-auto">
                  <p className="text-gray-700 text-lg font-semibold mb-4">Delete all history?</p>
                  <div className="flex justify-end space-x-4">
                    <button onClick={() => clearAllmessage()} className="bg-red-500 text-white rounded-lg px-4 py-2 transition duration-300 ease-in-out hover:bg-red-600 active:bg-red-700 focus:outline-none">Yes</button>
                    <button onClick={() => setModal(false)} className="bg-gray-300 text-gray-700 rounded-lg px-4 py-2 transition duration-300 ease-in-out hover:bg-gray-400 active:bg-gray-500 focus:outline-none">No</button>
                  </div>
                </div>
              }
            </div>
          }
          {messages.length == 0 &&
            <div className="h-full w-full flex flex-col justify-center items-center space-y-4">

              <Image src={'/absher.gif'} width={300} height={300} />

              <div className=" w-full h-full rounded-md grid grid-cols-3 gap-4 justify-center ">
                {menuItem.map((item) =>
                  <div onClick={() => sendTextToFlowise(item.name)} className=" shadow-md rounded-3xl hover:bg-gradient-to-br from-slate-50 to-zinc-200  cursor-pointer space-y-3 p-1  border-gray-700 border flex flex-col justify-center items-center text-center">
                    <p className="text-black font-semibold">{item.icon}</p>
                    <h2 className="font-normal text-xs text-black rounded">{item.name}</h2>
                  </div>
                )}
              </div>
            </div>
          }

          {messages.map((item, index) =>  <MessagesShower runSpeechRecognition={runSpeechRecognition} key={index} item={item} setMessages={setMessages}  /> )}
          <div ref={messagesEndRef} />
        </div>}

        {!voiceOutPut && <div className="bg-white shadow-2xl b-white flex-grow-0 p-3   border-t-2  rounded-b-3xl border-gray-300 ">
          <div className="  px-2 flex items-center">
            <form className="w-full" onSubmit={(e) => { e.preventDefault(); sendTextToFlowise(text); }}>
              <div className="flex w-full" >
                <input value={text} onChange={(e) => setText(e.target.value)} type="text" className="flex-grow p-2 outline-none" placeholder="write here" />
                <div className="flex-grow-0 flex items-center space-x-3">

                    <div>
                      <FaMicrophone color="#47AC47" onClick={openModal} size={20} className="cursor-pointer" />
                      {isModalOpen && <Modal />}
                    </div>

                  <button type="submit">
                    <IoSend color="#47AC47" size={20} className="cursor-pointer" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>}

        {voiceOutPut && <div className=" rounded-b-3xl w-full h-full bg-black flex flex-col justify-evenly text-white items-center " >
               {speaking && <Image src={'/speaking.gif'} width={200} height={200} /> }
               
              <FaMicrophone color="#47AC47" onClick={() => runSpeechRecognition('start')} size={35} className="cursor-pointer" />
              {onListening && <Image src={'/ai_.gif'} width={200} height={200} /> }
            
        </div>}

      </div>}

      <div onClick={() => setShowBot(!showBot)} className="w-16 h-16 bg-green-300 flex justify-center items-center rounded-full cursor-pointer " >
        <TbMessageCircle2Filled size={24} />

      </div>

    </section>
  )
}

export default Voicebot;




