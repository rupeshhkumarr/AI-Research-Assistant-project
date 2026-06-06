import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { getDashboardStats } from '../services/dashboardService';
import { FileText, Database, MessageSquare, Users, Clock } from 'lucide-react';
import { Skeleton } from '../components/common/Skeleton';
import { useAppContext } from '../context/AppContext';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useAppContext();

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
    { label: 'Total Documents', value: stats?.totalDocuments ?? 0, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Total Chunks', value: stats?.totalChunks ?? 0, icon: Database, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Total Conversations', value: stats?.totalConversations ?? 0, icon: Users, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'Total Messages', value: stats?.totalMessages ?? 0, icon: MessageSquare, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { label: 'Total Queries', value: stats?.totalQueries ?? 0, icon: MessageSquare, color: 'text-green-400', bg: 'bg-green-500/10' },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {statCards.map((card, i) => (
          <Card key={i} className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${card.bg} ${card.color}`}>
              <card.icon size={28} />
            </div>
            <div>
              <p className="text-text-muted text-sm font-medium">{card.label}</p>
              {loading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <h3 className="text-3xl font-bold text-text-main mt-1">{card.value}</h3>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2 min-h-[400px] flex flex-col">
          <h3 className="text-lg font-semibold text-text-main mb-6">Usage Overview</h3>
          <div className="flex-1 w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-main)' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Area type="monotone" dataKey="queries" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorQueries)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card className="min-h-[400px]">
          <h3 className="text-lg font-semibold text-text-main mb-6">Recent Activity</h3>
          <div className="flex flex-col gap-4">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                  <div className="flex flex-col gap-2 w-full">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            ) : stats?.recentActivity?.length > 0 ? (
              stats.recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-bg-hover/30 border border-border/50">
                  <div className="w-10 h-10 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-text-main font-medium">{activity.action}</p>
                    <p className="text-text-muted text-sm">{activity.description}</p>
                    <p className="text-xs text-text-muted mt-1 opacity-70">{new Date(activity.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-text-muted text-sm text-center mt-4">No recent activity.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
