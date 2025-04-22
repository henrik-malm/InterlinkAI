'use client';

import React from 'react';
import styles from './MessageCanvas.module.css';
import { ChatMsg } from '@/types';

interface MessageCanvasProps {
  messages: ChatMsg[];
  isLoading: boolean;
  endRef: React.RefObject<HTMLDivElement | null>;
  emptyListPlaceholder?: string;
}

const MessageCanvas: React.FC<MessageCanvasProps> = ({
  messages,
  isLoading,
  endRef,
  emptyListPlaceholder = "No messages yet."
}) => (
  <div className={styles.msgCanvas}>
    {messages.length === 0 && !isLoading && (
      <p className={styles.emptyChatMsg}>{emptyListPlaceholder}</p>
    )}
    {messages.map(msg => (
      <div
        key={msg.id}
        className={`${styles.msgItem} ${
          msg.sender === 'user' ? styles.userMsg : styles.aiMsg
        } ${msg.isError ? styles.errorMsg : ''}`}
      >
        <p>{msg.text}</p>
      </div>
    ))}
    {isLoading && (
      <div className={`${styles.msgItem} ${styles.aiMsg}`}>
        <p><i>Thinking...</i></p>
      </div>
    )}
    <div ref={endRef}></div>
  </div>
);

export default MessageCanvas; 