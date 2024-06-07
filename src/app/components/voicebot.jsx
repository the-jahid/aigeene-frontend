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

  const runSpeechRecognition = () => {
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    var recognition = new SpeechRecognition();
    recognition.lang = language;

    recognition.onstart = () => {
      setOnListening(true)
    };

    recognition.onspeechend = () => {
      recognition.stop();
      setOnListening(false);
    }

    recognition.onresult = async (event) => {
      var transcript = event.results[0][0].transcript;

      const usertext = {
        text: transcript,
        sender: 'user'
      }
      setMessages([...messages, usertext]);

      let res = await axios.post('https://aigeene-backend-bca9d58acf33.herokuapp.com/api/text-to-audio-file', {
        question: transcript,
        language
      })


      const botText = {
        text: res.data.response.text,
        sender: 'bot'
      }

      setMessages(prevMessages => [...prevMessages, botText]);

      setSpeaking(true);
      // Convert the Buffer to a Blob
      var arrayBuffer = new Uint8Array(res.data.audioResponse.data).buffer;
      var blob = new Blob([arrayBuffer], { type: 'audio/mp3' });

      // Create an object URL from the Blob
      var url = URL.createObjectURL(blob);

      // Create a new Audio object and play the audio
      var audio = new Audio(url);
      audio.play();
      audio.onended = () => {
        setSpeaking(false);
      };
    };

    recognition.start();
  }

  const clearAllmessage = () => {
    setMessages([]);
    setShowBot(false);
    setModal(false);
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages]);

  console.log('textLinks', textLinks);

  return (
    <section className="absolute bottom-4 right-4  rounded-2xl  ">
      {showBot && <div className=" flex flex-col  w-[400px] h-[85vh]  rounded-3xl border">
        <div className="bg-white border-b-2 flex-grow-0 p-3 flex justify-between items-center rounded-t-2xl  shadow-md ">
          <Image src={'https://i.ibb.co/LP36Jnb/Aigeenee-logo.png'} width={150} height={100} alt="bot_logo" />

          <div className="flex space-x-2 ">
            <select defaultValue="en-US" className="border rounded-lg p-2 " onChange={(event) => setLanguage(event.target.value)} >
              <option value="en-US">English</option>
              <option value="ar">Arabic</option>
            </select>
            <FaMinus color="#47AC47" onClick={() => setShowBot(!showBot)} className="cursor-pointer " size={25} />
            <RxCross1 color="#47AC47" onClick={() => setModal(!modal)} className="cursor-pointer" size={25} />
          </div>
        </div>

        {!voiceOutPut && <div className=" bg-[#F8F8F8] flex-grow overflow-y-auto p-4 relative">

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
            <div className="h-full w-full flex flex-col justify-center items-center space-y-4  " >

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

          {messages.map((item, index) =>  <MessagesShower key={index} item={item} setMessages={setMessages}  /> )}
          <div ref={messagesEndRef} />
        </div>}

        {!voiceOutPut && <div className="bg-white shadow-2xl b-white flex-grow-0 p-3   border-t-2  rounded-b-3xl border-gray-300 ">
          <div className="  px-2 flex items-center">
            <form className="w-full" onSubmit={(e) => { e.preventDefault(); sendTextToFlowise(text); }}>
              <div className="flex w-full" >
                <input value={text} onChange={(e) => setText(e.target.value)} type="text" className="flex-grow p-2 outline-none" placeholder="write here" />
                <div className="flex-grow-0 flex items-center space-x-3">

                  <FaMicrophone color="#47AC47" onClick={() => runSpeechRecognition()} size={20} className="cursor-pointer" />

                  <button type="submit">
                    <IoSend color="#47AC47" size={20} className="cursor-pointer" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>}

      </div>}

      <div onClick={() => setShowBot(!showBot)} className="w-16 h-16 bg-green-300 flex justify-center items-center rounded-full cursor-pointer " >
        <TbMessageCircle2Filled size={24} />

      </div>

    </section>
  )
}

export default Voicebot;

