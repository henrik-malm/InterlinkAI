'use client'

import styles from './page.module.css';
import React, {useState, useRef, useEffect} from 'react';


/* Setup a file later with types/interface in the src*/
interface ChatMessage {
    id: number;
    sender: 'user' | 'ai';
    text: string;
}




export default function Homepage(){
    const [message, setMessage] = useState('');
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
   


    // Handler - textarea input change
    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(event.target.value);
    }

    // Handler - form submission
    const handleSendMessage = (event: React.FormEvent) => {
        event.preventDefault();
        const trimmedMessage = message.trim()

        if (trimmedMessage === '') {
            return
        }

   // Creating a new message object for the user's message
        const newMessage: ChatMessage = {
            id: Date.now(),
            sender: 'user',
            text: trimmedMessage
        }

    // Core Logic
        setChatMessages(prevMessages => [...prevMessages, newMessage]);
        setMessage('');
    // console.log('user message:', newMessage);

    }



     // Scroll into view.    
        useEffect(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, [chatMessages]);


    return (

        <main className={styles.mainChatContainer}>

            <div className={styles.chatCanvas}>
                {chatMessages.length === 0 ? (
                    <p className={styles.emptyChatMessage}>Type to start a new chat...</p>
                ) : (
                    chatMessages.map((msg) => (
                        <div key={msg.id} className={`${styles.messageItem} ${styles.userMessage}`}>
                        <p>{msg.text}</p>
                        </div>
                        ))
                    )
                }
                 <div ref={messagesEndRef} />
            </div>   

            <form onSubmit={handleSendMessage} className={styles.chatBox}>          
                <textarea
                    id="chat-input"
                    name="chatMessage"
                    className={styles.chatInputBox}
                    placeholder="Ask anything..."
                    value={message}
                    onChange={handleInputChange}
                >
                </textarea>
                <button
                    type="submit"
                    className={styles.sendButton}
                    disabled={message.trim() === ''}
                >
                    Send
                </button>
            </form>
           
        </main>
      
    );
  }