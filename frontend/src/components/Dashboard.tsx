import React, { useState } from 'react';
import { Activity, Target, AlertTriangle, CheckCircle, ArrowRight, Zap, Users, TrendingUp, DollarSign, Shield, BarChart3, PieChart as PieChartIcon, Layers, Lock, RefreshCw, Download, Home, ArrowLeft } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

const colors = {
    bg: 'bg-slate-950',
    card: 'bg-slate-900',
    cardHover: 'hover:bg-slate-800',
    accent: 'text-blue-400',
    border: 'border-slate-800',
    text: 'text-slate-400',
    highlight: 'text-white',
    buttonPrimary: 'bg-blue-600 hover:bg-blue-500 text-white',
    buttonSecondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
};

const COLORS = ['#60a5fa', '#34d399', '#a78bfa', '#f472b6', '#fbbf24'];

interface DashboardProps {
    onBack: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onBack }) => {
    const [idea, setIdea] = useState('');
    const [industry, setIndustry] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState('');
    const [isQuotaError, setIsQuotaError] = useState(false);
    const [customKey, setCustomKey] = useState('');

    const handleAnalyze = async (keyOverride?: string) => {
        if (!idea || !industry) return;
        setLoading(true);
        setError('');
        setIsQuotaError(false);
        setData(null);

        const activeKey = keyOverride || customKey;

        try {
            const bodyPayload: any = { idea, industry };
            if (activeKey) {
                bodyPayload.custom_api_key = activeKey;
            }

            const response = await fetch('http://127.0.0.1:8000/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyPayload)
            });

            if (response.status === 429) {
                throw new Error("API_QUOTA_EXHAUSTED");
            }

            if (!response.ok) throw new Error('Analysis failed');
            const result = await response.json();
            console.log("Analysis Result:", result);
            setData(result);

            if (keyOverride) {
                setCustomKey(keyOverride);
            }

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
        <div className={`min-h-screen ${colors.bg} ${colors.text} font-sans selection:bg-blue-500/30 print:bg-white`}>
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
            .text-slate-400 { color: #64748b !important; }
            .text-white { color: #0f172a !important; }
            .bg-slate-900 { background-color: white !important; }
            .bg-slate-950 { background-color: white !important; }
            .border-slate-800 { border-color: #e2e8f0 !important; }
          }
        `}
            </style>

            <nav className="bg-slate-900/50 backdrop-blur-md border-b border-white/5 sticky top-0 z-50 print:hidden">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div
                            className="flex items-center space-x-2 cursor-pointer group"
                            onClick={onBack}
                        >
                            <div className="p-2 bg-blue-600 rounded-lg group-hover:bg-blue-500 transition-colors">
                                <Activity className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white tracking-tight">FoundersLens</span>
                        </div>
                        <button
                            onClick={onBack}
                            className="flex items-center space-x-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                        >
                            <Home className="w-4 h-4" />
                            <span>Back to Home</span>
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-12">

                {!data && !loading && !error && (
                    <div className="max-w-3xl mx-auto mt-12 space-y-8 animate-fade-in-up">
                        <div className="text-center space-y-4">
                            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                                Validate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Vision.</span>
                            </h2>
                            <p className="text-slate-400 text-lg leading-relaxed max-w-xl mx-auto">
                                Enter your startup concept below to generate a professional market analysis, competitor breakdown, and strategic roadmap.
                            </p>
                        </div>

                        <div className={`p-8 rounded-2xl ${colors.card} border ${colors.border} shadow-2xl shadow-blue-900/10 space-y-6 relative overflow-hidden`}>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                            <div className="space-y-6 relative z-10">
                                <div>
                                    <label className="block text-xs font-bold text-slate-200 uppercase tracking-widest mb-2">Startup Concept</label>
                                    <textarea
                                        className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-white placeholder-slate-400 h-32 font-medium"
                                        placeholder="Describe your idea in detail..."
                                        value={idea}
                                        onChange={(e) => setIdea(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-200 uppercase tracking-widest mb-2">Target Industry</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white placeholder-slate-400 font-medium"
                                        placeholder="e.g., EdTech, Fintech, Agritech"
                                        value={industry}
                                        onChange={(e) => setIndustry(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={() => handleAnalyze()}
                                    disabled={!idea || !industry}
                                    className={`w-full py-4 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center space-x-2 ${colors.buttonPrimary} disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    <span>Generate Intelligence Report</span>
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="flex flex-col items-center justify-center h-96 space-y-12">
                        <div className="flex space-x-4 items-center justify-center p-6">
                            <div className="w-5 h-5 rounded-full bg-[#4285F4] animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-5 h-5 rounded-full bg-[#EA4335] animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-5 h-5 rounded-full bg-[#FBBC05] animate-bounce [animation-delay:0s]"></div>
                            <div className="w-5 h-5 rounded-full bg-[#34A853] animate-bounce [animation-delay:-0.15s]"></div>
                        </div>

                        <div className="text-center space-y-4 animate-pulse">
                            <h3 className="text-3xl font-bold text-white">Generating Intelligence...</h3>
                            <p className="text-slate-400 text-lg">Analyzing competitors, risks, and market gaps.</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="max-w-2xl mx-auto mt-20 animate-fade-in text-center">
                        <div className={`p-8 rounded-3xl border ${isQuotaError ? 'bg-red-950/20 border-red-900/50' : 'bg-slate-900 border-slate-800'} shadow-xl relative overflow-hidden`}>
                            {isQuotaError ? (
                                <div className="space-y-6">
                                    <div className="flex justify-center mb-2">
                                        <div className="p-4 bg-red-500/10 rounded-full animate-pulse">
                                            <Lock className="w-8 h-8 text-red-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-2">API Limit Reached</h2>
                                        <p className="text-slate-400 mb-6 leading-relaxed max-w-lg mx-auto">
                                            The demo server's daily rate limit has been exhausted. You can try again later, or use your own Google Gemini API key to continue testing immediately.
                                        </p>
                                    </div>

                                    <div className="max-w-md mx-auto bg-slate-950 p-6 rounded-xl border border-red-900/30 shadow-inner text-left">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Enter Your Gemini API Key</label>
                                        <input
                                            type="password"
                                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none mb-4 text-white"
                                            placeholder="AIzaSy..."
                                            value={customKey}
                                            onChange={(e) => setCustomKey(e.target.value)}
                                        />
                                        <button
                                            onClick={() => handleAnalyze(customKey)}
                                            disabled={!customKey}
                                            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-all shadow-lg shadow-red-600/20 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            <span>Retry with My Key</span>
                                        </button>
                                        <p className="text-xs text-slate-500 mt-3 text-center">
                                            Your key is only used for this session and isn't stored.
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => { setError(''); setIsQuotaError(false); }}
                                        className="text-slate-500 hover:text-white text-sm font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-center mb-6">
                                        <AlertTriangle className="w-12 h-12 text-amber-500" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Analysis Failed</h2>
                                    <p className="text-slate-400 mb-6">{error}</p>
                                    <button
                                        onClick={() => setError('')}
                                        className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                                    >
                                        Dismiss
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {data && !loading && (
                    <div className="space-y-8 animate-fade-in pb-20">

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className={`col-span-1 ${colors.card} border ${colors.border} rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-sm print-card`}>
                                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-6">Viability Score</h3>
                                <div className="relative flex items-center justify-center">
                                    <svg className="w-32 h-32 transform -rotate-90">
                                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                                        <circle
                                            cx="64" cy="64" r="56"
                                            stroke="currentColor" strokeWidth="8"
                                            fill="transparent"
                                            strokeDasharray={351}
                                            strokeDashoffset={351 - (351 * (data.strategy?.viability_score || 0)) / 100}
                                            className={`text-blue-500 transition-all duration-1000 ease-out shadow-neon`}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                                        <span className="text-4xl font-bold text-white">{data.strategy?.viability_score || 0}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={`col-span-1 md:col-span-3 ${colors.card} border ${colors.border} rounded-2xl p-8 flex flex-col justify-center shadow-lg shadow-blue-900/5 print-card`}>
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="p-2 bg-blue-500/10 rounded-lg no-print">
                                        <Zap className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white">The Whitespace Opportunity</h3>
                                </div>
                                <p className="text-slate-300 text-lg leading-relaxed">
                                    {data.research?.opportunity || "Analysis pending..."}
                                </p>
                            </div>
                        </div>

                        {data.strategy?.financials && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className={`${colors.card} border ${colors.border} rounded-2xl p-6 shadow-sm print-card`}>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Revenue / User</h4>
                                    <p className="text-2xl font-bold text-emerald-400">{data.strategy.financials.revenue_per_user}</p>
                                </div>
                                <div className={`${colors.card} border ${colors.border} rounded-2xl p-6 shadow-sm print-card`}>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Min Investment</h4>
                                    <p className="text-2xl font-bold text-blue-400">{data.strategy.financials.min_investment}</p>
                                </div>
                                <div className={`${colors.card} border ${colors.border} rounded-2xl p-6 shadow-sm print-card`}>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Break-even</h4>
                                    <p className="text-2xl font-bold text-amber-400">{data.strategy.financials.break_even}</p>
                                </div>
                                <div className={`${colors.card} border ${colors.border} rounded-2xl p-6 shadow-sm print-card`}>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Growth Rate</h4>
                                    <p className="text-2xl font-bold text-purple-400">{data.strategy.financials.user_growth_rate}</p>
                                </div>
                            </div>
                        )}

                        <div className={`${colors.card} border ${colors.border} rounded-2xl p-8 shadow-sm print-card`}>
                            <div className="flex items-center space-x-3 mb-6">
                                <TrendingUp className="w-5 h-5 text-blue-400 no-print" />
                                <h2 className="text-xl font-bold text-white">Supporting Market Trends</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(data.research?.market_trends || []).map((trend: string, i: number) => (
                                    <div key={i} className="flex items-start space-x-3 p-3 rounded-lg bg-slate-950/50 print:bg-slate-50">
                                        <div className="mt-1"><ArrowRight className="w-4 h-4 text-blue-500" /></div>
                                        <p className="text-slate-300 text-sm leading-relaxed">{trend}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 break-inside-avoid">
                            <div className={`${colors.card} border ${colors.border} rounded-2xl p-6 shadow-sm print-card`}>
                                <div className='flex justify-between items-center mb-4'>
                                    <h3 className="text-lg font-bold text-white flex items-center">
                                        <PieChartIcon className="w-5 h-5 mr-2 text-blue-400 no-print" /> Market Share
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
                                                stroke="none"
                                            >
                                                {marketShareData.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)' }}
                                                itemStyle={{ color: '#f8fafc' }}
                                            />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-4 p-4 bg-slate-950/50 rounded-xl border border-slate-800 print:bg-slate-50 print:border-slate-200">
                                    <div className="flex items-start space-x-2">
                                        <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 animate-pulse no-print"></div>
                                        <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                            {data.research?.market_share_insight || "Competitors are fighting for dominance in this fragmented landscape."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className={`${colors.card} border ${colors.border} rounded-2xl p-6 shadow-sm print-card`}>
                                <div className='flex justify-between items-center mb-4'>
                                    <h3 className="text-lg font-bold text-white flex items-center">
                                        <Users className="w-5 h-5 mr-2 text-blue-400 no-print" /> Age Demographics
                                    </h3>
                                </div>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={demographicsData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
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
                                                cursor={{ fill: '#334155', opacity: 0.4 }}
                                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)' }}
                                            />
                                            <Bar dataKey="percentage" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-4 p-4 bg-slate-950/50 rounded-xl border border-slate-800 print:bg-slate-50 print:border-slate-200">
                                    <div className="flex items-start space-x-2">
                                        <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 animate-pulse no-print"></div>
                                        <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                            {data.strategy?.demographics?.demographics_insight || "Targeting the most active user base for maximum adoption."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center space-x-3">
                                <Layers className="w-6 h-6 text-blue-400 no-print" />
                                <h2 className="text-2xl font-bold text-white">Execution Strategy</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className={`${colors.card} border ${colors.border} rounded-2xl p-8 shadow-sm print-card`}>
                                    <div className="flex items-center space-x-3 mb-6">
                                        <TrendingUp className="w-5 h-5 text-blue-400 no-print" />
                                        <h3 className="text-lg font-bold text-white">Acquisition</h3>
                                    </div>
                                    <ul className="space-y-4">
                                        {(data.strategy?.user_acquisition || []).map((item: string, i: number) => {
                                            const parts = item.includes(':') ? item.split(':') : [item, ''];
                                            return (
                                                <li key={i}>
                                                    <span className="text-white font-semibold block mb-1">{parts[0]}</span>
                                                    {parts[1] && <span className="text-slate-400 text-xs leading-relaxed block">{parts[1]}</span>}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>

                                <div className={`${colors.card} border ${colors.border} rounded-2xl p-8 shadow-sm print-card`}>
                                    <div className="flex items-center space-x-3 mb-6">
                                        <DollarSign className="w-5 h-5 text-blue-400 no-print" />
                                        <h3 className="text-lg font-bold text-white">Monetization</h3>
                                    </div>
                                    <ul className="space-y-4">
                                        {(data.strategy?.business_models || []).map((item: string, i: number) => {
                                            const parts = item.includes(':') ? item.split(':') : [item, ''];
                                            return (
                                                <li key={i}>
                                                    <span className="text-white font-semibold block mb-1">{parts[0]}</span>
                                                    {parts[1] && <span className="text-slate-400 text-xs leading-relaxed block">{parts[1]}</span>}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>

                                <div className={`${colors.card} border ${colors.border} rounded-2xl p-8 shadow-sm print-card`}>
                                    <div className="flex items-center space-x-3 mb-6">
                                        <Shield className="w-5 h-5 text-red-500 no-print" />
                                        <h3 className="text-lg font-bold text-white">Primary Risk</h3>
                                    </div>
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl print:bg-red-50 print:border-red-200">
                                        <p className="text-red-400 text-sm leading-relaxed">{data.strategy?.risk_analysis}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center space-x-3">
                                <BarChart3 className="w-6 h-6 text-blue-400 no-print" />
                                <h2 className="text-2xl font-bold text-white">SWOT Analysis</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm print-card">
                                    <h4 className="text-emerald-400 font-bold mb-4 flex items-center print:text-emerald-700"><CheckCircle className="w-4 h-4 mr-2" /> Strengths</h4>
                                    <ul className="list-disc list-inside space-y-2 text-slate-300 text-xs">
                                        {(data.strategy?.swot?.strengths || []).map((item: string, i: number) => <li key={i}>{item}</li>)}
                                    </ul>
                                </div>
                                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm print-card">
                                    <h4 className="text-red-400 font-bold mb-4 flex items-center print:text-red-700"><AlertTriangle className="w-4 h-4 mr-2" /> Weaknesses</h4>
                                    <ul className="list-disc list-inside space-y-2 text-slate-300 text-xs">
                                        {(data.strategy?.swot?.weaknesses || []).map((item: string, i: number) => <li key={i}>{item}</li>)}
                                    </ul>
                                </div>
                                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm print-card">
                                    <h4 className="text-blue-400 font-bold mb-4 flex items-center print:text-blue-700"><TrendingUp className="w-4 h-4 mr-2" /> Opportunities</h4>
                                    <ul className="list-disc list-inside space-y-2 text-slate-300 text-xs">
                                        {(data.strategy?.swot?.opportunities || []).map((item: string, i: number) => <li key={i}>{item}</li>)}
                                    </ul>
                                </div>
                                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm print-card">
                                    <h4 className="text-amber-400 font-bold mb-4 flex items-center print:text-amber-700"><Shield className="w-4 h-4 mr-2" /> Threats</h4>
                                    <ul className="list-disc list-inside space-y-2 text-slate-300 text-xs">
                                        {(data.strategy?.swot?.threats || []).map((item: string, i: number) => <li key={i}>{item}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8 mt-12 pt-8 border-t border-slate-800 no-print">
                            <button
                                onClick={() => setData(null)}
                                className={`w-full md:w-auto px-6 py-3 rounded-xl font-medium transition-all ${colors.buttonSecondary}`}
                            >
                                Evaluate Another Idea
                            </button>
                            <button
                                onClick={handlePrint}
                                className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center space-x-2 ${colors.buttonPrimary}`}
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

export default Dashboard;
