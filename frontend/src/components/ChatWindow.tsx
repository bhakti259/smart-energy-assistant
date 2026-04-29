import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Message } from '../types'

interface Props {
  messages: Message[]
  loading: boolean
}

export default function ChatWindow({ messages, loading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  return (
    <div style={styles.container}>

      {messages.length === 0 && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>⚡</div>
          <p style={styles.emptyTitle}>Your energy advisor is ready</p>
          <p style={styles.emptySubtitle}>
            Ask anything about your energy usage, bills,
            or get smart recommendations
          </p>
        </div>
      )}

      {messages.map((msg, i) => (
        <div
          key={i}
          style={{
            ...styles.messageRow,
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
          }}
        >
          {msg.role === 'assistant' && (
            <div style={styles.avatar}>⚡</div>
          )}
          <div style={{
            ...styles.bubble,
            ...(msg.role === 'user'
              ? styles.userBubble
              : styles.assistantBubble)
          }}>
            {msg.role === 'assistant'
              ? <ReactMarkdown>{msg.content}</ReactMarkdown>
              : msg.content}
          </div>
        </div>
      ))}

      {loading && (
        <div style={styles.messageRow}>
          <div style={styles.avatar}>⚡</div>
          <div style={{ ...styles.bubble, ...styles.assistantBubble }}>
            <div style={styles.typing}>
              <span style={styles.dot} />
              <span style={{ ...styles.dot, animationDelay: '0.2s' }} />
              <span style={{ ...styles.dot, animationDelay: '0.4s' }} />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    textAlign: 'center'
  },
  emptyIcon: {
    fontSize: '40px',
    marginBottom: '12px'
  },
  emptyTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '6px'
  },
  emptySubtitle: {
    fontSize: '13px',
    color: '#718096',
    maxWidth: '280px'
  },
  messageRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px'
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#ebf8ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    flexShrink: 0
  },
  bubble: {
    maxWidth: '75%',
    padding: '10px 14px',
    borderRadius: '12px',
    fontSize: '14px',
    lineHeight: '1.6'
  },
  userBubble: {
    background: '#3182ce',
    color: 'white',
    borderBottomRightRadius: '4px'
  },
  assistantBubble: {
    background: 'white',
    color: '#2d3748',
    border: '1px solid #e2e8f0',
    borderBottomLeftRadius: '4px'
  },
  typing: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
    height: '20px'
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#a0aec0',
    animation: 'bounce 1s infinite',
    display: 'inline-block'
  }
}