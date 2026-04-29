import type { QuickAction } from '../types'

interface Props {
  onAction: (question: string) => void
}

const actions: QuickAction[] = [
  {
    icon: '🚗',
    label: 'When to charge my EV?',
    question: 'When should I charge my EV tonight? Battery is at 20%.'
  },
  {
    icon: '🧺',
    label: 'Best time for laundry?',
    question: 'When is the best time to run my washing machine today?'
  },
  {
    icon: '☀️',
    label: 'Solar forecast today?',
    question: 'How much solar energy will I generate today and when should I use high-consumption appliances?'
  },
  {
    icon: '💰',
    label: 'How to reduce my bill?',
    question: 'I am over budget this month. What are the top 3 things I can do to reduce my energy bill?'
  }
]

export default function QuickActions({ onAction }: Props) {
  return (
    <div style={styles.container}>
      <p style={styles.label}>Quick questions:</p>
      <div style={styles.grid}>
        {actions.map((action, i) => (
          <button
            key={i}
            style={styles.button}
            onClick={() => onAction(action.question)}
            onMouseEnter={e =>
              (e.currentTarget.style.background = '#ebf8ff')
            }
            onMouseLeave={e =>
              (e.currentTarget.style.background = 'white')
            }
          >
            <span style={styles.icon}>{action.icon}</span>
            <span style={styles.buttonLabel}>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginBottom: '12px'
  },
  label: {
    fontSize: '12px',
    color: '#718096',
    marginBottom: '8px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px'
  },
  button: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '10px 12px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.15s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  icon: {
    fontSize: '18px'
  },
  buttonLabel: {
    fontSize: '12px',
    color: '#4a5568',
    fontWeight: '500'
  }
}