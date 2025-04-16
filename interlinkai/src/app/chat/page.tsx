'use client'; // Needs to be a client component to use hooks

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; 
import styles from './page.module.css'; // just reusing for now odl

export default function ChatDashboardPage() {
    const router = useRouter(); 
    const [isCreatingChat, setIsCreatingChat] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // make API call to create a new ChatSession,
    // gets the new session ID back, and navigates to the new chat page.
    const handleStartNewChat = async () => {
        setIsCreatingChat(true);
        setError(null);
        console.log("Starting new chat...");

        try {
            const response = await fetch('/api/chat/create', { // Renamed endpoint
                method: 'POST',
            });

            if (!response.ok) {
                let errorData;
                try { errorData = await response.json(); } catch { }
                throw new Error(errorData?.error || `Failed to create chat session (status ${response.status})`);
            }

            const data = await response.json();

            if (data.chatId) {
                console.log(`API returned chatId: ${data.chatId}. Navigating...`);
                router.push(`/chat/${data.chatId}`); // Use data.chatId
            } else {
                throw new Error("API did not return a chat ID.");
            }

        } catch (err) {
            console.error("Error creating new chat:", err);
            const message = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(message);
            setIsCreatingChat(false);
        }
    };


    return (
        <div className={styles.outsideWrapper}> 
            <div className={styles.insideWrapper}>
                <h1>Chat Dashboard</h1>
                <p>Select a chat from the sidebar or start a new one.</p>

                {/* Chatloghistoriken från db läggs här */}

                <button
                    onClick={handleStartNewChat}
                    disabled={isCreatingChat}
                    style={{ marginTop: '2rem', padding: '10px 20px' }}
                >
                    {isCreatingChat ? 'Starting...' : 'Start New Chat'}
                </button>

                {error && (
                    <p style={{ color: 'red', marginTop: '1rem' }}>
                        Error starting chat: {error}
                    </p>
                )}
            </div>
        </div>
    );
}