"use client";
import React from 'react';
import DashboardOptions from './components/DashboardOptions';
import ChatHistory from './components/chathistory/ChatHistory';
import styles from './layout.module.css';

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={styles.workspaceContainer}>
            <div className={styles.sidebar}>
                <DashboardOptions />
                <hr className={styles.separator} />
                <ChatHistory />
            </div>
            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
} 