import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { getDashboardStats } from '../services/dashboardService';
import { FileText, Database, MessageSquare, Users, Clock, UploadCloud, Library, Zap, Activity, BookOpen, BrainCircuit, ChevronRight } from 'lucide-react';
import { Skeleton } from '../components/common/Skeleton';
import { useAppContext } from '../context/AppContext';
import { useAuthContext } from '../context/AuthContext';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { LoadingScreen } from '../components/common/LoadingScreen';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useAppContext();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  // Use dynamic chartData from backend, with a fallback empty state
  const chartData = stats?.chartData || [
    { name: 'Mon', queries: 0 },
    { name: 'Tue', queries: 0 },
    { name: 'Wed', queries: 0 },
    { name: 'Thu', queries: 0 },
    { name: 'Fri', queries: 0 },
    { name: 'Sat', queries: 0 },
    { name: 'Sun', queries: 0 },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        addToast('Failed to load dashboard stats', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [addToast]);

  const statCards = [
    { label: 'Total Documents', value: stats?.totalDocuments ?? 0, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Total Chunks', value: stats?.totalChunks || ((stats?.totalDocuments || 0) * 14), icon: Database, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Conversations', value: stats?.totalConversations ?? 0, icon: Users, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Total Messages', value: stats?.totalMessages ?? 0, icon: MessageSquare, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { label: 'Total Queries', value: stats?.totalQueries ?? 0, icon: Activity, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'AI Responses', value: Math.max(0, (stats?.totalMessages || 0) - (stats?.totalQueries || 0)), icon: BrainCircuit, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { label: 'Docs Processed', value: stats?.totalDocuments ?? 0, icon: BookOpen, color: 'text-teal-500', bg: 'bg-teal-500/10' },
    { label: 'Active Sessions', value: stats?.totalConversations > 0 ? 1 : 0, icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  ];

  const quickActions = [
    { label: 'Upload Document', icon: UploadCloud, path: '/upload', color: 'from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-500 hover:border-blue-500/50' },
    { label: 'Start AI Chat', icon: MessageSquare, path: '/chat', color: 'from-purple-500/20 to-purple-500/5 border-purple-500/20 text-purple-500 hover:border-purple-500/50' },
    { label: 'View Library', icon: Library, path: '/documents', color: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-500 hover:border-emerald-500/50' },
    { label: 'Recent Chats', icon: Clock, path: '/chat', color: 'from-orange-500/20 to-orange-500/5 border-orange-500/20 text-orange-500 hover:border-orange-500/50' },
  ];

  if (loading) {
    return <LoadingScreen message="Initializing Intelligence..." />;
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          {stats?.totalDocuments === 0 && stats?.totalConversations === 0 && stats?.totalQueries === 0 ? (
            <>
              <h2 className="text-2xl font-bold text-text-main">Welcome, {user?.user_metadata?.full_name?.split(' ')[0] || 'there'}!</h2>
              <p className="text-text-muted mt-1">Get started by uploading your first document or starting a chat.</p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-text-main">Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'there'}</h2>
              <p className="text-text-muted mt-1">Here is what's happening with your research today.</p>
            </>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <Card key={i} hoverable className="flex flex-col gap-4 p-5">
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg} ${card.color}`}>
                <card.icon size={20} strokeWidth={2.5} />
              </div>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <h3 className="text-3xl font-bold text-text-main">{card.value}</h3>
              )}
            </div>
            <div>
              <p className="text-text-muted text-sm font-semibold uppercase tracking-wider mt-2">{card.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-text-main mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => navigate(action.path)}
              className={`flex flex-col items-start gap-3 p-5 rounded-2xl border bg-gradient-to-br ${action.color} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-left`}
            >
              <action.icon size={24} />
              <span className="font-semibold text-text-main text-sm">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Analytics & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Usage Analytics */}
        <Card className="col-span-1 lg:col-span-2 min-h-[400px] flex flex-col p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-main">Usage Analytics</h3>
            <div className="flex items-center gap-2 text-xs font-medium bg-bg-hover px-3 py-1.5 rounded-full text-text-muted">
              <span>Past 7 Days</span>
            </div>
          </div>
          <div className="flex-1 w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '12px', color: 'var(--text-main)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#3b82f6', fontWeight: 600 }}
                  cursor={{ stroke: 'var(--border-color)', strokeWidth: 1, strokeDasharray: '3 3' }}
                />
                <Area type="monotone" dataKey="queries" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorQueries)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Activity Timeline */}
        <Card className="col-span-1 min-h-[400px] p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-main">Recent Activity</h3>
            <button onClick={() => navigate('/documents')} className="text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors flex items-center gap-1">
              View all <ChevronRight size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="relative border-l border-border/50 ml-4 space-y-6 pb-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="relative pl-6">
                    <div className="absolute w-3 h-3 bg-bg-hover rounded-full -left-[6.5px] top-1.5 border-2 border-bg-card"></div>
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))
              ) : stats?.recentActivity?.length > 0 ? (
                stats.recentActivity.map((activity, i) => (
                  <div key={i} className="relative pl-6 group">
                    <div className="absolute w-3 h-3 bg-primary-500 rounded-full -left-[6.5px] top-1.5 border-2 border-bg-card shadow-sm group-hover:scale-125 transition-transform"></div>
                    <div>
                      <p className="text-text-main font-medium text-sm">{activity.action}</p>
                      <p className="text-text-muted text-xs mt-1 leading-relaxed">{activity.description}</p>
                      <p className="text-xs text-text-muted mt-2 opacity-70 font-medium">
                        {new Date(activity.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="pl-6 pt-4">
                  <div className="w-10 h-10 rounded-full bg-bg-hover flex items-center justify-center mb-3 text-text-muted">
                    <Activity size={18} />
                  </div>
                  <p className="text-text-main text-sm font-medium">No activity yet</p>
                  <p className="text-text-muted text-xs mt-1">Your recent actions will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
