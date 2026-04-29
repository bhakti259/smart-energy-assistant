import type { DashboardData } from '../types'

interface Props {
  data: DashboardData | null
}

export default function Dashboard({ data }: Props) {
  if (!data) return null

  const { household, monthly_summary, tariffs } = data
  const overBudget = monthly_summary.over_budget_eur > 0

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>⚡ Smart Energy Assistant</h2>
          <p style={styles.subtitle}>{household.address}</p>
        </div>
        <div style={styles.badges}>
          {household.has_solar_panels && (
            <span style={styles.badge}>☀️ Solar</span>
          )}
          {household.has_ev && (
            <span style={styles.badge}>🚗 {household.ev_model}</span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>

        <div style={styles.stat}>
          <div style={styles.statLabel}>This Month</div>
          <div style={styles.statValue}>€{monthly_summary.total_cost_eur}</div>
          <div style={{
            ...styles.statSub,
            color: overBudget ? '#e53e3e' : '#38a169'
          }}>
            {overBudget
              ? `€${monthly_summary.over_budget_eur} over budget`
              : 'Within budget ✓'}
          </div>
        </div>

        <div style={styles.stat}>
          <div style={styles.statLabel}>Total Usage</div>
          <div style={styles.statValue}>
            {monthly_summary.total_kwh_consumed} kWh
          </div>
          <div style={styles.statSub}>
            Avg {monthly_summary.avg_daily_kwh} kWh/day
          </div>
        </div>

        <div style={styles.stat}>
          <div style={styles.statLabel}>Solar Generated</div>
          <div style={styles.statValue}>
            {monthly_summary.total_solar_generated_kwh} kWh
          </div>
          <div style={styles.statSub}>
            Feed-in: €{tariffs.solar_feed_in_rate_eur_per_kwh}/kWh
          </div>
        </div>

        <div style={styles.stat}>
          <div style={styles.statLabel}>Peak Hour</div>
          <div style={styles.statValue}>{monthly_summary.peak_usage_hour}</div>
          <div style={styles.statSub}>Highest daily usage</div>
        </div>

      </div>

      {/* Insights strip */}
      <div style={styles.insightsRow}>
        {monthly_summary.insights.map((insight, i) => (
          <div key={i} style={styles.insight}>
            💡 {insight}
          </div>
        ))}
      </div>

    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px 24px',
    marginBottom: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px'
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a202c'
  },
  subtitle: {
    fontSize: '13px',
    color: '#718096',
    marginTop: '2px'
  },
  badges: {
    display: 'flex',
    gap: '8px'
  },
  badge: {
    background: '#ebf8ff',
    color: '#2b6cb0',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500'
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
    marginBottom: '12px'
  },
  stat: {
    background: '#f7fafc',
    borderRadius: '8px',
    padding: '12px'
  },
  statLabel: {
    fontSize: '11px',
    color: '#718096',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '4px'
  },
  statValue: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1a202c'
  },
  statSub: {
    fontSize: '11px',
    color: '#718096',
    marginTop: '2px'
  },
  insightsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
    marginTop: '4px'
  },
  insight: {
    fontSize: '12px',
    color: '#4a5568',
    background: '#fffbeb',
    border: '1px solid #fef3c7',
    borderRadius: '6px',
    padding: '6px 10px'
  }
}