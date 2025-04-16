// -- 2415:62: Temporarily simplify component to test route matching.
//==========================================================================================//
//
//
//
//
//
// -- 2415:62: Simplified component for debugging 404.
//==========================================================================================//
'use client';

// -- 2415:64: Revert simplification, restore full component code with useParams.
//==========================================================================================//

import styles from './page.module.css';
import React, {useState, useRef, useEffect} from 'react';
import { useRouter, useParams } from 'next/navigation'; // Keep correct imports

interface ChatMsg {
    id: number;
    sender: 'user' | 'ai';
    text: string;
    isError?: boolean;
}


export default function ChatIdPage(){ // Keep correct name
    const params = useParams(); // Keep reading params
    const chatId = params.id as string; // Keep reading chatId

    const [inputText, setInputText] = useState('');
    const [chatMsg, setChatMsg] = useState<ChatMsg[]>([]);
    const EndRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null)
    const router = useRouter();

    useEffect(() => { // Keep useEffect to log chatId
        if (chatId) {
            console.log("Current Chat ID:", chatId);
            // --- B415 TODO: Load chat history for this chatId here ---
        }
    }, [chatId]);

    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputText(event.target.value);
    }

    const handleSendMsg = async (event: React.FormEvent) => { // Keep full handleSendMsg
        event.preventDefault();
        const trimmedMsg = inputText.trim();
        if (trimmedMsg === '' || !chatId) {
            console.error("Missing message text or chat ID");
            return;
        }
        setIsLoading(true);
        const newMsg: ChatMsg = {
            id: Date.now(),
            sender: 'user',
            text: trimmedMsg
        }
        setChatMsg(prevMsg => [...prevMsg, newMsg]);
        setInputText('');
        try {
            const response = await fetch('/api/chat', { // Keep fetch logic
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: trimmedMsg,
                    chatId: chatId
                }),
            });
            if (!response.ok) {
                let errorData;
                try { errorData = await response.json(); } catch { }
                throw new Error(errorData?.error || `API request failed with status ${response.status}`);
            }
            const data = await response.json();
            if (data.reply) {
                const aiMsg: ChatMsg = {
                    id: Date.now() + 1,
                    sender: 'ai',
                    text: data.reply
                };
                setChatMsg(prevMsg => [...prevMsg, aiMsg]);
            } else {
                 throw new Error("Received response from server, but it did not contain a 'reply'.");
            }
        } catch (err) {
            console.error("Error sending message or receiving AI reply:", err);
            const errorMessageText = err instanceof Error ? err.message : "An unknown error occurred.";
            const errorMsg: ChatMsg = {
                id: Date.now() + 1,
                sender: 'ai',
                text: `Oops! Something went wrong. Details: ${errorMessageText}`,
                isError: true
            };
            setChatMsg(prevMsg => [...prevMsg, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

     useEffect(() => { // Keep scroll effect
            EndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, [chatMsg]);

    return ( // Keep full JSX return
        <div className={styles.outsideWrapper}>
            {/* <p style={{ position: 'absolute', top: 0, left: 0, color: 'grey', fontSize: '10px' }}>Chat ID: {chatId}</p> */}
            <div className={styles.insideWrapper}>
                 <div className={styles.msgCanvas}>
                    {chatMsg.length === 0 && !isLoading && (
                    <p className={styles.emptyChatMsg}>Type to start a new chat...</p>
                    )}
                    {chatMsg.map((msg) => (
                        <div key={msg.id} className={`${styles.msgItem} ${msg.sender === 'user' ? styles.userMsg : styles.aiMsg} ${msg.isError ? styles.errorMsg : ''}`}>
                        <p>{msg.text}</p>
                        </div>
                        ))
                    }
                    {isLoading && (
                         <div className={`${styles.msgItem} ${styles.aiMsg}`}>
                             <p><i>Thinking...</i></p>
                         </div>
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
                        disabled={isLoading}
                    >
                    </textarea>
                    <button
                        type="submit"
                        className={styles.sendButton}
                        disabled={inputText.trim() === '' || isLoading}
                    >
                        {isLoading ? 'Sending...' : 'Send'}
                    </button>
                </form>
            </div>
        </div>
    );
} 