'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import MessageCanvas from '../components/MessageCanvas/MessageCanvas';
import ChatInputForm from '../components/ChatInputForm/ChatInputForm';
import { ChatMsg } from '@/types';
import styles from './page.module.css';

export default function Chat() {
    const params = useParams();
    const chatId = params.id as string;

    const [inputText, setInputText] = useState('');
    const [chatMsg, setChatMsg] = useState<ChatMsg[]>([]);
    const EndRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingHistory, setIsFetchingHistory] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- Handling message submitted via the chatage and also the first message via the dashboard 
    const sendAndProcessMessage = async (messageText: string) => {
        setIsLoading(true);
        setError(null);
        
        // Optimistic update of the user msg
        const newUserMsg: ChatMsg = {
            id: Date.now(), // Temporary ID
            sender: 'user',
            text: messageText
        };
        setChatMsg(prevMsg => [...prevMsg, newUserMsg]);
        

        // API call to server
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: messageText, chatId: chatId }),
            });

            if (!response.ok) {
                let errorData;
                try { errorData = await response.json(); } catch { }
                setChatMsg(prev => prev.filter(msg => msg.id !== newUserMsg.id));
                throw new Error(errorData?.error || `API request failed with status ${response.status}`);
            }

            const newAiMessageObject = await response.json();

            if (newAiMessageObject && newAiMessageObject.id) {
                setChatMsg(prev => [...prev, newAiMessageObject]);
            } else {
                setChatMsg(prev => prev.filter(msg => msg.id !== newUserMsg.id));
                throw new Error("API response was OK, but didn't contain a valid AI message object.");
            }
        } catch (err) {
            console.error("Error sending message or receiving AI reply:", err);
            const errorMessageText = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(errorMessageText);
            const errorMsg: ChatMsg = {
                id: Date.now() + 1,
                sender: 'ai',
                text: `Oops! Error sending message: ${errorMessageText}`,
                isError: true
            };
            setChatMsg(prevMsg => [...prevMsg, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };


    // --- Fetching messages when continuing a chat & handling start of new chat when first messsage via dashboard ---
    useEffect(() => {
        if (!chatId) return; // guard clause to check chatId is present

        // logic for fetching messages continuing from a previous chatsession. 
        const fetchMessages = async () => {
//            console.log(`fething for chatID ${chatId}`); 
            setIsFetchingHistory(true);
            setError(null);
            try {
                const response = await fetch(`/api/workspace/${chatId}/messages`); // fetch call to the server - will retrieve previous chatsession message history via the db
                if (!response.ok) {
                    // writing custom error handling here for more robust error handling
                    let errorData;
                    try { errorData = await response.json(); } // parsing the json inside the try block
                
                    catch {} // leaving the catch empty will ignore json parse error, other still throw an error. 
                    throw new Error(errorData?.error || `Failed to fetch messages (status ${response.status})`); // we rethrow here all errors, fallback if null or undefined 
                }              
               
                const messages = await response.json();
                console.log(`Fetched ${messages.length} messages.`);
                setChatMsg(messages);
            } catch (err) { // handles both built in errors and our custom error handling
                console.error("Error fetching chat messages:", err);
                const message = err instanceof Error ? err.message : "An unknown error occurred fetching messages.";
                setError(message);
                setChatMsg([]);
            } finally {
                setIsFetchingHistory(false);
            }
        };
        fetchMessages();
    }, [chatId]);


    // --- Input Change Handler ---
    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputText(event.target.value);
    };

    // --- Form Submit Handler --- 
    const handleSendMsg = async (event: React.FormEvent) => {
        event.preventDefault(); // prevent default behavior of form submission
        const trimmedMsg = inputText.trim(); // Get input msg from state inputText that is updated on every input change user makes
        if (trimmedMsg === '' || !chatId || isLoading || isFetchingHistory) { // conditional check (guard clause) before procedding with sending msg
            return;
        }
        setInputText(''); // updating state triggering re-reander and clearing the input box 
        sendAndProcessMessage(trimmedMsg); // Call the extracted logic
    };


    // UI focus on the last message
    useEffect(() => {
            if (!isFetchingHistory) { // makes sure the scroll happens after the history is fetched
                EndRef.current?.scrollIntoView({ behavior: "smooth" });
            }
        }, [chatMsg, isFetchingHistory]);




// -- JSX 
    return (
        <div className={styles.chatContainer}>
            <div className={styles.chatWrapper}>
                {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            </div>
            <div className={styles.chatAreaWrapper}>
                 <MessageCanvas
                    messages={chatMsg}
                    isLoading={isLoading || isFetchingHistory}
                    endRef={EndRef}
                 />
                 <ChatInputForm
                    inputText={inputText}
                    isLoading={isLoading || isFetchingHistory}
                    onInputChange={handleInputChange}
                    onSubmit={handleSendMsg}
                    placeholderText={isFetchingHistory ? "Loading chat history..." : "Type a message..."}
                 />
            </div>
        </div>
    );
} 