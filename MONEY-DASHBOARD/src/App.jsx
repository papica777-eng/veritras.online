import React, { useState, useEffect } from 'react'
import { Zap, Brain, Sparkles, CreditCard, TrendingUp, Users, DollarSign, Send, Check } from 'lucide-react'

const API = '/api'

export default function App() {
  const [page, setPage] = useState('home')
  const [stats, setStats] = useState(null)
  const [chatInput, setChatInput] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`${API}/stats`).then(r => r.json()).then(setStats)
  }, [])

  const handleChat = async () => {
    if (!chatInput.trim()) return
    setLoading(true)
    setChatHistory(prev => [...prev, { role: 'user', text: chatInput }])
    
    try {
      const res = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatInput })
      })
      const data = await res.json()
      setChatHistory(prev => [...prev, { role: 'ai', text: data.response }])
    } catch (e) {
      setChatHistory(prev => [...prev, { role: 'ai', text: 'Error: ' + e.message }])
    }
    setChatInput('')
    setLoading(false)
  }

  const handleCheckout = async (plan) => {
    const email = prompt('Enter your email:')
    if (!email) return
    
    const res = await fetch(`${API}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, email })
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
  }

  return (
    <div className="min-h-screen text-white">
      {/* Nav */}
      <nav className="border-b border-purple-500/20 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <span className="text-3xl">💰</span>
            <span className="gradient-text">QAntum AI</span>
          </div>
          <div className="flex gap-6">
            <button onClick={() => setPage('home')} className={`hover:text-purple-400 ${page === 'home' ? 'text-purple-400' : ''}`}>Home</button>
            <button onClick={() => setPage('chat')} className={`hover:text-purple-400 ${page === 'chat' ? 'text-purple-400' : ''}`}>AI Chat</button>
            <button onClick={() => setPage('pricing')} className={`hover:text-purple-400 ${page === 'pricing' ? 'text-purple-400' : ''}`}>Pricing</button>
            <button onClick={() => setPage('admin')} className={`hover:text-purple-400 ${page === 'admin' ? 'text-purple-400' : ''}`}>Admin</button>
          </div>
        </div>
      </nav>

      {/* Home */}
      {page === 'home' && (
        <div className="max-w-7xl mx-auto p-8">
          <div className="text-center py-20">
            <h1 className="text-6xl font-bold mb-6">
              <span className="gradient-text">Next-Gen AI</span>
              <br />
              <span className="text-white">That Generates Revenue</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Harness the power of Gemini 2.0 Flash + Pinecone Vector DB. 
              Build AI applications that your customers will pay for.
            </p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => setPage('pricing')}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold text-lg hover:opacity-90 pulse-glow"
              >
                Get Started - $29/mo
              </button>
              <button 
                onClick={() => setPage('chat')}
                className="px-8 py-4 border border-purple-500 rounded-lg font-semibold text-lg hover:bg-purple-500/20"
              >
                Try AI Free
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 py-12">
            <FeatureCard 
              icon={<Brain className="w-8 h-8" />}
              title="Gemini 2.0 Flash"
              desc="Fastest AI model with 1M token context window"
            />
            <FeatureCard 
              icon={<Zap className="w-8 h-8" />}
              title="Lightning Fast"
              desc="Sub-second responses for real-time applications"
            />
            <FeatureCard 
              icon={<Sparkles className="w-8 h-8" />}
              title="Pinecone RAG"
              desc="Vector search for intelligent document retrieval"
            />
          </div>
        </div>
      )}

      {/* Chat */}
      {page === 'chat' && (
        <div className="max-w-4xl mx-auto p-8">
          <h2 className="text-3xl font-bold mb-6 gradient-text">🧠 AI Chat</h2>
          
          <div className="bg-gray-900/50 rounded-xl p-6 glow-box min-h-[400px] max-h-[500px] overflow-y-auto mb-4">
            {chatHistory.length === 0 && (
              <p className="text-gray-500 text-center py-20">Start a conversation with QAntum AI...</p>
            )}
            {chatHistory.map((msg, i) => (
              <div key={i} className={`mb-4 ${msg.role === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block max-w-[80%] p-4 rounded-xl ${
                  msg.role === 'user' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-800 text-gray-200'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && <div className="text-purple-400">🤔 Thinking...</div>}
          </div>

          <div className="flex gap-2">
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleChat()}
              placeholder="Ask anything..."
              className="flex-1 bg-gray-800 border border-purple-500/30 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
            />
            <button 
              onClick={handleChat}
              disabled={loading}
              className="px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Pricing */}
      {page === 'pricing' && (
        <div className="max-w-6xl mx-auto p-8">
          <h2 className="text-4xl font-bold text-center mb-4 gradient-text">💰 Pricing Plans</h2>
          <p className="text-center text-gray-400 mb-12">Choose your power level</p>

          <div className="grid md:grid-cols-3 gap-8">
            <PricingCard
              name="Starter"
              price={29}
              tokens="10,000"
              features={['Gemini 2.0 Flash', 'Basic Support', 'API Access']}
              onBuy={() => handleCheckout('starter')}
            />
            <PricingCard
              name="Pro"
              price={99}
              tokens="50,000"
              features={['Everything in Starter', 'Pinecone RAG', 'Priority Support', 'Custom Models']}
              popular
              onBuy={() => handleCheckout('pro')}
            />
            <PricingCard
              name="Enterprise"
              price={299}
              tokens="200,000"
              features={['Everything in Pro', 'Dedicated Instance', '24/7 Support', 'SLA Guarantee', 'White Label']}
              onBuy={() => handleCheckout('enterprise')}
            />
          </div>
        </div>
      )}

      {/* Admin */}
      {page === 'admin' && stats && (
        <div className="max-w-7xl mx-auto p-8">
          <h2 className="text-3xl font-bold mb-8 gradient-text">📊 Revenue Dashboard</h2>
          
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <StatCard icon={<DollarSign />} label="Total Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} color="green" />
            <StatCard icon={<TrendingUp />} label="Today" value={`$${stats.todayRevenue}`} color="blue" />
            <StatCard icon={<Users />} label="Active Subs" value={stats.activeSubscriptions} color="purple" />
            <StatCard icon={<Zap />} label="Growth" value={`+${stats.growthPercent}%`} color="pink" />
          </div>

          <div className="bg-gray-900/50 rounded-xl p-6 glow-box">
            <h3 className="text-xl font-semibold mb-4">Recent Transactions</h3>
            <div className="space-y-3">
              {[
                { email: 'john@startup.io', plan: 'Pro', amount: 99 },
                { email: 'sarah@agency.com', plan: 'Enterprise', amount: 299 },
                { email: 'mike@dev.co', plan: 'Starter', amount: 29 },
              ].map((tx, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-gray-800/50 rounded-lg">
                  <div>
                    <div className="font-medium">{tx.email}</div>
                    <div className="text-sm text-gray-400">{tx.plan} Plan</div>
                  </div>
                  <div className="text-green-400 font-bold">+${tx.amount}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-gray-900/50 rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/50 transition glow-box">
      <div className="text-purple-400 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{desc}</p>
    </div>
  )
}

function PricingCard({ name, price, tokens, features, popular, onBuy }) {
  return (
    <div className={`bg-gray-900/50 rounded-xl p-8 border ${popular ? 'border-purple-500 glow-box' : 'border-gray-700'} relative`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 px-4 py-1 rounded-full text-sm font-semibold">
          MOST POPULAR
        </div>
      )}
      <h3 className="text-2xl font-bold mb-2">{name}</h3>
      <div className="text-4xl font-bold mb-1">${price}<span className="text-lg text-gray-400">/mo</span></div>
      <div className="text-purple-400 mb-6">{tokens} tokens/month</div>
      <ul className="space-y-3 mb-8">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-400" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button 
        onClick={onBuy}
        className={`w-full py-3 rounded-lg font-semibold ${
          popular 
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90' 
            : 'bg-gray-700 hover:bg-gray-600'
        }`}
      >
        <CreditCard className="w-5 h-5 inline mr-2" />
        Subscribe Now
      </button>
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    green: 'from-green-500 to-emerald-500',
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
    pink: 'from-pink-500 to-rose-500'
  }
  return (
    <div className="bg-gray-900/50 rounded-xl p-6 glow-box">
      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${colors[color]} mb-3`}>
        {icon}
      </div>
      <div className="text-gray-400 text-sm">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
}
