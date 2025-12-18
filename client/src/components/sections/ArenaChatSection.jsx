'use client'

import { useState, useRef, useEffect } from 'react'
import { SendIcon } from 'lucide-react'

const ArenaChatSection = ({ showBackground = true }) => {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState({
    gemini: false,
    groq: false,
    deepseek: false
  })

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setLoading({ gemini: true, groq: true, deepseek: true })

    // Simulate API calls - replace with actual API calls later
    const models = [
      { name: 'gemini', delay: 1500 },
      { name: 'groq', delay: 2000 },
      { name: 'deepseek', delay: 1800 }
    ]

    models.forEach(({ name, delay }) => {
      setTimeout(() => {
        const response = {
          id: Date.now() + Math.random(),
          text: `This is a simulated response from ${name.charAt(0).toUpperCase() + name.slice(1)}. The actual API integration will be added next.`,
          sender: name,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, response])
        setLoading(prev => ({ ...prev, [name]: false }))
      }, delay)
    })
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const getMessagesForModel = (modelName) => {
    return messages.filter(msg => msg.sender === 'user' || msg.sender === modelName)
  }

  const ChatPanel = ({ modelName, displayName, glowColor, icon, colorConfig }) => {
    const modelMessages = getMessagesForModel(modelName)
    const isLoading = loading[modelName]
    const chatEndRef = useRef(null)

    useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [modelMessages, isLoading])

    const getHeaderStyle = () => {
      return {
        borderBottomColor: `${colorConfig.border}33`,
        background: `linear-gradient(to right, ${colorConfig.bg}1A, transparent)`
      }
    }

    const getMessageStyle = (isUser) => {
      if (isUser) {
        return {
          background: 'linear-gradient(to right, rgba(147, 51, 234, 0.8), rgba(126, 34, 206, 0.8))',
          boxShadow: '0 10px 15px -3px rgba(147, 51, 234, 0.3)'
        }
      }
      return {
        background: `linear-gradient(to right, ${colorConfig.bg}33, ${colorConfig.bgLight}1A)`,
        borderColor: `${colorConfig.border}4D`
      }
    }

    const getLoadingStyle = () => {
      return {
        background: `linear-gradient(to right, ${colorConfig.bg}33, ${colorConfig.bgLight}1A)`,
        borderColor: `${colorConfig.border}4D`
      }
    }

    return (
      <div className="flex flex-col h-full">
        {/* Panel Header */}
        <div className="px-4 py-3 border-b" style={getHeaderStyle()}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <div>
              <h3 className="text-lg font-semibold text-white">{displayName}</h3>
              <p className="text-xs text-gray-400">AI Model</p>
            </div>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ scrollbarWidth: 'thin' }}>
          {modelMessages.length === 0 && !isLoading && (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              Waiting for your question...
            </div>
          )}

          {modelMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-chat`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-2 ${
                  msg.sender === 'user' ? 'text-white' : 'text-gray-200 border'
                }`}
                style={getMessageStyle(msg.sender === 'user')}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                <div className="flex items-center justify-between mt-2 gap-2">
                  <span className="text-xs text-gray-400">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {msg.sender !== 'user' && (
                    <div className="flex gap-1">
                      <button className="text-xs hover:text-green-400 transition-colors">👍</button>
                      <button className="text-xs hover:text-red-400 transition-colors">👎</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start animate-fade-in-chat">
              <div className="border rounded-lg px-4 py-3" style={getLoadingStyle()}>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-400">Thinking</span>
                  <div className="flex gap-1">
                    <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} className="h-1" />
        </div>
      </div>
    )
  }

  return (
    <section id="arena-chat" className={`relative py-20 px-4 md:px-8 lg:px-16 ${showBackground ? 'bg-gradient-to-b from-[#0A0018] via-[#1A0B2E] to-[#0A0018]' : ''}`}>
      {/* Background Grid Effect - Optional overlay */}
      {showBackground && (
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(147, 51, 234, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(147, 51, 234, 0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-white bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 mb-4">
            AI Collective Arena Chat
          </h2>
          <p className="text-xl text-gray-300 mb-2">Three Minds. One Question.</p>
          <p className="text-sm text-gray-400">Converse with the Collective</p>
        </div>

        {/* Chat Container */}
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-purple-500/30 shadow-2xl shadow-purple-900/50 overflow-hidden">
          {/* Three Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 h-[600px] md:h-[700px] divide-x divide-purple-500/20">
            {/* Gemini Panel */}
            <div 
              className={`relative border-r border-blue-400/30 ${loading.gemini ? 'animate-pulse-glow-blue' : ''}`}
              style={loading.gemini ? { boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)' } : {}}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none"></div>
              <ChatPanel
                modelName="gemini"
                displayName="Gemini"
                glowColor="blue"
                icon="🔮"
                colorConfig={{
                  bg: 'rgba(59, 130, 246, 0.5)',
                  bgLight: 'rgba(96, 165, 250, 0.5)',
                  border: 'rgba(59, 130, 246, 1)'
                }}
              />
            </div>

            {/* Groq Panel */}
            <div 
              className={`relative border-r border-pink-500/30 ${loading.groq ? 'animate-pulse-glow-magenta' : ''}`}
              style={loading.groq ? { boxShadow: '0 0 30px rgba(236, 72, 153, 0.4)' } : {}}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent pointer-events-none"></div>
              <ChatPanel
                modelName="groq"
                displayName="Groq"
                glowColor="pink"
                icon="⚡"
                colorConfig={{
                  bg: 'rgba(236, 72, 153, 0.5)',
                  bgLight: 'rgba(244, 114, 182, 0.5)',
                  border: 'rgba(236, 72, 153, 1)'
                }}
              />
            </div>

            {/* DeepSeek Panel */}
            <div 
              className={`relative ${loading.deepseek ? 'animate-pulse-glow-violet' : ''}`}
              style={loading.deepseek ? { boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)' } : {}}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent pointer-events-none"></div>
              <ChatPanel
                modelName="deepseek"
                displayName="DeepSeek"
                glowColor="violet"
                icon="🌊"
                colorConfig={{
                  bg: 'rgba(139, 92, 246, 0.5)',
                  bgLight: 'rgba(167, 139, 250, 0.5)',
                  border: 'rgba(139, 92, 246, 1)'
                }}
              />
            </div>
          </div>

          {/* Input Bar */}
          <div className="border-t border-purple-500/30 bg-black/60 p-4">
            <div className="flex gap-3 max-w-4xl mx-auto">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask your question to all AI models..."
                className="flex-1 bg-black/40 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || Object.values(loading).some(l => l)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-semibold hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 flex items-center gap-2"
              >
                <span>Send</span>
                <span className="text-lg"><SendIcon /></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ArenaChatSection

