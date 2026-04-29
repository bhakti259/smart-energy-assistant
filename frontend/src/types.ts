// All shared types in one place
// This is what makes TypeScript powerful —
// you know exactly what shape every piece of data is

export interface HouseholdInfo {
  id: string
  address: string
  has_solar_panels: boolean
  has_ev: boolean
  ev_model: string
  ev_battery_capacity_kwh: number
  monthly_budget_eur: number
}

export interface Tariffs {
  peak_hours: string
  off_peak_hours: string
  peak_rate_eur_per_kwh: number
  off_peak_rate_eur_per_kwh: number
  solar_feed_in_rate_eur_per_kwh: number
}

export interface MonthlySummary {
  month: string
  total_kwh_consumed: number
  total_solar_generated_kwh: number
  total_ev_charged_kwh: number
  total_gas_m3: number
  total_cost_eur: number
  budget_eur: number
  over_budget_eur: number
  peak_usage_hour: string
  highest_consumption_day: string
  avg_daily_kwh: number
  insights: string[]
}

export interface DashboardData {
  household: HouseholdInfo
  monthly_summary: MonthlySummary
  tariffs: Tariffs
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatResponse {
  answer: string
  session_id: string
}

export interface QuickAction {
  icon: string
  label: string
  question: string
}