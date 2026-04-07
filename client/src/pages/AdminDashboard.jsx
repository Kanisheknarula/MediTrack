import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/authContextCore';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, BarChart3, Brain, Database, LogOut, MapPin, Pill, TrendingUp } from 'lucide-react';
import AIReportPanel from '../components/AIReportPanel';
import MeditrackLogo from '../components/MeditrackLogo';
import { useAppSettings } from '../context/AppSettingsContext';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { t } = useAppSettings();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modern UI Colors for the Pie Chart
  const COLORS = ['#059669', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/dashboard');
        setDashboardData(response.data);
      } catch (error) {
        console.error("Failed to fetch admin stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef3f6] font-sans text-slate-950">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 px-6 py-4 text-white shadow-xl shadow-slate-950/20 backdrop-blur md:px-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-400/15 p-1.5 text-emerald-300 ring-1 ring-emerald-300/20">
              <MeditrackLogo className="h-11 w-11" />
            </div>
            <div>
              <p className="text-xs font-black uppercase text-emerald-200">{t('adminControlCenter')}</p>
              <h1 className="text-2xl font-black md:text-3xl">{t('meditrackIntelligence')}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right md:block">
              <p className="text-sm font-black">{user?.name}</p>
              <p className="text-xs font-semibold text-slate-300">System Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 font-black text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={18} />
              <span className="hidden md:inline">{t('signOut')}</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="w-full px-4 py-8 md:px-8 lg:px-12">
        <section className="overflow-hidden rounded-lg bg-slate-950 text-white shadow-2xl shadow-slate-900/20">
          <div className="grid gap-8 p-6 md:p-10 lg:grid-cols-[1.25fr_0.75fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-sm font-black text-emerald-100">
                <Brain size={18} />
                {t('aiSurveillance')}
              </div>
              <h2 className="mt-6 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
                {t('adminHeroTitle')}
              </h2>
              <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-slate-300">
                {t('adminHeroCopy')}
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/10 p-6 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-300">{t('currentRegion')}</p>
                  <p className="mt-1 text-2xl font-black">{user?.city || 'All regions'}</p>
                </div>
                <Database className="text-emerald-200" size={34} />
              </div>
              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-white p-4 text-slate-950">
                  <p className="text-xs font-black uppercase text-slate-500">{t('records')}</p>
                  <p className="mt-2 text-3xl font-black">{dashboardData?.overview?.totalAMURecords || 0}</p>
                </div>
                <div className="rounded-lg bg-emerald-400 p-4 text-slate-950">
                  <p className="text-xs font-black uppercase text-emerald-950/70">{t('coverage')}</p>
                  <p className="mt-2 text-3xl font-black">{dashboardData?.cityData?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="-mt-6 grid grid-cols-1 gap-4 px-4 md:grid-cols-3">
          <div className="rounded-lg border border-white bg-white p-6 shadow-xl shadow-slate-900/10">
            <div className="flex items-center justify-between">
              <p className="text-sm font-black uppercase text-slate-500">{t('totalAmuRecords')}</p>
              <Activity className="text-emerald-700" size={26} />
            </div>
            <p className="mt-5 text-5xl font-black text-slate-950">{dashboardData?.overview?.totalAMURecords || 0}</p>
            <p className="mt-2 text-sm font-semibold text-slate-500">Logged pharmacist billing events</p>
          </div>

          <div className="rounded-lg border border-white bg-white p-6 shadow-xl shadow-slate-900/10">
            <div className="flex items-center justify-between">
              <p className="text-sm font-black uppercase text-slate-500">{t('activeRegions')}</p>
              <MapPin className="text-blue-700" size={26} />
            </div>
            <p className="mt-5 text-5xl font-black text-slate-950">{dashboardData?.cityData?.length || 0}</p>
            <p className="mt-2 text-sm font-semibold text-slate-500">Cities contributing AMU records</p>
          </div>

          <div className="rounded-lg border border-white bg-white p-6 shadow-xl shadow-slate-900/10">
            <div className="flex items-center justify-between">
              <p className="text-sm font-black uppercase text-slate-500">{t('medicinesTracked')}</p>
              <Pill className="text-amber-600" size={26} />
            </div>
            <p className="mt-5 text-5xl font-black text-slate-950">{dashboardData?.medicineData?.length || 0}</p>
            <p className="mt-2 text-sm font-semibold text-slate-500">Distinct dispensed medicine names</p>
          </div>
        </section>

        <section className="mt-8">
          <AIReportPanel title={t('aiReport')} />
        </section>

        <section className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-white bg-white p-6 shadow-xl shadow-slate-900/10">
            <div className="mb-6 flex flex-col gap-3 border-b border-slate-100 pb-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase text-emerald-700">Regional surveillance</p>
                <h3 className="text-2xl font-black text-slate-950">Prescriptions by City</h3>
              </div>
              <BarChart3 className="text-emerald-700" size={28} />
            </div>
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData?.cityData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="_id" stroke="#64748b" tick={{ fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#ecfdf5' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 18px 45px -22px rgba(15,23,42,0.7)' }} />
                  <Bar dataKey="totalPrescriptions" fill="#047857" radius={[8, 8, 0, 0]} barSize={58} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-lg border border-white bg-white p-6 shadow-xl shadow-slate-900/10">
            <div className="mb-6 flex flex-col gap-3 border-b border-slate-100 pb-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase text-amber-700">Medicine signal</p>
                <h3 className="text-2xl font-black text-slate-950">Top Antimicrobials Used</h3>
              </div>
              <TrendingUp className="text-amber-600" size={28} />
            </div>
            <div className="h-96 w-full">
              {dashboardData?.medicineData?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData.medicineData}
                      cx="50%"
                      cy="50%"
                      innerRadius={92}
                      outerRadius={135}
                      paddingAngle={4}
                      dataKey="timesPrescribed"
                      nameKey="_id"
                      label={({ name, percent }) => `${name || 'Unspecified medicine'} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {dashboardData.medicineData.map((entry, index) => (
                        <Cell key={`cell-${entry._id || index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 18px 45px -22px rgba(15,23,42,0.7)', fontWeight: 'bold' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center rounded-lg bg-slate-50 text-sm font-bold text-slate-400">
                  No prescription data available yet.
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
