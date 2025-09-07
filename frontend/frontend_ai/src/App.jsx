import { useState } from 'react'

const API_BASE = "http://localhost:8000"

// Helper function to strip HTML tags
const stripHtmlTags = (html) => {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

// Navigation Component
function Navigation({ currentPage, setCurrentPage }) {
  const navItems = [
    { id: 'news', label: 'News', icon: '📰' },
    { id: 'stocks', label: 'Stocks', icon: '📈' },
    { id: 'upload', label: 'File Upload', icon: '📤' },
    { id: 'history', label: 'History', icon: '🕒' }
  ]

  return (
    <nav className="bg-white shadow-lg rounded-xl mb-8">
      <div className="flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Autonomous AI Knowledge Worker
        </h1>
        <div className="flex space-x-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                currentPage === item.id
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}

// News Component
function NewsSection({ loading, error, fetchNews, news, query, setQuery }) {
  return (
    <section className="bg-white p-6 shadow-lg rounded-xl border border-gray-100">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
        <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
        News Ingestion
      </h2>
      <div className="flex gap-3 mb-4">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-3 flex-grow focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="Enter topic (e.g., AI, Technology, Markets)..."
        />
        <button
          onClick={fetchNews}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:scale-100"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              Fetching...
            </span>
          ) : (
            "Fetch News"
          )}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {news && (
        <div className="space-y-4">
          {news.summary && (
            <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl">
              <h3 className="text-lg font-semibold mb-3 text-blue-800 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                AI Summary
              </h3>
              <p className="text-blue-900 leading-relaxed">{news.summary}</p>
            </div>
          )}
          <div className="space-y-3">
            {news.items.map((n, idx) => (
              <div key={idx} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-all">
                <a 
                  href={n.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="font-medium text-blue-600 hover:text-blue-800 underline transition-colors"
                >
                  {n.title}
                </a>
                <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                  {stripHtmlTags(n.description)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

// Stocks Component
function StocksSection({ loading, error, fetchStock, stock, symbol, setSymbol }) {
  return (
    <section className="bg-white p-6 shadow-lg rounded-xl border border-gray-100">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
        Stock Quote
      </h2>
      <div className="flex gap-3 mb-4">
        <input
          value={symbol}
          onChange={e => setSymbol(e.target.value.toUpperCase())}
          className="border border-gray-300 rounded-lg px-4 py-3 flex-grow focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          placeholder="Enter symbol (e.g., AAPL, MSFT, GOOGL)..."
        />
        <button
          onClick={fetchStock}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:scale-100"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              Fetching...
            </span>
          ) : (
            "Fetch Stock"
          )}
        </button>
      </div>

      {stock && (
        <div className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-green-50 to-white">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Symbol</p>
              <p className="font-semibold text-lg">{stock.symbol}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Current Price</p>
              <p className="font-semibold text-lg text-green-600">${stock.quote.price}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Previous Close</p>
              <p className="font-semibold">${stock.quote.previous_close}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Change</p>
              <p className={`font-semibold ${
                stock.insight.change > 0 ? 'text-green-600' : 
                stock.insight.change < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {stock.insight.change > 0 ? '+' : ''}{stock.insight.change}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">Trend Analysis</p>
            <p className="font-semibold text-gray-800">{stock.insight.trend}</p>
          </div>
        </div>
      )}
    </section>
  )
}

// File Upload Component
function UploadSection({ loading, error, uploadFile, uploadSummary, file, setFile }) {
  return (
    <section className="bg-white p-6 shadow-lg rounded-xl border border-gray-100">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
        <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
        File Upload + AI Summary
      </h2>
      <div className="flex gap-3 mb-4">
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={e => setFile(e.target.files[0])}
          className="border border-gray-300 rounded-lg px-4 py-3 flex-grow focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        />
        <button
          onClick={uploadFile}
          disabled={loading || !file}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:scale-100"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              Uploading...
            </span>
          ) : (
            "Upload & Analyze"
          )}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {uploadSummary && (
        <div className="bg-purple-50 border border-purple-200 p-5 rounded-xl">
          <h3 className="text-lg font-semibold mb-3 text-purple-800 flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            AI Summary
          </h3>
          <p className="text-purple-900 leading-relaxed">{uploadSummary}</p>
        </div>
      )}
    </section>
  )
}

// History Component
function HistorySection({ newsHistory, stockHistory, fetchNewsHistory, fetchStockHistory }) {
  return (
    <section className="bg-white p-6 shadow-lg rounded-xl border border-gray-100">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">History</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* News History */}
        <div className="border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              News History
            </h3>
            <button
              onClick={fetchNewsHistory}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Refresh
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
            {newsHistory.map((h) => (
              <div key={h.id} className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-all">
                <p className="font-medium text-gray-800">{h.query} → {h.title}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(h.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Stock History */}
        <div className="border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Stock History
            </h3>
            <button
              onClick={fetchStockHistory}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Refresh
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
            {stockHistory.map((h) => (
              <div key={h.id} className="border border-gray-200 rounded-lg p-3 hover:border-green-300 transition-all">
                <p className="font-medium text-gray-800">{h.symbol} → ${h.price}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(h.created_at).toLocaleString()}
                </p>
                <p className={`text-sm font-medium mt-1 ${
                  h.change > 0 ? 'text-green-600' : 
                  h.change < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  Trend: {h.change > 0 ? '📈 Up' : h.change < 0 ? '📉 Down' : '➡️ Neutral'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// Main App Component
export default function App() {
  const [currentPage, setCurrentPage] = useState('news')
  const [query, setQuery] = useState("AI")
  const [news, setNews] = useState(null)
  const [symbol, setSymbol] = useState("AAPL")
  const [stock, setStock] = useState(null)
  const [newsHistory, setNewsHistory] = useState([])
  const [stockHistory, setStockHistory] = useState([])
  const [file, setFile] = useState(null)
  const [uploadSummary, setUploadSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // ----------------- API Calls -----------------
  const fetchNews = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/news`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, page_size: 3 })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Failed to fetch news")
      setNews(data)
      fetchNewsHistory()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchStock = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Failed to fetch stock")
      setStock(data)
      fetchStockHistory()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchNewsHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/history/news`)
      const data = await res.json()
      setNewsHistory(data)
    } catch (e) {
      console.error("Error fetching news history", e)
    }
  }

  const fetchStockHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/history/stocks`)
      const data = await res.json()
      setStockHistory(data)
    } catch (e) {
      console.error("Error fetching stock history", e)
    }
  }

  const uploadFile = async () => {
    if (!file) {
      setError("Please select a file first")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        body: formData
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Failed to upload file")
      setUploadSummary(data.summary)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // Render current page
  const renderCurrentPage = () => {
    switch(currentPage) {
      case 'news':
        return (
          <NewsSection 
            loading={loading}
            error={error}
            fetchNews={fetchNews}
            news={news}
            query={query}
            setQuery={setQuery}
          />
        )
      case 'stocks':
        return (
          <StocksSection 
            loading={loading}
            error={error}
            fetchStock={fetchStock}
            stock={stock}
            symbol={symbol}
            setSymbol={setSymbol}
          />
        )
      case 'upload':
        return (
          <UploadSection 
            loading={loading}
            error={error}
            uploadFile={uploadFile}
            uploadSummary={uploadSummary}
            file={file}
            setFile={setFile}
          />
        )
      case 'history':
        return (
          <HistorySection 
            newsHistory={newsHistory}
            stockHistory={stockHistory}
            fetchNewsHistory={fetchNewsHistory}
            fetchStockHistory={fetchStockHistory}
          />
        )
      default:
        return <NewsSection />
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto bg-gray-50 min-h-screen">
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      {renderCurrentPage()}
    </div>
  )
}