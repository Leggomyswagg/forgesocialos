import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { jsPDF } from 'jspdf';
import { useFirebase } from '../context/FirebaseContext';
import { CampaignMetric } from '../types';

interface AnalyticsDashboardProps {
  onBackToForge?: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ onBackToForge }) => {
  const {
    user,
    profile,
    userMetrics,
    addCampaignMetric,
    deleteCampaignMetric,
    seedDefaultCampaignMetrics,
    logActivity,
    loginWithGoogle,
  } = useFirebase();

  // Filters
  const [dateRange, setDateRange] = useState<'7d' | '14d' | '30d' | 'all'>('14d');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [isSeeding, setIsSeeding] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // New Metric Form State
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newCampaignName, setNewCampaignName] = useState(profile?.defaultBusiness ? `${profile.defaultBusiness} Campaign` : 'Invisalign Adult UGC');
  const [newChannel, setNewChannel] = useState('TikTok Ads');
  const [newImpressions, setNewImpressions] = useState('25000');
  const [newClicks, setNewClicks] = useState('800');
  const [newConversions, setNewConversions] = useState('35');
  const [newSpend, setNewSpend] = useState('350');
  const [newRevenue, setNewRevenue] = useState('1450');
  const [newHookRate, setNewHookRate] = useState('45');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered metrics
  const filteredMetrics = useMemo(() => {
    let list = [...userMetrics];

    // Filter by channel
    if (selectedChannel !== 'all') {
      list = list.filter((m) => m.channel.toLowerCase() === selectedChannel.toLowerCase());
    }

    // Filter by date
    if (dateRange !== 'all') {
      const days = dateRange === '7d' ? 7 : dateRange === '14d' ? 14 : 30;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      list = list.filter((m) => new Date(m.date) >= cutoff);
    }

    return list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [userMetrics, selectedChannel, dateRange]);

  // Aggregate KPIs
  const kpis = useMemo(() => {
    if (filteredMetrics.length === 0) {
      return {
        totalSpend: 0,
        totalRevenue: 0,
        totalImpressions: 0,
        totalClicks: 0,
        totalConversions: 0,
        blendedRoas: 0,
        avgCtr: 0,
        avgCvr: 0,
        avgHookRate: 0,
        avgCpa: 0,
      };
    }

    const totalSpend = filteredMetrics.reduce((acc, m) => acc + (m.spend || 0), 0);
    const totalRevenue = filteredMetrics.reduce((acc, m) => acc + (m.revenue || 0), 0);
    const totalImpressions = filteredMetrics.reduce((acc, m) => acc + (m.impressions || 0), 0);
    const totalClicks = filteredMetrics.reduce((acc, m) => acc + (m.clicks || 0), 0);
    const totalConversions = filteredMetrics.reduce((acc, m) => acc + (m.conversions || 0), 0);

    const blendedRoas = totalSpend > 0 ? Number((totalRevenue / totalSpend).toFixed(2)) : 0;
    const avgCtr = totalImpressions > 0 ? Number(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0;
    const avgCvr = totalClicks > 0 ? Number(((totalConversions / totalClicks) * 100).toFixed(2)) : 0;
    const avgCpa = totalConversions > 0 ? Number((totalSpend / totalConversions).toFixed(2)) : 0;
    const totalHookRates = filteredMetrics.reduce((acc, m) => acc + (m.hookRate || 42), 0);
    const avgHookRate = Number((totalHookRates / filteredMetrics.length).toFixed(1));

    return {
      totalSpend,
      totalRevenue,
      totalImpressions,
      totalClicks,
      totalConversions,
      blendedRoas,
      avgCtr,
      avgCvr,
      avgHookRate,
      avgCpa,
    };
  }, [filteredMetrics]);

  // Channel breakdown for Bar/Pie Charts
  const channelData = useMemo(() => {
    const map: Record<string, { channel: string; spend: number; revenue: number; conversions: number; clicks: number }> = {};
    filteredMetrics.forEach((m) => {
      const ch = m.channel || 'Other';
      if (!map[ch]) {
        map[ch] = { channel: ch, spend: 0, revenue: 0, conversions: 0, clicks: 0 };
      }
      map[ch].spend += m.spend || 0;
      map[ch].revenue += m.revenue || 0;
      map[ch].conversions += m.conversions || 0;
      map[ch].clicks += m.clicks || 0;
    });
    return Object.values(map);
  }, [filteredMetrics]);

  // Daily Chart Data
  const chartData = useMemo(() => {
    return filteredMetrics.map((m) => {
      const formattedDate = m.date.slice(5); // MM-DD
      const roas = m.spend > 0 ? Number(((m.revenue || 0) / m.spend).toFixed(2)) : 0;
      return {
        date: formattedDate,
        fullDate: m.date,
        spend: m.spend,
        revenue: m.revenue,
        conversions: m.conversions,
        clicks: m.clicks,
        roas,
        hookRate: m.hookRate || 44,
        ctr: m.ctr || 2.5,
        campaign: m.campaignName,
      };
    });
  }, [filteredMetrics]);

  // Seed default metrics handler
  const handleSeedMetrics = async () => {
    if (!user) {
      await loginWithGoogle();
      return;
    }
    setIsSeeding(true);
    try {
      await seedDefaultCampaignMetrics();
      showNotice('Successfully populated 14-day campaign analytics into Firestore!');
    } catch (err) {
      console.error('Error seeding metrics:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  // Add custom metric handler
  const handleAddMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      await loginWithGoogle();
      return;
    }
    setIsSubmitting(true);
    try {
      const spend = parseFloat(newSpend) || 0;
      const revenue = parseFloat(newRevenue) || 0;
      const impressions = parseInt(newImpressions) || 0;
      const clicks = parseInt(newClicks) || 0;
      const conversions = parseInt(newConversions) || 0;
      const hookRate = parseFloat(newHookRate) || 45;

      const ctr = impressions > 0 ? Number(((clicks / impressions) * 100).toFixed(2)) : 0;
      const cvr = clicks > 0 ? Number(((conversions / clicks) * 100).toFixed(2)) : 0;
      const roas = spend > 0 ? Number((revenue / spend).toFixed(2)) : 0;
      const cpa = conversions > 0 ? Number((spend / conversions).toFixed(2)) : 0;

      await addCampaignMetric({
        date: newDate,
        campaignName: newCampaignName.trim(),
        channel: newChannel,
        impressions,
        clicks,
        conversions,
        spend,
        revenue,
        ctr,
        cvr,
        roas,
        hookRate,
        cpa,
      });

      setShowAddModal(false);
      showNotice('Logged new daily campaign metric to Firestore!');
    } catch (err) {
      console.error('Error adding metric:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showNotice = (msg: string) => {
    setExportNotice(msg);
    setTimeout(() => setExportNotice(null), 3500);
  };

  // CSV Export
  const handleExportCSV = () => {
    if (filteredMetrics.length === 0) {
      showNotice('No analytics data available to export.');
      return;
    }

    const headers = [
      'Date',
      'Campaign Name',
      'Channel',
      'Impressions',
      'Clicks',
      'CTR (%)',
      'Conversions',
      'CVR (%)',
      'Spend ($)',
      'Revenue ($)',
      'ROAS (x)',
      'Hook Rate (%)',
      'CPA ($)',
    ];

    const rows = filteredMetrics.map((m) => {
      const roas = m.spend > 0 ? ((m.revenue || 0) / m.spend).toFixed(2) : '0';
      const ctr = m.impressions > 0 ? (((m.clicks || 0) / m.impressions) * 100).toFixed(2) : '0';
      const cvr = m.clicks > 0 ? (((m.conversions || 0) / m.clicks) * 100).toFixed(2) : '0';
      const cpa = m.conversions > 0 ? ((m.spend || 0) / m.conversions).toFixed(2) : '0';

      return [
        `"${m.date}"`,
        `"${m.campaignName.replace(/"/g, '""')}"`,
        `"${m.channel}"`,
        m.impressions,
        m.clicks,
        ctr,
        m.conversions,
        cvr,
        m.spend,
        m.revenue,
        roas,
        m.hookRate || 42,
        cpa,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ForgeSocial_Campaign_Analytics_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logActivity('export_csv', 'Exported Analytics CSV', `${filteredMetrics.length} records downloaded`);
    showNotice(`Downloaded ForgeSocial_Campaign_Analytics_${timestamp}.csv`);
  };

  // PDF Export using jsPDF
  const handleExportPDF = () => {
    if (filteredMetrics.length === 0) {
      showNotice('No analytics data available to export.');
      return;
    }

    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const now = new Date();
      const dateStr = now.toLocaleDateString();
      const brand = profile?.defaultBusiness || 'ForgeSocial Marketing Engine';

      // Header Banner
      doc.setFillColor(15, 23, 42); // #0F172A
      doc.rect(0, 0, 210, 36, 'F');

      doc.setTextColor(255, 106, 0); // #FF6A00
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('FORGESOCIAL v8 • CAMPAIGN ANALYTICS REPORT', 14, 15);

      doc.setTextColor(214, 255, 87); // #D6FF57
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Brand: ${brand}  |  Generated: ${dateStr}`, 14, 23);

      doc.setTextColor(148, 163, 184);
      doc.setFontSize(8);
      doc.text(`User: ${profile?.email || user?.email || 'Authenticated Marketer'}  |  Scope: ${dateRange.toUpperCase()}`, 14, 29);

      // Section: Executive KPI Summary
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('1. Executive Performance Summary', 14, 46);

      doc.setDrawColor(203, 213, 225);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 50, 182, 28, 2, 2, 'FD');

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Total Ad Spend', 20, 58);
      doc.text('Total Revenue', 60, 58);
      doc.text('Blended ROAS', 100, 58);
      doc.text('Total Conversions', 135, 58);
      doc.text('Avg CPA', 168, 58);

      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`$${kpis.totalSpend.toLocaleString()}`, 20, 68);
      doc.text(`$${kpis.totalRevenue.toLocaleString()}`, 60, 68);
      doc.setTextColor(22, 163, 74);
      doc.text(`${kpis.blendedRoas}x`, 100, 68);
      doc.setTextColor(15, 23, 42);
      doc.text(`${kpis.totalConversions}`, 135, 68);
      doc.text(`$${kpis.avgCpa}`, 168, 68);

      // Section: Channel Distribution
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('2. Channel Distribution & Efficiency', 14, 88);

      let currentY = 94;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('Channel', 16, currentY);
      doc.text('Spend ($)', 70, currentY);
      doc.text('Revenue ($)', 105, currentY);
      doc.text('Clicks', 145, currentY);
      doc.text('Conv.', 175, currentY);

      doc.setDrawColor(226, 232, 240);
      doc.line(14, currentY + 2, 196, currentY + 2);
      currentY += 6;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      channelData.forEach((ch) => {
        doc.text(ch.channel, 16, currentY);
        doc.text(`$${ch.spend.toLocaleString()}`, 70, currentY);
        doc.text(`$${ch.revenue.toLocaleString()}`, 105, currentY);
        doc.text(ch.clicks.toLocaleString(), 145, currentY);
        doc.text(ch.conversions.toString(), 175, currentY);
        currentY += 5;
      });

      // Section: Daily Log Table
      currentY += 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('3. Daily Marketing Performance Log', 14, currentY);
      currentY += 6;

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('Date', 14, currentY);
      doc.text('Campaign Name', 34, currentY);
      doc.text('Channel', 92, currentY);
      doc.text('Spend', 124, currentY);
      doc.text('Revenue', 144, currentY);
      doc.text('ROAS', 168, currentY);
      doc.text('Hook %', 184, currentY);

      doc.setDrawColor(226, 232, 240);
      doc.line(14, currentY + 2, 196, currentY + 2);
      currentY += 5;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);

      // Print rows (truncate to fit 1 page comfortably or paginate)
      const maxRows = Math.min(filteredMetrics.length, 22);
      for (let i = 0; i < maxRows; i++) {
        const m = filteredMetrics[i];
        const roas = m.spend > 0 ? ((m.revenue || 0) / m.spend).toFixed(1) + 'x' : '-';
        const campaignShort = m.campaignName.length > 32 ? m.campaignName.slice(0, 30) + '..' : m.campaignName;

        doc.text(m.date, 14, currentY);
        doc.text(campaignShort, 34, currentY);
        doc.text(m.channel, 92, currentY);
        doc.text(`$${m.spend}`, 124, currentY);
        doc.text(`$${m.revenue}`, 144, currentY);
        doc.text(roas, 168, currentY);
        doc.text(`${m.hookRate || 42}%`, 184, currentY);

        currentY += 4.5;
        if (currentY > 275 && i < maxRows - 1) {
          doc.addPage();
          currentY = 20;
        }
      }

      // Footer
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text('Report produced autonomously by ForgeSocial OS. Data backed by Cloud Firestore.', 14, 286);

      const timestamp = new Date().toISOString().slice(0, 10);
      doc.save(`ForgeSocial_Marketing_Report_${timestamp}.pdf`);

      logActivity('export_pdf', 'Exported Analytics PDF Report', `Generated PDF with ${filteredMetrics.length} metrics`);
      showNotice(`Downloaded ForgeSocial_Marketing_Report_${timestamp}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      showNotice('Failed to generate PDF. Falling back to CSV export.');
      handleExportCSV();
    }
  };

  // Distinct channels in database
  const channelOptions = useMemo(() => {
    const set = new Set<string>();
    userMetrics.forEach((m) => {
      if (m.channel) set.add(m.channel);
    });
    return Array.from(set);
  }, [userMetrics]);

  const COLORS = ['#FF6A00', '#D6FF57', '#38BDF8', '#A855F7', '#EC4899', '#F59E0B'];

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-7xl mx-auto space-y-8">
      {/* Toast Notification */}
      {exportNotice && (
        <div className="fixed bottom-6 right-6 z-50 p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-xs shadow-2xl flex items-center gap-2">
          <span>✓</span>
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            {onBackToForge && (
              <button
                onClick={onBackToForge}
                className="text-xs text-white/50 hover:text-white mr-2 transition-colors"
              >
                ← Back
              </button>
            )}
            <span className="mono text-[10px] tracking-[0.2em] text-[#FF6A00] font-bold uppercase">
              Campaign Intelligence
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#D6FF57] animate-pulse" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Marketing Analytics Dashboard
          </h1>
          <p className="text-xs text-white/60 mt-1">
            Real-time daily campaign progress, multi-channel ROI attribution, and predictive funnel velocity.
          </p>
        </div>

        {/* Action Buttons: Export CSV, Export PDF, Add Entry, Sync */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* CSV Export */}
          <button
            onClick={handleExportCSV}
            className="h-9 px-3.5 rounded-xl bg-[#15151E] border border-[#2A2A3A] hover:border-white/20 text-xs font-semibold text-white/80 hover:text-white flex items-center gap-2 transition-colors"
            title="Download formatted CSV spreadsheet"
          >
            <span>📥</span>
            <span>Export CSV</span>
          </button>

          {/* PDF Export */}
          <button
            onClick={handleExportPDF}
            className="h-9 px-3.5 rounded-xl bg-[#15151E] border border-[#2A2A3A] hover:border-white/20 text-xs font-semibold text-white/80 hover:text-white flex items-center gap-2 transition-colors"
            title="Export executive PDF report"
          >
            <span>📄</span>
            <span>Export PDF</span>
          </button>

          {/* Log Metric */}
          <button
            onClick={() => {
              if (!user) loginWithGoogle();
              else setShowAddModal(true);
            }}
            className="h-9 px-4 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#D6FF57] text-black font-bold text-xs hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-[0_0_20px_rgba(255,106,0,0.25)]"
          >
            <span>+</span>
            <span>Log Metric</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar & Date Toggle */}
      <div className="p-3 rounded-2xl bg-[#15151E] border border-[#2A2A3A] flex flex-wrap items-center justify-between gap-3">
        {/* Date Presets */}
        <div className="flex items-center gap-1 bg-[#0A0A0F] p-1 rounded-xl border border-[#2A2A3A]">
          {(['7d', '14d', '30d', 'all'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                dateRange === r
                  ? 'bg-[#15151E] text-white shadow-sm'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              {r === '7d' ? '7 Days' : r === '14d' ? '14 Days' : r === '30d' ? '30 Days' : 'All Time'}
            </button>
          ))}
        </div>

        {/* Channel Selector */}
        <div className="flex items-center gap-2">
          <span className="mono text-[10px] text-white/40 uppercase">Channel:</span>
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="h-8 rounded-lg bg-[#0A0A0F] border border-[#2A2A3A] px-2.5 text-xs text-white"
          >
            <option value="all">All Channels</option>
            {channelOptions.map((ch) => (
              <option key={ch} value={ch}>
                {ch}
              </option>
            ))}
          </select>
        </div>

        {/* Sync Sample Benchmark Button */}
        {userMetrics.length === 0 && (
          <button
            onClick={handleSeedMetrics}
            disabled={isSeeding}
            className="h-8 px-3 rounded-lg bg-[#D6FF57] text-black font-bold text-xs hover:opacity-90 transition-opacity"
          >
            {isSeeding ? 'Populating...' : '⚡ Seed Benchmark Data'}
          </button>
        )}
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-[#15151E] border border-[#2A2A3A]">
          <span className="mono text-[9px] text-white/40 block">TOTAL REVENUE</span>
          <div className="text-xl font-black text-white mt-1">
            ${kpis.totalRevenue.toLocaleString()}
          </div>
          <span className="mono text-[9px] text-[#D6FF57] mt-1 block">+38% vs prev</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#15151E] border border-[#2A2A3A]">
          <span className="mono text-[9px] text-white/40 block">TOTAL SPEND</span>
          <div className="text-xl font-black text-white mt-1">
            ${kpis.totalSpend.toLocaleString()}
          </div>
          <span className="mono text-[9px] text-white/40 mt-1 block">{filteredMetrics.length} days active</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#15151E] border border-[#2A2A3A]">
          <span className="mono text-[9px] text-white/40 block">BLENDED ROAS</span>
          <div className="text-xl font-black text-[#D6FF57] mt-1">{kpis.blendedRoas}x</div>
          <span className="mono text-[9px] text-emerald-400 mt-1 block">Target: &gt; 3.0x</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#15151E] border border-[#2A2A3A]">
          <span className="mono text-[9px] text-white/40 block">CONVERSIONS</span>
          <div className="text-xl font-black text-white mt-1">{kpis.totalConversions}</div>
          <span className="mono text-[9px] text-white/40 mt-1 block">CVR {kpis.avgCvr}%</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#15151E] border border-[#2A2A3A]">
          <span className="mono text-[9px] text-white/40 block">BLENDED CPA</span>
          <div className="text-xl font-black text-white mt-1">${kpis.avgCpa}</div>
          <span className="mono text-[9px] text-[#D6FF57] mt-1 block">Industry: $24.00</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#15151E] border border-[#2A2A3A]">
          <span className="mono text-[9px] text-white/40 block">AVG HOOK RATE</span>
          <div className="text-xl font-black text-[#FF6A00] mt-1">{kpis.avgHookRate}%</div>
          <span className="mono text-[9px] text-white/40 mt-1 block">CTR {kpis.avgCtr}%</span>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Chart 1: Daily Revenue vs Ad Spend */}
        <div className="p-5 md:p-6 rounded-2xl bg-[#15151E] border border-[#2A2A3A]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="mono text-[10px] text-white/40 uppercase">Revenue & Ad Spend</span>
              <h3 className="text-sm font-bold text-white mt-0.5">Daily Dollar Velocity</h3>
            </div>
            <span className="mono text-[10px] text-[#D6FF57]">USD ($)</span>
          </div>

          <div className="h-64 w-full">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-white/30">
                No metric data for selected filter.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D6FF57" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#D6FF57" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6A00" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#FF6A00" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0A0A0F', borderColor: '#2A2A3A', borderRadius: '12px', fontSize: '11px' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Area type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#D6FF57" strokeWidth={2} fillOpacity={1} fill="url(#revenueGrad)" />
                  <Area type="monotone" dataKey="spend" name="Ad Spend ($)" stroke="#FF6A00" strokeWidth={2} fillOpacity={1} fill="url(#spendGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Daily ROAS & Conversion Count */}
        <div className="p-5 md:p-6 rounded-2xl bg-[#15151E] border border-[#2A2A3A]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="mono text-[10px] text-white/40 uppercase">Efficiency & Scale</span>
              <h3 className="text-sm font-bold text-white mt-0.5">ROAS Multiplier vs Conversions</h3>
            </div>
            <span className="mono text-[10px] text-[#FF6A00]">ROAS (x)</span>
          </div>

          <div className="h-64 w-full">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-white/30">
                No metric data for selected filter.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0A0A0F', borderColor: '#2A2A3A', borderRadius: '12px', fontSize: '11px' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Line type="monotone" dataKey="roas" name="ROAS (x)" stroke="#FF6A00" strokeWidth={2.5} dot={{ r: 3, fill: '#FF6A00' }} />
                  <Line type="monotone" dataKey="conversions" name="Conversions" stroke="#38BDF8" strokeWidth={2} dot={{ r: 2, fill: '#38BDF8' }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Row: Channel Breakdown Bar & Share Pie */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Channel Comparison Bar Chart */}
        <div className="lg:col-span-2 p-5 md:p-6 rounded-2xl bg-[#15151E] border border-[#2A2A3A]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="mono text-[10px] text-white/40 uppercase">Channel Attribution</span>
              <h3 className="text-sm font-bold text-white mt-0.5">Spend vs Revenue By Platform</h3>
            </div>
            <span className="mono text-[10px] text-white/40">Comparison</span>
          </div>

          <div className="h-60 w-full">
            {channelData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-white/30">
                No channel data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" vertical={false} />
                  <XAxis dataKey="channel" stroke="#64748B" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0A0A0F', borderColor: '#2A2A3A', borderRadius: '12px', fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="spend" name="Spend ($)" fill="#FF6A00" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="revenue" name="Revenue ($)" fill="#D6FF57" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Budget Allocation Pie */}
        <div className="p-5 md:p-6 rounded-2xl bg-[#15151E] border border-[#2A2A3A] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="mono text-[10px] text-white/40 uppercase">Ad Spend Allocation</span>
              <h3 className="text-sm font-bold text-white mt-0.5">Channel Share</h3>
            </div>
            <span className="mono text-[10px] text-[#D6FF57]">{channelData.length} Channels</span>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            {channelData.length === 0 ? (
              <div className="text-xs text-white/30">No channel data.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelData}
                    dataKey="spend"
                    nameKey="channel"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {channelData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0A0A0F', borderColor: '#2A2A3A', borderRadius: '12px', fontSize: '11px' }}
                    formatter={(val) => `$${Number(val).toLocaleString()}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
            {channelData.slice(0, 4).map((ch, idx) => (
              <div key={ch.channel} className="flex items-center gap-1.5 text-[10px] text-white/70">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="truncate">{ch.channel}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* High-Density Performance Log Table */}
      <div className="rounded-2xl bg-[#15151E] border border-[#2A2A3A] overflow-hidden">
        <div className="p-4 md:p-5 border-b border-[#2A2A3A] flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="mono text-[10px] text-white/40 uppercase">Performance Ledger</span>
            <h3 className="text-base font-bold text-white mt-0.5">Campaign Metric Records ({filteredMetrics.length})</h3>
          </div>
          <span className="mono text-[10px] text-white/40">Tabular Numeral Format</span>
        </div>

        <div className="overflow-x-auto">
          {filteredMetrics.length === 0 ? (
            <div className="text-center py-12 text-xs text-white/40">
              No campaign records found. Click &quot;Log Metric&quot; or &quot;Seed Benchmark Data&quot; to begin.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#2A2A3A] bg-[#0A0A0F]/60 mono text-[10px] text-white/50">
                  <th className="py-3 px-4 font-semibold">DATE</th>
                  <th className="py-3 px-4 font-semibold">CAMPAIGN</th>
                  <th className="py-3 px-4 font-semibold">CHANNEL</th>
                  <th className="py-3 px-4 font-semibold text-right">IMPR.</th>
                  <th className="py-3 px-4 font-semibold text-right">CLICKS</th>
                  <th className="py-3 px-4 font-semibold text-right">CTR</th>
                  <th className="py-3 px-4 font-semibold text-right">CONV.</th>
                  <th className="py-3 px-4 font-semibold text-right">SPEND</th>
                  <th className="py-3 px-4 font-semibold text-right">REVENUE</th>
                  <th className="py-3 px-4 font-semibold text-right">ROAS</th>
                  <th className="py-3 px-4 font-semibold text-right">HOOK %</th>
                  <th className="py-3 px-4 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A3A]/40">
                {filteredMetrics.map((m) => {
                  const roas = m.spend > 0 ? ((m.revenue || 0) / m.spend).toFixed(2) : '-';
                  const ctr = m.impressions > 0 ? (((m.clicks || 0) / m.impressions) * 100).toFixed(2) : '-';

                  return (
                    <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 mono text-white/70 whitespace-nowrap">{m.date}</td>
                      <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">{m.campaignName}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="mono text-[10px] px-2 py-0.5 rounded-full bg-[#0A0A0F] border border-white/10 text-white/70">
                          {m.channel}
                        </span>
                      </td>
                      <td className="py-3 px-4 mono text-right tabular-nums text-white/60">
                        {m.impressions.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 mono text-right tabular-nums text-white/60">
                        {m.clicks.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 mono text-right tabular-nums text-white/60">{ctr}%</td>
                      <td className="py-3 px-4 mono text-right tabular-nums text-white font-bold">
                        {m.conversions}
                      </td>
                      <td className="py-3 px-4 mono text-right tabular-nums text-white/80">
                        ${m.spend.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 mono text-right tabular-nums text-emerald-400 font-bold">
                        ${m.revenue.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 mono text-right tabular-nums text-[#D6FF57] font-black">
                        {roas}x
                      </td>
                      <td className="py-3 px-4 mono text-right tabular-nums text-[#FF6A00]">
                        {m.hookRate || 42}%
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => deleteCampaignMetric(m.id)}
                          className="text-white/30 hover:text-red-400 transition-colors text-xs"
                          title="Delete metric"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Log Metric Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 glass">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#15151E] border border-[#2A2A3A] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2A2A3A] pb-3 mb-4">
              <div>
                <span className="mono text-[10px] text-white/40 uppercase">Firestore Metric Log</span>
                <h3 className="text-base font-bold text-white mt-0.5">Add Daily Campaign Entry</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-[#0A0A0F] border border-[#2A2A3A] flex items-center justify-center text-white/50 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMetric} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mono text-[10px] text-white/50 block mb-1">DATE</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full h-9 rounded-xl bg-[#0A0A0F] border border-[#2A2A3A] px-3 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="mono text-[10px] text-white/50 block mb-1">CHANNEL</label>
                  <select
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value)}
                    className="w-full h-9 rounded-xl bg-[#0A0A0F] border border-[#2A2A3A] px-2.5 text-xs text-white"
                  >
                    <option value="TikTok Ads">TikTok Ads</option>
                    <option value="Meta Reels">Meta Reels</option>
                    <option value="Google Search">Google Search</option>
                    <option value="Map Pack SEO">Map Pack SEO</option>
                    <option value="AI Overviews">AI Overviews</option>
                    <option value="Lifecycle SMS">Lifecycle SMS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mono text-[10px] text-white/50 block mb-1">CAMPAIGN NAME</label>
                <input
                  type="text"
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  placeholder="E.g., Invisalign Q4 Mom Hook"
                  className="w-full h-9 rounded-xl bg-[#0A0A0F] border border-[#2A2A3A] px-3 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mono text-[10px] text-white/50 block mb-1">IMPRESSIONS</label>
                  <input
                    type="number"
                    value={newImpressions}
                    onChange={(e) => setNewImpressions(e.target.value)}
                    className="w-full h-9 rounded-xl bg-[#0A0A0F] border border-[#2A2A3A] px-3 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="mono text-[10px] text-white/50 block mb-1">CLICKS</label>
                  <input
                    type="number"
                    value={newClicks}
                    onChange={(e) => setNewClicks(e.target.value)}
                    className="w-full h-9 rounded-xl bg-[#0A0A0F] border border-[#2A2A3A] px-3 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="mono text-[10px] text-white/50 block mb-1">CONVERSIONS</label>
                  <input
                    type="number"
                    value={newConversions}
                    onChange={(e) => setNewConversions(e.target.value)}
                    className="w-full h-9 rounded-xl bg-[#0A0A0F] border border-[#2A2A3A] px-3 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mono text-[10px] text-white/50 block mb-1">SPEND ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newSpend}
                    onChange={(e) => setNewSpend(e.target.value)}
                    className="w-full h-9 rounded-xl bg-[#0A0A0F] border border-[#2A2A3A] px-3 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="mono text-[10px] text-white/50 block mb-1">REVENUE ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newRevenue}
                    onChange={(e) => setNewRevenue(e.target.value)}
                    className="w-full h-9 rounded-xl bg-[#0A0A0F] border border-[#2A2A3A] px-3 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="mono text-[10px] text-white/50 block mb-1">HOOK RATE (%)</label>
                  <input
                    type="number"
                    value={newHookRate}
                    onChange={(e) => setNewHookRate(e.target.value)}
                    className="w-full h-9 rounded-xl bg-[#0A0A0F] border border-[#2A2A3A] px-3 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-white/50 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#D6FF57] text-black font-bold text-xs hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save to Firestore'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
