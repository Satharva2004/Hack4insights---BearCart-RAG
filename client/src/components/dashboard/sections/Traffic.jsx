import { Users, Monitor, Smartphone, TrendingUp, MousePointer, BarChart3, RefreshCw } from 'lucide-react';
import KpiCard from '../KpiCard';
import TrafficChart from '../charts/TrafficChart';
import { formatNumber, formatPercentage } from '@/utils/dataCleaners';

const TrafficSection = ({ sessions, pageviews }) => {
  // Calculate metrics
  const calculateMetrics = () => {
    // Total sessions
    const totalSessions = sessions.length;
    
    // Unique users
    const uniqueUsers = new Set(sessions.map(s => s.user_id)).size;
    
    // Device breakdown
    const deviceCounts = sessions.reduce((acc, session) => {
      const device = session.device_type?.toLowerCase() || 'unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {});
    
    // New vs Returning
    const newSessions = sessions.filter(s => s.is_repeat_session === "0").length;
    const returningSessions = sessions.filter(s => s.is_repeat_session === "1").length;
    
    // Bounce rate calculation (sessions with only 1 pageview)
    const sessionPageviewCounts = pageviews.reduce((acc, pv) => {
      acc[pv.website_session_id] = (acc[pv.website_session_id] || 0) + 1;
      return acc;
    }, {});
    
    const bouncedSessions = Object.values(sessionPageviewCounts).filter(count => count === 1).length;
    const bounceRate = totalSessions > 0 ? (bouncedSessions / totalSessions) * 100 : 0;
    
    // Average pages per session
    const avgPagesPerSession = totalSessions > 0 ? pageviews.length / totalSessions : 0;
    
    // Traffic by source
    const trafficBySource = sessions.reduce((acc, session) => {
      const source = session.utm_source || 'direct';
      if (!acc[source]) {
        acc[source] = { source, sessions: 0, users: new Set() };
      }
      acc[source].sessions += 1;
      acc[source].users.add(session.user_id);
      return acc;
    }, {});
    
    const sourceData = Object.values(trafficBySource).map(item => ({
      source: item.source,
      sessions: item.sessions,
      users: item.users.size
    }));
    
    // Traffic by campaign
    const trafficByCampaign = sessions.reduce((acc, session) => {
      const campaign = session.utm_campaign || 'none';
      if (!acc[campaign]) {
        acc[campaign] = { campaign, sessions: 0 };
      }
      acc[campaign].sessions += 1;
      return acc;
    }, {});
    
    const campaignData = Object.values(trafficByCampaign);
    
    // Traffic over time (by day)
    const trafficByDate = sessions.reduce((acc, session) => {
      const date = session.created_at.split(' ')[0];
      if (!acc[date]) {
        acc[date] = { date, sessions: 0, desktop: 0, mobile: 0 };
      }
      acc[date].sessions += 1;
      if (session.device_type?.toLowerCase() === 'desktop') {
        acc[date].desktop += 1;
      } else if (session.device_type?.toLowerCase() === 'mobile') {
        acc[date].mobile += 1;
      }
      return acc;
    }, {});
    
    const timelineData = Object.values(trafficByDate).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    // Top landing pages
    const landingPages = pageviews.reduce((acc, pv) => {
      // Get first pageview for each session
      if (!acc.sessions[pv.website_session_id]) {
        acc.sessions[pv.website_session_id] = true;
        const url = pv.pageview_url || '/';
        acc.pages[url] = (acc.pages[url] || 0) + 1;
      }
      return acc;
    }, { sessions: {}, pages: {} });
    
    const topLandingPages = Object.entries(landingPages.pages)
      .map(([url, count]) => ({ url, sessions: count }))
      .sort((a, b) => b.sessions - a.sessions);
    
    return {
      totalSessions,
      uniqueUsers,
      bounceRate,
      avgPagesPerSession,
      deviceCounts,
      newSessions,
      returningSessions,
      sourceData,
      campaignData,
      timelineData,
      topLandingPages
    };
  };
  
  const metrics = calculateMetrics();
  
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold font-display text-foreground">Traffic & Analysis</h1>
        <p className="text-muted-foreground mt-1">Monitor website traffic and user behavior</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Sessions"
          value={formatNumber(metrics.totalSessions)}
          change={5.2}
          changeLabel="vs last period"
          trend="up"
          icon={<MousePointer className="w-4 h-4" />}
        />
        <KpiCard
          title="Unique Users"
          value={formatNumber(metrics.uniqueUsers)}
          change={3.8}
          changeLabel="vs last period"
          trend="up"
          icon={<Users className="w-4 h-4" />}
        />
        <KpiCard
          title="Bounce Rate"
          value={formatPercentage(metrics.bounceRate)}
          change={-1.5}
          changeLabel="vs last period"
          trend="up"
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <KpiCard
          title="Avg Pages/Session"
          value={metrics.avgPagesPerSession.toFixed(2)}
          change={2.1}
          changeLabel="vs last period"
          trend="up"
          icon={<BarChart3 className="w-4 h-4" />}
        />
      </div>

      {/* Secondary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          title="Desktop Sessions"
          value={formatNumber(metrics.deviceCounts.desktop || 0)}
          change={1.2}
          changeLabel="vs last period"
          trend="neutral"
          icon={<Monitor className="w-4 h-4" />}
        />
        <KpiCard
          title="Mobile Sessions"
          value={formatNumber(metrics.deviceCounts.mobile || 0)}
          change={8.5}
          changeLabel="vs last period"
          trend="up"
          icon={<Smartphone className="w-4 h-4" />}
        />
        <KpiCard
          title="Returning Visitors"
          value={formatPercentage((metrics.returningSessions / metrics.totalSessions) * 100)}
          change={4.3}
          changeLabel="vs last period"
          trend="up"
          icon={<RefreshCw className="w-4 h-4" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrafficChart 
          type="timeline" 
          data={metrics.timelineData} 
          title="Traffic Over Time"
        />
        <TrafficChart 
          type="source" 
          data={metrics.sourceData} 
          title="Traffic by Source"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrafficChart 
          type="device" 
          data={[
            { device: 'Desktop', sessions: metrics.deviceCounts.desktop || 0 },
            { device: 'Mobile', sessions: metrics.deviceCounts.mobile || 0 }
          ]} 
          title="Device Breakdown"
        />
        <TrafficChart 
          type="campaign" 
          data={metrics.campaignData.slice(0, 5)} 
          title="Top Campaigns"
        />
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources Table */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold font-display text-foreground mb-6">Traffic Sources</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Source</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Sessions</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Users</th>
                </tr>
              </thead>
              <tbody>
                {metrics.sourceData
                  .sort((a, b) => b.sessions - a.sessions)
                  .slice(0, 5)
                  .map((item, index) => (
                    <tr key={index} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-4 text-sm text-foreground font-medium">{item.source}</td>
                      <td className="py-3 px-4 text-sm text-foreground text-right">{formatNumber(item.sessions)}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground text-right">{formatNumber(item.users)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Landing Pages Table */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold font-display text-foreground mb-6">Top Landing Pages</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Page URL</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Sessions</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">%</th>
                </tr>
              </thead>
              <tbody>
                {metrics.topLandingPages
                  .slice(0, 5)
                  .map((item, index) => (
                    <tr key={index} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-4 text-sm text-foreground font-mono">{item.url}</td>
                      <td className="py-3 px-4 text-sm text-foreground text-right">{formatNumber(item.sessions)}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground text-right">
                        {formatPercentage((item.sessions / metrics.totalSessions) * 100)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficSection;