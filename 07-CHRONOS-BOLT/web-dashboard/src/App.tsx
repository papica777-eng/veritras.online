/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔮 CHRONOS-BOLT - React Dashboard
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import axios from 'axios'
import { TrendingUp, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react'

const stripePromise = loadStripe('pk_test_...')
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'

// ═══════════════════════════════════════════════════════════════
// Main Dashboard
// ═══════════════════════════════════════════════════════════════

function Dashboard() {
  const [predictions, setPredictions] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const [analyticsRes] = await Promise.all([
        axios.get(`${API_URL}/analytics`)
      ])
      setAnalytics(analyticsRes.data)
      
      // Mock predictions data
      setPredictions([
        {
          time: '00:00',
          failure_prob: 0.12,
          confidence: 0.95
        },
        {
          time: '04:00',
          failure_prob: 0.18,
          confidence: 0.93
        },
        {
          time: '08:00',
          failure_prob: 0.35,
          confidence: 0.91
        },
        {
          time: '12:00',
          failure_prob: 0.58,
          confidence: 0.88
        },
        {
          time: '16:00',
          failure_prob: 0.72,
          confidence: 0.89
        },
        {
          time: '20:00',
          failure_prob: 0.85,
          confidence: 0.92
        },
        {
          time: '24:00',
          failure_prob: 0.91,
          confidence: 0.94
        }
      ])
      
      setLoading(false)
    } catch (error) {
      console.error('Failed to load dashboard:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-purple-400 text-xl">🔮 Loading Chronos...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          🔮 CHRONOS-BOLT
        </h1>
        <p className="text-gray-400 mt-2">7-Day Test Failure Prediction</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Accuracy"
          value={`${(analytics?.accuracy * 100).toFixed(1)}%`}
          color="green"
        />
        <StatCard
          icon={<Zap className="w-6 h-6" />}
          label="Predictions Today"
          value={analytics?.predictions_today?.toLocaleString()}
          color="blue"
        />
        <StatCard
          icon={<AlertTriangle className="w-6 h-6" />}
          label="Critical Alerts"
          value={analytics?.critical_alerts}
          color="red"
        />
        <StatCard
          icon={<Clock className="w-6 h-6" />}
          label="Avg Latency"
          value={`${analytics?.avg_latency_ms}ms`}
          color="purple"
        />
      </div>

      {/* Prediction Chart */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">📊 7-Day Failure Probability Forecast</h2>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={predictions}>
            <defs>
              <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="failure_prob"
              stroke="#8b5cf6"
              fillOpacity={1}
              fill="url(#colorProb)"
              name="Failure Probability"
            />
            <Line
              type="monotone"
              dataKey="confidence"
              stroke="#10b981"
              strokeWidth={2}
              name="Confidence"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recommendations */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">💡 Recommendations</h2>
        <div className="space-y-3">
          <RecommendationItem
            type="critical"
            message="High failure probability detected in next 24h - review recent commits"
          />
          <RecommendationItem
            type="warning"
            message="Test coverage dropped below 80% - consider adding more tests"
          />
          <RecommendationItem
            type="success"
            message="Model confidence above 90% - predictions are highly reliable"
          />
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Components
// ═══════════════════════════════════════════════════════════════

function StatCard({ icon, label, value, color }: any) {
  const colors: any = {
    green: 'from-green-500 to-emerald-500',
    blue: 'from-blue-500 to-cyan-500',
    red: 'from-red-500 to-pink-500',
    purple: 'from-purple-500 to-pink-500'
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${colors[color]} mb-3`}>
        {icon}
      </div>
      <div className="text-gray-400 text-sm mb-1">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
}

function RecommendationItem({ type, message }: any) {
  const config: any = {
    critical: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
    warning: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    success: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' }
  }

  const Icon = config[type].icon

  return (
    <div className={`flex items-start space-x-3 p-4 rounded-lg ${config[type].bg}`}>
      <Icon className={`w-5 h-5 mt-0.5 ${config[type].color}`} />
      <span className="text-gray-300">{message}</span>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// App Wrapper
// ═══════════════════════════════════════════════════════════════

function App() {
  return (
    <Elements stripe={stripePromise}>
      <Dashboard />
    </Elements>
  )
}

export default App
