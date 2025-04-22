'use client';

import React from 'react';
import styles from './ChatInputForm.module.css';
import { ArrowUp } from 'lucide-react';

interface ChatInputFormProps {
    inputText: string;
    isLoading: boolean;
    onInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onSubmit: (event: React.FormEvent) => void; // Renamed for generic form submission
    placeholderText?: string;
}

const ChatInputForm: React.FC<ChatInputFormProps> = ({
    inputText,
    isLoading,
    onInputChange,
    onSubmit,
    placeholderText = "Ask anything..." // Default placeholder
}) => {
    return (
        <form onSubmit={onSubmit} className={styles.chatBox}>
            <textarea
                id="chat-input" 
                name="chatMessage"
                className={styles.chatInputBox}
                placeholder={placeholderText}
                value={inputText}
                onChange={onInputChange}
                disabled={isLoading}
                rows={3} 
            >
            </textarea>
            <button
                type="submit"
                className={styles.sendButton}
                disabled={inputText.trim() === '' || isLoading}
            >
                {isLoading ? 'Sending...' : <ArrowUp size={20} />}
            </button>
        </form>
    );
};

export default ChatInputForm;