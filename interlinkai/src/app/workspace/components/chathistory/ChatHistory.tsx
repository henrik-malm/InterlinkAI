'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Pencil, Trash } from 'lucide-react';
import styles from './chatHistory.module.css';


interface Session {
  id: string;
  title: string;
  updatedAt: string;
}

export default function ChatHistory() {
  const [chatHistory, setChatHistory] = useState<Session[]>([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [editingId,   setEditingId]   = useState<string | null>(null);
  const [editTitle,   setEditTitle]   = useState('');
  const [menuOpenId,  setMenuOpenId]  = useState<string | null>(null);
  const [deletingId,  setDeletingId]  = useState<string | null>(null);

 
 // Fetching chat History
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/workspace/sessions');
        if (!res.ok) throw new Error('Failed to fetch chat sessions');
        const data: Session[] = await res.json();
        setChatHistory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

 
 
  // "Helpers"
  const toggleMenu = (id: string) =>
    setMenuOpenId(prev => (prev === id ? null : id));

  const startEdit = (s: Session) => {
    setError(null);
    setEditingId(s.id);
    setEditTitle(s.title);
    setMenuOpenId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  // save for title edit
  async function saveTitle(id: string) {
    const newTitle = editTitle.trim();
    if (!newTitle) return setError('Title cannot be empty.');
    if (newTitle.length > 30) return setError('Title cannot exceed 30 characters.');

    const original = chatHistory.find(s => s.id === id)?.title ?? '';

    // optimistic update
    setChatHistory(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));
    setEditingId(null);

    try {
      const res = await fetch(`/api/workspace/sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });
      if (!res.ok) throw new Error(`Failed (status ${res.status})`);
    } catch (err) {
      setError(`Save failed: ${err instanceof Error ? err.message : 'unknown'}`);
      setChatHistory(prev => prev.map(s => s.id === id ? { ...s, title: original } : s));
    }
  }

  /* delete session */
  async function deleteSession(id: string) {
    setDeletingId(id);
    setMenuOpenId(null);

    try {
      const res = await fetch(`/api/workspace/sessions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Failed (status ${res.status})`);
      setChatHistory(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError(`Delete failed: ${err instanceof Error ? err.message : 'unknown'}`);
    } finally {
      setDeletingId(null);
    }
  }

  /* ---------------------------------------------------------------- */
  /* render                                                            */
  /* ---------------------------------------------------------------- */
  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Chat history</h2>

      {isLoading && <p>Loading…</p>}
      {error      && <p className={styles.error}>{error}</p>}
      {!isLoading && chatHistory.length === 0 && <p>empty...</p>}

      <ul className={styles.sessionList}>
        {chatHistory.map(s => (
          <li key={s.id} className={styles.sessionItem}>

            {/* ---------- EDIT MODE ---------- */}
            {editingId === s.id ? (
              <>
                <input
                  className={styles.titleInput}
                  value={editTitle}
                  onChange={e => { setError(null); setEditTitle(e.target.value); }}
                  onKeyDown={e => e.key === 'Enter' && saveTitle(s.id)}
                  autoFocus
                />
                <button className={styles.action} onClick={() => saveTitle(s.id)}>
                  Save
                </button>
                <button className={styles.action} onClick={cancelEdit}>
                  Cancel
                </button>
              </>
            ) : (
            /* ---------- DISPLAY MODE ---------- */
              <>
                <Link href={`/workspace/${s.id}`} className={styles.link}>
                  {s.title}
                  <time className={styles.time}>
                    {new Date(s.updatedAt).toLocaleDateString()}
                  </time>
                </Link>

                <button
                  className={styles.menuBtn}
                  onClick={() => toggleMenu(s.id)}
                  aria-label="session actions"
                >
                  <MoreHorizontal size={18} />
                </button>

                {menuOpenId === s.id && (
                  <div className={styles.dropdown}>
                    <button 
                      onClick={() => startEdit(s)}>
                      <Pencil size={14} /> Edit title
                    </button>
                    <button
                      onClick={() => deleteSession(s.id)}
                      disabled={deletingId === s.id}
                    >
                      <Trash size={14} />
                      {deletingId === s.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
