'use client'

import Link from "next/link";
import Image from "next/image";
import styles from './page.module.css';

export default function Homepage() {
  return (
    <div className={styles.container}>
      <Image
        className={styles.logoImg}
        src="/logo.png"
        alt="AI Interlink Logo"
        width={120}
        height={120}
      />

      <div className={styles.outerwrapper}>
        <div className={styles.innterwrapper}>
          <p className={styles.logotext}>ai-Interlink</p>
          <p className={styles.text2}>get.connected</p>
        </div>
        <Link href="/workspace" className={styles.chatButton}>
              Go to Chat
        </Link>
      </div>

    </div>
  );
}