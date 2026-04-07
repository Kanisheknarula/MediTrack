import { useCallback, useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  Bell,
  Brain,
  ClipboardList,
  Pill,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import api from '../api';
import { useAppSettings } from '../context/AppSettingsContext';

const statusTone = {
  High: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Low: 'bg-red-50 text-red-700 border-red-200',
  Healthy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Moderate: 'bg-amber-50 text-amber-700 border-amber-200',
  Critical: 'bg-red-50 text-red-700 border-red-200',
  Improving: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Stable: 'bg-slate-50 text-slate-700 border-slate-200',
  Declining: 'bg-red-50 text-red-700 border-red-200',
};

const MetricCard = ({ icon, label, value, subtext, tone = 'bg-white' }) => (
  <div className={`rounded-lg border border-slate-200 p-4 shadow-sm ${tone}`}>
    <div className="flex items-center justify-between gap-3">
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      {icon}
    </div>
    <p className="mt-3 text-3xl font-black text-slate-900">{value}</p>
    {subtext && <p className="mt-1 text-sm font-semibold text-slate-500">{subtext}</p>}
  </div>
);

const PillBadge = ({ value, toneKey = value }) => (
  <span className={`rounded-lg border px-3 py-1 text-xs font-black ${statusTone[toneKey] || statusTone.Stable}`}>
    {value}
  </span>
);

const AIReportPanel = ({ title = 'AI Health Intelligence' }) => {
  const { t } = useAppSettings();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [reminderSet, setReminderSet] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/ai-report');
      setReport(response.data);
    } catch (err) {
      const status = err.response?.status;
      setError(status === 404
        ? t('aiRouteRestart')
        : err.response?.data?.message || t('unableLoadAiReport'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleCopyInsight = async () => {
    if (!report) return;
    const text = `${localizedInsight}\n\n${t('recommendations')}:\n${localizedRecommendations.join('\n')}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      alert(localizedInsight);
    }
  };

  if (loading) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 text-slate-600">
          <RefreshCw className="animate-spin text-emerald-700" size={18} />
          <span className="font-bold">{t('generatingReport')}</span>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
        <div className="flex items-center gap-3">
          <AlertTriangle size={20} />
          <p className="font-bold">{error}</p>
        </div>
      </section>
    );
  }

  if (!report) return null;

  const trendData = report.trendAnalysis?.series || [];
  const medicineData = report.medicineWiseAnalysis || [];
  const translateStatus = (value) => t(`reportStatus${value}`) || value;
  const translateTimeSlot = (value = '') => t(`time${value.charAt(0).toUpperCase()}${value.slice(1)}`) || value;
  const dataSourceLabel = report.scope?.dataSource === 'demoFallback'
    ? t('demoFallbackData')
    : report.scope?.dataSource === 'estimatedFromBillingHistory'
      ? t('estimatedBilling')
      : t('estimatedTreatment');
  const worstMedicine = medicineData.find((item) => item.missed > 0);
  const localizedInsight = `${t('aiInsight')
    .replace('{timeSlot}', translateTimeSlot(report.patternDetection.mostMissedTime).toLowerCase())
    .replace('{adherenceClass}', translateStatus(report.adherence.classification).toLowerCase())
    .replace('{healthClass}', translateStatus(report.healthScore.classification).toLowerCase())
    .replace('{riskLevel}', translateStatus(report.riskPrediction.classification).toLowerCase())
    .replace('{trendDirection}', translateStatus(report.trendAnalysis.direction).toLowerCase())}${worstMedicine ? t('aiInsightWorstMedicine').replace('{medicine}', worstMedicine.medicineName) : ''}`;
  const localizedRecommendations = [
    report.patternDetection.mostMissedTime === 'night'
      ? t('recNight')
      : report.patternDetection.mostMissedTime === 'morning'
        ? t('recMorning')
        : t('recAfternoon'),
    report.adherence.classification === 'Low'
      ? t('recLow')
      : report.adherence.classification === 'Medium'
        ? t('recMedium')
        : t('recHigh'),
    ...(report.riskPrediction.classification === 'High' ? [t('recRiskHigh')] : []),
    ...(report.trendAnalysis.direction === 'Declining' ? [t('recDeclining')] : []),
    ...(worstMedicine ? [t('recWorstMedicine').replace('{medicine}', worstMedicine.medicineName)] : []),
    t('recVetApproval'),
  ];

  return (
    <section className="rounded-lg border border-emerald-900/10 bg-white shadow-lg shadow-emerald-900/5 overflow-hidden">
      <div className="bg-slate-950 px-6 py-5 text-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/20 p-2 text-emerald-200">
                <Brain size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-200">{t('mlPrototype')}</p>
                <h2 className="text-2xl font-black">{title}</h2>
              </div>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              {localizedInsight}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={fetchReport} className="rounded-lg bg-white px-4 py-2 text-sm font-black text-slate-900 hover:bg-emerald-50">
              <RefreshCw size={16} className="mr-2 inline" />
              {t('refresh')}
            </button>
            <button onClick={() => setReminderSet(true)} className="rounded-lg border border-white/20 px-4 py-2 text-sm font-black text-white hover:bg-white/10">
              <Bell size={16} className="mr-2 inline" />
              {reminderSet ? t('reminderQueued') : t('addReminder')}
            </button>
            <button onClick={handleCopyInsight} className="rounded-lg border border-white/20 px-4 py-2 text-sm font-black text-white hover:bg-white/10">
              <ClipboardList size={16} className="mr-2 inline" />
              {copied ? t('copied') : t('copyInsight')}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-4">
        <MetricCard
          icon={<Activity size={18} className="text-emerald-700" />}
          label={t('adherence')}
          value={`${report.adherence.percentage}%`}
          subtext={t('dosesTaken').replace('{taken}', report.adherence.taken).replace('{total}', report.adherence.total)}
          tone="bg-emerald-50/70"
        />
        <MetricCard
          icon={<ShieldCheck size={18} className="text-emerald-700" />}
          label={t('healthScore')}
          value={`${report.healthScore.score}/100`}
          subtext={translateStatus(report.healthScore.classification)}
        />
        <MetricCard
          icon={<AlertTriangle size={18} className="text-emerald-700" />}
          label={t('futureMissRisk')}
          value={`${report.riskPrediction.probability}%`}
          subtext={translateStatus(report.riskPrediction.classification)}
        />
        <MetricCard
          icon={<TrendingUp size={18} className="text-emerald-700" />}
          label={t('trend')}
          value={translateStatus(report.trendAnalysis.direction)}
          subtext={t('trendChange').replace('{delta}', `${report.trendAnalysis.delta > 0 ? '+' : ''}${report.trendAnalysis.delta}`)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 px-6 pb-6 lg:grid-cols-5">
        <div className="rounded-lg border border-slate-200 p-5 lg:col-span-3">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">{t('trendAnalysis')}</p>
              <h3 className="text-lg font-black text-slate-900">{t('adherenceOverTime')}</h3>
            </div>
            <PillBadge value={translateStatus(report.trendAnalysis.direction)} toneKey={report.trendAnalysis.direction} />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="adherence" stroke="#047857" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">{t('patternDetection')}</p>
              <h3 className="text-lg font-black text-slate-900">{t('mostMissedTime')}</h3>
            </div>
            <PillBadge value={translateStatus(report.adherence.classification)} toneKey={report.adherence.classification} />
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-500">{t('detectedCluster')}</p>
            <p className="mt-1 text-3xl font-black capitalize text-slate-900">{translateTimeSlot(report.patternDetection.mostMissedTime)}</p>
            <p className="mt-2 text-sm text-slate-600">{t('methodTimeClustering')}</p>
          </div>
          <div className="mt-4 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={Object.entries(report.patternDetection.missedByTime).map(([slot, value]) => ({ slot: translateTimeSlot(slot), missed: value.missed }))}>
                <XAxis dataKey="slot" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="missed" fill="#0f766e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 border-t border-slate-200 bg-slate-50 p-6 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Pill size={18} className="text-emerald-700" />
            <h3 className="font-black text-slate-900">{t('medicineWiseAnalysis')}</h3>
          </div>
          <div className="space-y-3">
            {medicineData.map((item) => (
              <div key={item.medicineName} className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-black text-slate-800">{item.medicineName}</p>
                  <p className="text-sm font-black text-emerald-700">{item.adherence}%</p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-lg bg-slate-100">
                  <div className="h-full rounded-lg bg-emerald-700" style={{ width: `${item.adherence}%` }} />
                </div>
                <p className="mt-2 text-xs font-bold text-slate-500">{t('missedOutOf').replace('{missed}', item.missed).replace('{total}', item.total)}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-black text-slate-900">{t('smartRecommendations')}</h3>
          <div className="mt-3 space-y-3">
            {localizedRecommendations.map((recommendation) => (
              <div key={recommendation} className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-semibold leading-6 text-slate-700">
                {recommendation}
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs font-bold uppercase text-slate-500">{t('dataSource')}: {dataSourceLabel}</p>
        </div>
      </div>
    </section>
  );
};

export default AIReportPanel;
