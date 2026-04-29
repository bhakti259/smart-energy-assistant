import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import ChatWindow from './components/ChatWindow'
import QuickActions from './components/QuickActions'
import { sendMessage, getDashboard } from './api'
import type { Message, DashboardData } from './types'

export default function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)

  useEffect(() => {
    getDashboard().then(setDashboard).catch(console.error)
  }, [])

  const handleSend = async (question?: string): Promise<void> => {
    const text = question ?? input.trim()
    if (!text || loading) return

    setMessages(prev => [...prev, { role: 'user', content: text }])
    setInput('')
    setLoading(true)

    try {
      const answer = await sendMessage(text)
      setMessages(prev => [...prev, { role: 'assistant', content: answer }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Something went wrong. Is the FastAPI server running?'
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <Dashboard data={dashboard} />

        <div style={styles.chatCard}>

          <div style={styles.quickActionsArea}>
            <QuickActions onAction={handleSend} />
          </div>

          <ChatWindow messages={messages} loading={loading} />

          <div style={styles.inputArea}>
            <input
              style={styles.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your energy usage..."
              disabled={loading}
            />
            <button
              style={{
                ...styles.sendButton,
                opacity: loading || !input.trim() ? 0.5 : 1
              }}
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
            >
              Send
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    padding: '20px',
    background: '#f0f4f8'
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 40px)'
  },
  chatCard: {
    flex: 1,
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  quickActionsArea: {
    padding: '16px 16px 0'
  },
  inputArea: {
    display: 'flex',
    gap: '8px',
    padding: '12px 16px',
    borderTop: '1px solid #e2e8f0'
  },
  input: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit'
  },
  sendButton: {
    padding: '10px 20px',
    background: '#3182ce',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer'
  }
}