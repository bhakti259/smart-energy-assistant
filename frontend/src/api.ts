import axios from 'axios'
import type { DashboardData, ChatResponse } from './types'

const BASE_URL = 'http://localhost:8000'

// Unique session ID for this browser session
// Provides conversation isolation — each tab gets its own context
export const SESSION_ID: string =
  'session-' + Math.random().toString(36).substr(2, 9)

export const sendMessage = async (question: string): Promise<string> => {
  const response = await axios.post<ChatResponse>(`${BASE_URL}/chat`, {
    question,
    session_id: SESSION_ID
  })
  return response.data.answer
}

export const getEVRecommendation = async (
  batteryPercent: number
): Promise<string> => {
  const response = await axios.post<{ recommendation: string }>(
    `${BASE_URL}/recommend/ev`,
    { battery_percent: batteryPercent }
  )
  return response.data.recommendation
}

export const getApplianceRecommendation = async (
  appliance: string,
  preferredTime?: string
): Promise<string> => {
  const response = await axios.post<{ recommendation: string }>(
    `${BASE_URL}/recommend/appliance`,
    { appliance, preferred_time: preferredTime }
  )
  return response.data.recommendation
}

export const getDashboard = async (): Promise<DashboardData> => {
  const response = await axios.get<DashboardData>(`${BASE_URL}/dashboard`)
  return response.data
}