'use client'
import styles from './page.module.css';
import React, {useState, useRef, useEffect} from 'react';

interface ChatMsg {
    id: number;
    sender: 'user' | 'ai';
    text: string;
    // -- 215:20 Index: Modify error handling to display errors as AI messages.
    // -- 215:20 "Add optional 'isError' flag to distinguish error messages for styling"
    isError?: boolean;
}

export default function Chatpage(){
    const [inputText, setInputText] = useState('');
    const [chatMsg, setChatMsg] = useState<ChatMsg[]>([]);
    const EndRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    // -- 215:20 "Remove the separate error state variable"
    // const [error, setError] = useState<string | null>(null);


    // Handler - textarea input change
    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputText(event.target.value);
    }


    // Handler - form submission
    const handleSendMsg = async (event: React.FormEvent) => {
        event.preventDefault();
        const trimmedMsg = inputText.trim()

        if (trimmedMsg === '') {
            return
        }

        // -- 215:20 "No longer need to clear separate error state here"
        // setError(null);
        setIsLoading(true);

        const newMsg: ChatMsg = {
            id: Date.now(), // Using timestamp as a simple unique ID
            sender: 'user',
            text: trimmedMsg
        }

        setChatMsg(prevMsg => [...prevMsg, newMsg]);
        setInputText('');

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: trimmedMsg }),
            });

            if (!response.ok) {
                let errorData;
                try {
                     errorData = await response.json();
                } catch {
                    // Ignore parsing error if body isn't JSON
                }
                throw new Error(errorData?.error || `API request failed with status ${response.status}`);
            }

            const data = await response.json();

            if (data.reply) {
                const aiMsg: ChatMsg = {
                    id: Date.now() + 1, // Ensure unique ID, slightly offset from user msg
                    sender: 'ai',
                    text: data.reply
                };
                setChatMsg(prevMsg => [...prevMsg, aiMsg]);
            } else {
                 throw new Error("Received response from server, but it did not contain a 'reply'.");
            }

        } catch (err) {
            // -- 215:20 "Handle errors by adding an error message to the chat state"
            console.error("Error sending message or receiving AI reply:", err);

            // -- 215:20 "Determine the error message text"
            const errorMessageText = err instanceof Error ? err.message : "An unknown error occurred.";

            // -- 215:20 "Create the error message object, marking it as an error"
            const errorMsg: ChatMsg = {
                id: Date.now() + 1, // Unique ID
                sender: 'ai', // Display as if from AI
                // -- 215:20 "Your funny/informative error message text here"
                text: `Oops! Something went wrong. Details: ${errorMessageText}`,
                isError: true // Set the flag for styling
            };

            // -- 215:20 "Add the error message to the chat display"
            setChatMsg(prevMsg => [...prevMsg, errorMsg]);

            // -- 215:20 "No longer setting the separate error state"
            // setError(err instanceof Error ? err.message : "An unknown error occurred.");

        } finally {
            setIsLoading(false);
        }
    }


     // Scroll into view.
        useEffect(() => {
            EndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, [chatMsg]);


    return (
        <div className={styles.outsideWrapper}>
            <div className={styles.insideWrapper}>
                <div className={styles.msgCanvas}>
                     {/* -- 215:20 "Simplified initial message check" */}
                    {chatMsg.length === 0 && !isLoading && (
                       <p className={styles.emptyChatMsg}>Type to start a new chat...</p>
                    )}
                    {chatMsg.map((msg) => (
                        // -- 215:20 "Conditionally add an error class based on the isError flag"
                        <div key={msg.id} className={`${styles.msgItem} ${msg.sender === 'user' ? styles.userMsg : styles.aiMsg} ${msg.isError ? styles.errorMsg : ''}`}>
                           <p>{msg.text}</p>
                        </div>
                        ))
                    }
                    {isLoading && (
                         <div className={`${styles.msgItem} ${styles.aiMsg}`}>
                             <p><i>Thinking...</i></p> {/* Basic loading text */}
                         </div>
                    )}
                    {/* -- 215:20 "Remove the separate error display block" */}
                    {/* {error && (
                         <div className={`${styles.msgItem} ${styles.aiMsg}`} style={{ color: 'red', borderColor: 'red' }}>
                             <p><b>Error:</b> {error}</p>
                         </div>
                    )} */}
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