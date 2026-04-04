import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Database, 
  HardDrive, 
  Users, 
  Github, 
  ArrowLeft, 
  RefreshCw, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { motion } from 'motion/react';
import { monitorService, GitHubRateLimit, SupabaseUsage } from '../../../services/monitorService';

interface SystemMonitorProps {
  onBack: () => void;
}

export default function SystemMonitor({ onBack }: SystemMonitorProps) {
  const [githubLimits, setGithubLimits] = useState<GitHubRateLimit[]>([]);
  const [supabaseUsage, setSupabaseUsage] = useState<SupabaseUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const [gh, sb] = await Promise.all([
        monitorService.getGitHubRateLimits(),
        monitorService.getSupabaseUsage()
      ]);

      setGithubLimits(gh);
      if (sb) {
        setSupabaseUsage(prev => {
          const newList = [...prev, sb];
          // Keep last 20 data points for the graph
          return newList.slice(-20);
        });
      }
    } catch (err) {
      console.error('Error fetching monitor data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const latestUsage = supabaseUsage[supabaseUsage.length - 1];

  return (
    <div className="min-h-screen bg-[#F5F2ED] text-[#1A1A1A] font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 rounded-full hover:bg-stone-200 transition-colors"
              title="Kembali"
            >
              <ArrowLeft size={24} className="text-stone-600" />
            </button>
            <div>
              <h1 className="text-3xl font-serif font-bold text-stone-800">Monitor <span className="italic">Sistem</span></h1>
              <p className="text-stone-500 text-sm">Pantau performa infrastruktur secara real-time.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Sistem Aktif
            </div>
            <button 
              onClick={fetchData}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl text-stone-600 font-bold text-sm hover:bg-stone-50 transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              Segarkan
            </button>
          </div>
        </header>

        {loading ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-stone-500 font-medium">Menghubungkan ke server...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Supabase Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                    <Database size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Database Size</p>
                    <h3 className="text-xl font-bold text-stone-800">{latestUsage ? formatBytes(latestUsage.db_size) : '-'}</h3>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '45%' }} />
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                    <HardDrive size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Storage Size</p>
                    <h3 className="text-xl font-bold text-stone-800">{latestUsage ? formatBytes(latestUsage.storage_size) : '-'}</h3>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '30%' }} />
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-rose-50 rounded-2xl text-rose-600">
                    <Activity size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">API Requests</p>
                    <h3 className="text-xl font-bold text-stone-800">{latestUsage ? latestUsage.api_requests : '-'} <span className="text-xs text-stone-400 font-normal">/min</span></h3>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
                  <TrendingUp size={14} />
                  +12% vs last hour
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Active Users</p>
                    <h3 className="text-xl font-bold text-stone-800">{latestUsage ? latestUsage.active_users : '-'}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-stone-400 text-xs font-medium">
                  <Clock size={14} />
                  Real-time update
                </div>
              </motion.div>
            </div>

            {/* Main Graphs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Supabase Activity Graph */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-sm border border-stone-100"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-stone-800">Aktivitas Database</h3>
                    <p className="text-stone-400 text-sm">Statistik request API dan beban database.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-amber-500 rounded-full" />
                      <span className="text-xs font-bold text-stone-500">Requests</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-indigo-500 rounded-full" />
                      <span className="text-xs font-bold text-stone-500">Users</span>
                    </div>
                  </div>
                </div>
                
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={supabaseUsage}>
                      <defs>
                        <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                      <XAxis 
                        dataKey="timestamp" 
                        tickFormatter={formatTime} 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#A8A29E' }}
                      />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A8A29E' }} />
                      <Tooltip 
                        labelFormatter={formatTime}
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Area type="monotone" dataKey="api_requests" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorRequests)" />
                      <Area type="monotone" dataKey="active_users" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* GitHub Token Monitoring */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-8 rounded-[3rem] shadow-sm border border-stone-100"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-stone-900 rounded-2xl text-white">
                    <Github size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold text-stone-800">GitHub Tokens</h3>
                    <p className="text-stone-400 text-sm">Monitoring kuota API Rate Limit.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {githubLimits.length === 0 ? (
                    <div className="bg-stone-50 p-6 rounded-2xl border border-dashed border-stone-200 text-center">
                      <AlertCircle size={24} className="text-stone-300 mx-auto mb-2" />
                      <p className="text-stone-400 text-xs">Token belum dikonfigurasi di .env</p>
                    </div>
                  ) : (
                    githubLimits.map((limit, idx) => (
                      <div key={idx} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShieldCheck size={14} className="text-emerald-500" />
                            <span className="text-xs font-bold text-stone-600">{limit.token}</span>
                          </div>
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                            {limit.remaining} / {limit.limit}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(limit.remaining / limit.limit) * 100}%` }}
                            className={`h-full rounded-full ${
                              (limit.remaining / limit.limit) < 0.2 ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] text-stone-400 font-medium">
                          <span>Reset: {new Date(limit.reset * 1000).toLocaleTimeString()}</span>
                          <span>Used: {limit.used}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-12 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <p className="text-[10px] text-amber-700 leading-relaxed font-medium">
                    <span className="font-bold">Info:</span> GitHub API memiliki batas 5,000 request per jam per token. Pastikan sisa kuota mencukupi untuk fitur AI.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        <footer className="mt-12 text-center text-stone-400 text-xs font-medium uppercase tracking-widest">
          Sistem Monitoring v1.0 • Terakhir diperbarui: {new Date().toLocaleTimeString()}
        </footer>
      </div>
    </div>
  );
}
