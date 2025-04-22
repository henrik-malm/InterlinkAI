'use client'; // Add if planning client-side interactions

import React from 'react';
import styles from '../page.module.css';

const DashboardOptions: React.FC = () => {
    return (
        <div className={styles.optionBox}>
            <h2>Dashboard</h2>
            <ul>
                <li><a href="#">Start a New Chat</a></li>
                <li><a href="#">User Profile</a></li>
                <li><a href="#">Settings</a></li>
            </ul>
        </div>
    );
};

export default DashboardOptions; 