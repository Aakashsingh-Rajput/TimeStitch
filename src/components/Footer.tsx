import React, { useState, useEffect } from 'react'
import { Memory } from '../types/Memory'

interface FooterProps {
  memories: Memory[]
}

const Footer: React.FC<FooterProps> = ({ memories }) => {
  const [footerContent, setFooterContent] = useState<React.ReactNode>(null)

  const quotes = [
    { text: "Every moment is a fresh beginning.", author: "T.S. Eliot", emoji: "🌅" },
    { text: "Life is not measured by the breaths we take, but by the moments that take our breath away.", author: "Maya Angelou", emoji: "💫" },
    { text: "The best things in life are the people we love, the places we've been, and the memories we've made along the way.", author: "Unknown", emoji: "🧩" },
    { text: "Memories are the key not to the past, but to the future.", author: "Corrie Ten Boom", emoji: "🗝️" },
    { text: "Photography is a way of feeling, of touching, of loving... it remembers little things, long after you have forgotten everything.", author: "Aaron Siskind", emoji: "📷" },
    { text: "The only way to make sense out of change is to plunge into it, move with it, and join the dance.", author: "Alan Watts", emoji: "💃" },
    { text: "Time is the most valuable coin in your life.", author: "Carl Sandburg", emoji: "⏳" },
    { text: "Life is a collection of moments. Make each one count.", author: "Unknown", emoji: "✨" }
  ]

  useEffect(() => {
    // 50% chance to show a memory highlight if memories exist
    if (memories.length > 0 && Math.random() < 0.5) {
      const memory = memories[Math.floor(Math.random() * memories.length)]
      setFooterContent(
        <div style={{ textAlign: 'center', animation: 'fadeIn 1s' }}>
          <span style={{ fontSize: '2rem', marginRight: '0.5rem' }}>📸</span>
          <span style={{ fontWeight: 600, fontSize: '1.15rem' }}>Memory Highlight:</span>
          <br />
          <span style={{ fontSize: '1.1rem', color: '#6b7280' }}>
            "{memory.title}" {memory.date ? <span style={{ fontSize: '1rem', color: '#ec4899', marginLeft: 8 }}>{new Date(memory.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span> : null}
          </span>
          <br />
          <span style={{ fontSize: '0.95rem', color: '#64748b' }}>{memory.description?.slice(0, 80)}{memory.description && memory.description.length > 80 ? '...' : ''}</span>
        </div>
      )
    } else {
      const q = quotes[Math.floor(Math.random() * quotes.length)]
      setFooterContent(
        <div style={{ textAlign: 'center', animation: 'fadeIn 1s' }}>
          <span style={{ fontSize: '2rem', marginRight: '0.5rem' }}>{q.emoji}</span>
          <span style={{ fontWeight: 600, fontSize: '1.15rem' }}>
            {q.text}
          </span>
          <br />
          <span style={{ fontSize: '1rem', color: '#6b7280' }}>- {q.author}</span>
        </div>
      )
    }
  }, [memories])

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="quote">
            {footerContent}
          </div>
          <div className="footer-divider">
            <p className="footer-copyright">
              © 2024 TimeStitch. Made with <span role="img" aria-label="love">❤️</span> for preserving precious moments.
            </p>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </footer>
  )
}

export default Footer 