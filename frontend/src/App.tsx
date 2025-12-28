import React, { useState } from 'react';
import { Activity, Target, AlertTriangle, CheckCircle, ArrowRight, Zap, Users, TrendingUp, DollarSign, Shield, BarChart3, PieChart as PieChartIcon, Layers, Lock, RefreshCw, Download } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

// Design System Colors (Dark Mode)
const colors = {
  bg: 'bg-slate-950',
  card: 'bg-slate-900',
  cardHover: 'hover:bg-slate-800/80',
  accent: 'text-indigo-400',
  border: 'border-slate-800',
  text: 'text-slate-300',
  highlight: 'text-white'
};

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

function App() {
  const [idea, setIdea] = useState('');
  const [industry, setIndustry] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [isQuotaError, setIsQuotaError] = useState(false);

  const handleAnalyze = async () => {
    if (!idea || !industry) return;
    setLoading(true);
    setError('');
    setIsQuotaError(false);
    setData(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, industry })
      });

      if (response.status === 429) {
        throw new Error("API_QUOTA_EXHAUSTED");
      }

      if (!response.ok) throw new Error('Analysis failed');
      const result = await response.json();
      console.log("Analysis Result:", result);
      setData(result);
    } catch (err: any) {
      console.error(err);
      if (err.message === "API_QUOTA_EXHAUSTED") {
        setIsQuotaError(true);
        setError('Daily API Quota Exceeded');
      } else {
        setError('Failed to connect to the analysis engine. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Prepare Data for Charts with safe parsing
  const marketShareData = (data?.research?.competitors || []).map((c: any) => ({
    name: c.name,
    value: typeof c.market_share === 'string' ? parseFloat(c.market_share.replace('%', '')) : Number(c.market_share || 0)
  })).filter((item: any) => item.value > 0);

  const demographicsData = data?.strategy?.demographics?.age_groups ?
    Object.entries(data.strategy.demographics.age_groups).map(([key, value]: [string, any]) => ({
      name: key,
      percentage: typeof value === 'string' ? parseFloat(value.replace('%', '')) : Number(value || 0)
    })) : [];

  return (
    <div className={`min-h-screen ${colors.bg} text-slate-200 p-4 md:p-8 font-sans selection:bg-indigo-500/30 print:bg-white print:text-slate-900`}>
      <style>
        {`
          @media print {
            .no-print { display: none !important; }
            body { background-color: white !important; -webkit-print-color-adjust: exact; }
            .print-card { 
               background-color: white !important; 
               border: 1px solid #e2e8f0 !important; 
               box-shadow: none !important; 
               color: black !important;
            }
            .print-text-dark { color: #1e293b !important; }
            .print-text-subtle { color: #64748b !important; }
          }
        `}
      </style>
      <div className="max-w-7xl mx-auto space-y-12">

        {/* Header (Simplified) */}
        <header className="flex items-center justify-between mb-8 border-b border-slate-800 pb-6 print:border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20 print:bg-indigo-600">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight print:text-slate-900">FoundersLens</h1>
              <p className="text-slate-400 text-xs uppercase tracking-wider print:text-slate-500">Business Intelligence Suite</p>
            </div>
          </div>
        </header>

        {/* Input Section */}
        {!data && !loading && !error && (
          <div className="max-w-xl mx-auto mt-20 space-y-8 animate-fade-in-up">
            <div className="text-center space-y-4">
              <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 pb-2">
                Validate Your Vision.
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                Get a comprehensive 360° market analysis, competitor breakdown, and strategic roadmap in seconds.
              </p>
            </div>

            <div className={`p-8 rounded-2xl ${colors.card} border ${colors.border} shadow-2xl space-y-6 relative overflow-hidden group`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-cyan-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Startup Concept</label>
                  <textarea
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all resize-none text-white placeholder-slate-700 h-32"
                    placeholder="Describe your idea in detail..."
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Target Industry</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-white placeholder-slate-700"
                    placeholder="e.g., EdTech, Fintech, Agritech"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={!idea || !industry}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-white shadow-xl shadow-indigo-500/20 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center space-x-2"
                >
                  <span>Generate Intelligence Report</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-96 space-y-8 animate-pulse">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Activity className="w-8 h-8 text-indigo-400" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-white">Analyzing Market Dynamics...</h3>
              <p className="text-slate-400">Scouting competitors, calculating risks, and building your roadmap.</p>
            </div>
          </div>
        )}

        {/* -------------------- ERROR / QUOTA STATE -------------------- */}
        {error && (
          <div className="max-w-2xl mx-auto mt-20 animate-fade-in text-center">
            <div className={`p-8 rounded-3xl border ${isQuotaError ? 'bg-red-950/30 border-red-500/50' : 'bg-slate-900 border-slate-800'} backdrop-blur-xl relative overflow-hidden`}>
              {isQuotaError ? (
                <>
                  <div className="flex justify-center mb-6">
                    <div className="p-4 bg-red-500/20 rounded-full animate-pulse">
                      <Lock className="w-12 h-12 text-red-500" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-3">API Limit Reached</h2>
                  <p className="text-red-200 text-lg mb-8 leading-relaxed">
                    The AI engine has hit its daily rate limit. Please allow some time for the quota to reset or verify your API key configuration.
                  </p>
                  <button
                    onClick={() => { setError(''); setIsQuotaError(false); }}
                    className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-500/20 flex items-center justify-center mx-auto space-x-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>Try Again Later</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="flex justify-center mb-6">
                    <AlertTriangle className="w-12 h-12 text-amber-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Analysis Failed</h2>
                  <p className="text-slate-400 mb-6">{error}</p>
                  <button
                    onClick={() => setError('')}
                    className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700"
                  >
                    Dismiss
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Dashboard Results */}
        {data && !loading && (
          <div className="space-y-8 animate-fade-in pb-20">

            {/* 1. Score & Opportunity */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Score Card */}
              <div className={`col-span-1 ${colors.card} border ${colors.border} rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden group print-card`}>
                <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity no-print"></div>
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6 print-text-subtle">Viability Score</h3>
                <div className="relative flex items-center justify-center">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800 print:text-slate-200" />
                    <circle
                      cx="64" cy="64" r="56"
                      stroke="currentColor" strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={351}
                      strokeDashoffset={351 - (351 * (data.strategy?.viability_score || 0)) / 100}
                      className={`text-indigo-500 transition-all duration-1000 ease-out`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-3xl font-bold text-white print-text-dark">{data.strategy?.viability_score || 0}</span>
                  </div>
                </div>
              </div>

              {/* Key Opportunity */}
              <div className={`col-span-1 md:col-span-3 ${colors.card} border ${colors.border} rounded-2xl p-8 flex flex-col justify-center print-card`}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-indigo-500/10 rounded-lg no-print">
                    <Zap className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white print-text-dark">The Whitespace Opportunity</h3>
                </div>
                <p className="text-slate-300 text-lg leading-relaxed print-text-dark">
                  {data.research?.opportunity || "Analysis pending..."}
                </p>
              </div>
            </div>

            {/* 2. Financial Stats Grid */}
            {data.strategy?.financials && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className={`${colors.card} border ${colors.border} rounded-2xl p-6 print-card`}>
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 print-text-subtle">Revenue / User</h4>
                  <p className="text-2xl font-bold text-emerald-400">{data.strategy.financials.revenue_per_user}</p>
                </div>
                <div className={`${colors.card} border ${colors.border} rounded-2xl p-6 print-card`}>
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 print-text-subtle">Min Investment</h4>
                  <p className="text-2xl font-bold text-blue-400">{data.strategy.financials.min_investment}</p>
                </div>
                <div className={`${colors.card} border ${colors.border} rounded-2xl p-6 print-card`}>
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 print-text-subtle">Break-even</h4>
                  <p className="text-2xl font-bold text-amber-400">{data.strategy.financials.break_even}</p>
                </div>
                <div className={`${colors.card} border ${colors.border} rounded-2xl p-6 print-card`}>
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 print-text-subtle">Growth Rate</h4>
                  <p className="text-2xl font-bold text-indigo-400">{data.strategy.financials.user_growth_rate}</p>
                </div>
              </div>
            )}

            {/* 3. Market Trends */}
            <div className={`${colors.card} border ${colors.border} rounded-2xl p-8 print-card`}>
              <div className="flex items-center space-x-3 mb-6">
                <TrendingUp className="w-5 h-5 text-indigo-400 no-print" />
                <h2 className="text-xl font-bold text-white print-text-dark">Supporting Market Trends</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(data.research?.market_trends || []).map((trend: string, i: number) => (
                  <div key={i} className="flex items-start space-x-3 p-3 rounded-lg bg-slate-950/30 print:bg-slate-50">
                    <div className="mt-1"><ArrowRight className="w-4 h-4 text-indigo-500" /></div>
                    <p className="text-slate-300 text-sm leading-relaxed print-text-dark">{trend}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Charts Section (Recharts) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 break-inside-avoid">
              {/* Market Share Pie */}
              <div className={`${colors.card} border ${colors.border} rounded-2xl p-6 print-card`}>
                <div className='flex justify-between items-center mb-4'>
                  <h3 className="text-lg font-bold text-white flex items-center print-text-dark">
                    <PieChartIcon className="w-5 h-5 mr-2 text-indigo-400 no-print" /> Market Share
                  </h3>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={marketShareData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {marketShareData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                      />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 p-4 bg-slate-950/50 rounded-xl border border-slate-800/50 print:bg-slate-50 print:border-slate-200">
                  <div className="flex items-start space-x-2">
                    <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 animate-pulse no-print"></div>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium print-text-dark">
                      {data.research?.market_share_insight || "Competitors are fighting for dominance in this fragmented landscape."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Demographics Bar */}
              <div className={`${colors.card} border ${colors.border} rounded-2xl p-6 print-card`}>
                <div className='flex justify-between items-center mb-4'>
                  <h3 className="text-lg font-bold text-white flex items-center print-text-dark">
                    <Users className="w-5 h-5 mr-2 text-blue-400 no-print" /> Age Demographics
                  </h3>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={demographicsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis
                        dataKey="name"
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip
                        cursor={{ fill: '#1e293b', opacity: 0.4 }}
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '8px' }}
                      />
                      <Bar dataKey="percentage" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 p-4 bg-slate-950/50 rounded-xl border border-slate-800/50 print:bg-slate-50 print:border-slate-200">
                  <div className="flex items-start space-x-2">
                    <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 animate-pulse no-print"></div>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium print-text-dark">
                      {data.strategy?.demographics?.demographics_insight || "Targeting the most active user base for maximum adoption."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Detailed Strategy Grid (Acquisition, Models, Risks) */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <Layers className="w-6 h-6 text-indigo-400 no-print" />
                <h2 className="text-2xl font-bold text-white print-text-dark">Execution Strategy</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Acquisition */}
                <div className={`${colors.card} border ${colors.border} rounded-2xl p-8 print-card`}>
                  <div className="flex items-center space-x-3 mb-6">
                    <TrendingUp className="w-5 h-5 text-blue-400 no-print" />
                    <h3 className="text-lg font-bold text-white print-text-dark">Acquisition</h3>
                  </div>
                  <ul className="space-y-4">
                    {(data.strategy?.user_acquisition || []).map((item: string, i: number) => {
                      const parts = item.includes(':') ? item.split(':') : [item, ''];
                      return (
                        <li key={i}>
                          <span className="text-white font-semibold block mb-1 print-text-dark">{parts[0]}</span>
                          {parts[1] && <span className="text-slate-400 text-xs leading-relaxed block print-text-subtle">{parts[1]}</span>}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Business Models */}
                <div className={`${colors.card} border ${colors.border} rounded-2xl p-8 print-card`}>
                  <div className="flex items-center space-x-3 mb-6">
                    <DollarSign className="w-5 h-5 text-amber-400 no-print" />
                    <h3 className="text-lg font-bold text-white print-text-dark">Monetization</h3>
                  </div>
                  <ul className="space-y-4">
                    {(data.strategy?.business_models || []).map((item: string, i: number) => {
                      const parts = item.includes(':') ? item.split(':') : [item, ''];
                      return (
                        <li key={i}>
                          <span className="text-white font-semibold block mb-1 print-text-dark">{parts[0]}</span>
                          {parts[1] && <span className="text-slate-400 text-xs leading-relaxed block print-text-subtle">{parts[1]}</span>}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Risk Analysis */}
                <div className={`${colors.card} border ${colors.border} rounded-2xl p-8 print-card`}>
                  <div className="flex items-center space-x-3 mb-6">
                    <Shield className="w-5 h-5 text-red-400 no-print" />
                    <h3 className="text-lg font-bold text-white print-text-dark">Primary Risk</h3>
                  </div>
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl print:bg-red-50 print:border-red-200">
                    <p className="text-red-200 text-sm leading-relaxed print:text-red-800">{data.strategy?.risk_analysis}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. SWOT */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-6 h-6 text-indigo-400 no-print" />
                <h2 className="text-2xl font-bold text-white print-text-dark">SWOT Analysis</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 print-card">
                  <h4 className="text-emerald-400 font-bold mb-4 flex items-center print:text-emerald-700"><CheckCircle className="w-4 h-4 mr-2" /> Strengths</h4>
                  <ul className="list-disc list-inside space-y-2 text-slate-400 text-xs print-text-dark">
                    {(data.strategy?.swot?.strengths || []).map((item: string, i: number) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 print-card">
                  <h4 className="text-red-400 font-bold mb-4 flex items-center print:text-red-700"><AlertTriangle className="w-4 h-4 mr-2" /> Weaknesses</h4>
                  <ul className="list-disc list-inside space-y-2 text-slate-400 text-xs print-text-dark">
                    {(data.strategy?.swot?.weaknesses || []).map((item: string, i: number) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 print-card">
                  <h4 className="text-blue-400 font-bold mb-4 flex items-center print:text-blue-700"><TrendingUp className="w-4 h-4 mr-2" /> Opportunities</h4>
                  <ul className="list-disc list-inside space-y-2 text-slate-400 text-xs print-text-dark">
                    {(data.strategy?.swot?.opportunities || []).map((item: string, i: number) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 print-card">
                  <h4 className="text-amber-400 font-bold mb-4 flex items-center print:text-amber-700"><Shield className="w-4 h-4 mr-2" /> Threats</h4>
                  <ul className="list-disc list-inside space-y-2 text-slate-400 text-xs print-text-dark">
                    {(data.strategy?.swot?.threats || []).map((item: string, i: number) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              </div>
            </div>

            {/* 7. Action Footer */}
            <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8 mt-12 pt-8 border-t border-slate-800 no-print">
              <button
                onClick={() => setData(null)}
                className="w-full md:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl transition-all border border-slate-800 font-medium"
              >
                Evaluate Another Idea
              </button>
              <button
                onClick={handlePrint}
                className="w-full md:w-auto flex items-center justify-center space-x-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/20 font-bold"
              >
                <Download className="w-5 h-5" />
                <span>Download & Print</span>
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default App;
