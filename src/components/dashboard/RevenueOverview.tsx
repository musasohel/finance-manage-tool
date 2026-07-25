import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  Briefcase
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { ProjectWithFinancials } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

interface RevenueOverviewProps {
  projects: ProjectWithFinancials[];
}

export const RevenueOverview: React.FC<RevenueOverviewProps> = ({ projects }) => {
  const { settings } = useAuth();
  const [timeRange, setTimeRange] = useState<'6m' | 'year' | 'all'>('6m');
  const [chartType, setChartType] = useState<'bar' | 'area'>('bar');

  // Compute monthly breakdown data
  const monthlyData = useMemo(() => {
    const monthsMap: Record<
      string,
      {
        monthKey: string;
        displayMonth: string;
        sortDate: Date;
        received: number;
        invoiced: number;
        projectCount: number;
      }
    > = {};

    const now = new Date();

    // Past 12 months setup
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthStr = d.toLocaleString('en-US', { month: 'short' });
      const monthKey = `${year}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const displayMonth = `${monthStr} '${String(year).slice(2)}`;

      monthsMap[monthKey] = {
        monthKey,
        displayMonth,
        sortDate: d,
        received: 0,
        invoiced: 0,
        projectCount: 0,
      };
    }

    // Accumulate project total values (Invoiced)
    projects.forEach((p) => {
      const pDate = new Date(p.createdDate);
      if (!isNaN(pDate.getTime())) {
        const monthKey = `${pDate.getFullYear()}-${String(pDate.getMonth() + 1).padStart(2, '0')}`;
        if (monthsMap[monthKey]) {
          monthsMap[monthKey].invoiced += p.totalPrice;
          monthsMap[monthKey].projectCount += 1;
        } else {
          // If out of standard range, create entry if valid
          const year = pDate.getFullYear();
          const monthStr = pDate.toLocaleString('en-US', { month: 'short' });
          const displayMonth = `${monthStr} '${String(year).slice(2)}`;
          monthsMap[monthKey] = {
            monthKey,
            displayMonth,
            sortDate: new Date(pDate.getFullYear(), pDate.getMonth(), 1),
            received: 0,
            invoiced: p.totalPrice,
            projectCount: 1,
          };
        }
      }

      // Accumulate actual payments received
      p.payments?.forEach((pay) => {
        const payDate = new Date(pay.date);
        if (!isNaN(payDate.getTime())) {
          const payMonthKey = `${payDate.getFullYear()}-${String(payDate.getMonth() + 1).padStart(2, '0')}`;
          if (monthsMap[payMonthKey]) {
            monthsMap[payMonthKey].received += pay.amount;
          } else {
            const year = payDate.getFullYear();
            const monthStr = payDate.toLocaleString('en-US', { month: 'short' });
            const displayMonth = `${monthStr} '${String(year).slice(2)}`;
            monthsMap[payMonthKey] = {
              monthKey: payMonthKey,
              displayMonth,
              sortDate: new Date(payDate.getFullYear(), payDate.getMonth(), 1),
              received: pay.amount,
              invoiced: 0,
              projectCount: 0,
            };
          }
        }
      });
    });

    const sorted = Object.values(monthsMap).sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime());

    if (timeRange === '6m') {
      return sorted.slice(-6);
    } else if (timeRange === 'year') {
      const currentYear = now.getFullYear();
      return sorted.filter((m) => m.sortDate.getFullYear() === currentYear);
    }
    return sorted;
  }, [projects, timeRange]);

  // Overall Financial Aggregates
  const stats = useMemo(() => {
    let totalInvoiced = 0;
    let totalCollected = 0;
    let totalPending = 0;
    let paidProjectsCount = 0;
    let totalProjectsCount = projects.length;

    projects.forEach((p) => {
      totalInvoiced += p.totalPrice;
      totalCollected += p.totalReceived;
      totalPending += p.remainingAmount;
      if (p.status === 'Paid') paidProjectsCount++;
    });

    const collectionRate = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0;
    const avgProjectValue = totalProjectsCount > 0 ? Math.round(totalInvoiced / totalProjectsCount) : 0;

    return {
      totalInvoiced,
      totalCollected,
      totalPending,
      collectionRate,
      avgProjectValue,
      paidProjectsCount,
      totalProjectsCount,
    };
  }, [projects]);

  const currencySymbol = settings?.currencySymbol || 'BDT';

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#111827] text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-gray-800">
          <p className="font-semibold text-gray-300 border-b border-gray-800 pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-bold">{formatCurrency(entry.value, currencySymbol)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
      {/* Header & Controls */}
      <div className="p-5 border-b border-[#E5E7EB] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gray-100 text-[#111827] rounded-xl">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-[#111827]">Revenue Overview</h3>
              <span className="text-xs font-semibold text-[#16A34A] bg-[#DCFCE7] px-2.5 py-0.5 rounded-full">
                {stats.collectionRate}% Collected
              </span>
            </div>
            <p className="text-xs text-[#6B7280]">
              Monthly income streams, project values, and collection metrics
            </p>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe Selector */}
          <div className="bg-gray-100 p-1 rounded-xl flex items-center text-xs font-medium text-[#6B7280]">
            <button
              onClick={() => setTimeRange('6m')}
              className={`px-3 py-1 rounded-lg transition-all ${
                timeRange === '6m' ? 'bg-white text-[#111827] shadow-2xs font-bold' : 'hover:text-[#111827]'
              }`}
            >
              Last 6 Months
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-3 py-1 rounded-lg transition-all ${
                timeRange === 'year' ? 'bg-white text-[#111827] shadow-2xs font-bold' : 'hover:text-[#111827]'
              }`}
            >
              This Year
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                timeRange === 'all' ? 'bg-white text-[#111827] shadow-2xs font-bold' : 'hover:text-[#111827]'
              }`}
            >
              All Time
            </button>
          </div>

          {/* Chart style toggle */}
          <div className="bg-gray-100 p-1 rounded-xl flex items-center text-xs font-medium text-[#6B7280]">
            <button
              onClick={() => setChartType('bar')}
              title="Bar Chart"
              className={`p-1.5 rounded-lg transition-all ${
                chartType === 'bar' ? 'bg-white text-[#111827] shadow-2xs' : 'hover:text-[#111827]'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setChartType('area')}
              title="Area Trend"
              className={`p-1.5 rounded-lg transition-all ${
                chartType === 'area' ? 'bg-white text-[#111827] shadow-2xs' : 'hover:text-[#111827]'
              }`}
            >
              <PieChartIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Revenue Body */}
      <div className="p-5 space-y-6">
        {/* Metric Highlight Chips */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3.5 bg-gray-50/80 rounded-xl border border-[#E5E7EB]">
            <p className="text-[11px] font-medium text-[#6B7280]">Total Invoiced</p>
            <p className="text-lg font-bold text-[#111827] mt-0.5">
              {formatCurrency(stats.totalInvoiced, currencySymbol)}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-[#6B7280] mt-1">
              <Briefcase className="h-3 w-3" />
              <span>{stats.totalProjectsCount} Total Projects</span>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50/40 rounded-xl border border-emerald-100">
            <p className="text-[11px] font-semibold text-emerald-800">Total Collected</p>
            <p className="text-lg font-bold text-emerald-700 mt-0.5">
              {formatCurrency(stats.totalCollected, currencySymbol)}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-700 mt-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>{stats.paidProjectsCount} Fully Settled</span>
            </div>
          </div>

          <div className="p-3.5 bg-amber-50/40 rounded-xl border border-amber-100">
            <p className="text-[11px] font-semibold text-amber-800">Outstanding Balance</p>
            <p className="text-lg font-bold text-amber-700 mt-0.5">
              {formatCurrency(stats.totalPending, currencySymbol)}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-amber-700 mt-1">
              <Clock className="h-3 w-3" />
              <span>Due from Clients</span>
            </div>
          </div>

          <div className="p-3.5 bg-gray-50/80 rounded-xl border border-[#E5E7EB]">
            <p className="text-[11px] font-medium text-[#6B7280]">Average Deal Size</p>
            <p className="text-lg font-bold text-[#111827] mt-0.5">
              {formatCurrency(stats.avgProjectValue, currencySymbol)}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-600 mt-1">
              <ArrowUpRight className="h-3 w-3" />
              <span>Per Project</span>
            </div>
          </div>
        </div>

        {/* Chart Visualization Container */}
        <div className="pt-2">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis
                    dataKey="displayMonth"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 11 }}
                    tickFormatter={(val) =>
                      val >= 1000000
                        ? `${(val / 1000000).toFixed(1)}M`
                        : val >= 1000
                        ? `${(val / 1000).toFixed(0)}k`
                        : `${val}`
                    }
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                    iconType="circle"
                  />
                  <Bar
                    dataKey="received"
                    name="Payments Received"
                    fill="#10B981"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="invoiced"
                    name="Project Value Invoiced"
                    fill="#111827"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              ) : (
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="receivedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="invoicedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#111827" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#111827" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis
                    dataKey="displayMonth"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 11 }}
                    tickFormatter={(val) =>
                      val >= 1000000
                        ? `${(val / 1000000).toFixed(1)}M`
                        : val >= 1000
                        ? `${(val / 1000).toFixed(0)}k`
                        : `${val}`
                    }
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                    iconType="circle"
                  />
                  <Area
                    type="monotone"
                    dataKey="received"
                    name="Payments Received"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#receivedGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="invoiced"
                    name="Project Value Invoiced"
                    stroke="#111827"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#invoicedGrad)"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
