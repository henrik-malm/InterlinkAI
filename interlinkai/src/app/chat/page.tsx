'use client'
import styles from './page.module.css';
import React, {useState, useRef, useEffect} from 'react';

interface ChatMsg {
    id: number;
    sender: 'user' | 'ai'; 
    text: string;
}

export default function Chatpage(){
    const [inputText, setInputText] = useState('');
    const [chatMsg, setChatMsg] = useState<ChatMsg[]>([]);
    const EndRef = useRef<HTMLDivElement>(null);


    // Handler - textarea input change
    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputText(event.target.value);
    }


    // Handler - form submission
    const handleSendMsg = (event: React.FormEvent) => {
        event.preventDefault();
        const trimmedMsg = inputText.trim()

        if (trimmedMsg === '') {
            return
        }


   // Creating a new message object for the user's message
        const newMsg: ChatMsg = {
            id: Date.now(),
            sender: 'user',
            text: trimmedMsg
        }


    // Core Logic
        setChatMsg(prevMsg => [...prevMsg, newMsg]);
        setInputText('');
    // console.log('user message:', newMessage);

    }


     // Scroll into view.    
        useEffect(() => {
            EndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, [chatMsg]);


    return (
        <div className={styles.outsideWrapper}>
            <div className={styles.insideWrapper}>
                <div className={styles.msgCanvas}>
                    {chatMsg.length === 0 ? (
                    <p className={styles.emptyChatMsg}>Type to start a new chat...</p>
                    ) : (
                    chatMsg.map((msg) => (
                        <div key={msg.id} className={`${styles.msgItem} ${msg.sender === 'user' ? styles.userMsg : styles.aiMsg}`}>
                        <p>{msg.text}</p>
                        </div>
                        ))
                    )}
                    <div ref={EndRef}></div> 
                </div>     
                <form onSubmit={handleSendMsg} className={styles.chatBox}>          
                    <textarea
                        id="chat-input"
                        name="chatMessage"
                        className={styles.chatInputBox}
                        placeholder="Ask anything..."
                        value={inputText}
                        onChange={handleInputChange}
                    >
                    </textarea>
                    <button
                        type="submit"
                        className={styles.sendButton}
                        disabled={inputText.trim() === ''}
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
  }