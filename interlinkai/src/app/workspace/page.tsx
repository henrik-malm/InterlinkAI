'use client'; // Needs to be a client component to use hooks

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { MessageSquare, Image, Settings, ArrowUp } from 'lucide-react';
import chatFormStyles from './components/ChatInputForm/ChatInputForm.module.css';

export default function WorkspacePage() {
    const router = useRouter();
    const [text, setText] = useState('');

    // Function to create a new chat session with an initial message
    const createChatSession = async (firstMessage: string) => {
        try {
            const response = await fetch('/api/workspace/create-empty', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstMessage }),
            });
            if (!response.ok) throw new Error(`Failed (status ${response.status})`);
            const data: { chatId: string } = await response.json();
            router.push(`/workspace/${data.chatId}`);
        } catch (error) {
            console.error('Error creating chat session:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = text.trim();
        if (!trimmed) return;
        await createChatSession(trimmed);
    };

    return (
        <div className={styles.dashboardPage}>
            {/* Option cards */}
            <div className={styles.options}>
                <div className={styles.option} onClick={() => createChatSession('')}>
                    <MessageSquare size={48} />
                    <span>Create a New Chat</span>
                </div>
                <div className={styles.option}>
                    <Image size={48} />
                    <span>Analyze Images</span>
                </div>
                <div className={styles.option}>
                    <Settings size={48} />
                    <span>Settings</span>
                </div>
            </div>
            {/* Input form below options */}
            <div className={styles.formContainer}>
                <form onSubmit={handleSubmit} className={chatFormStyles.chatBox}>
                    <input
                        type="text"
                        name="text"
                        placeholder="Ask me anything..."
                        className={chatFormStyles.chatInputBox}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <button
                        type="submit"
                        className={chatFormStyles.sendButton}
                        disabled={text.trim() === ''}
                    >
                        <ArrowUp size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}