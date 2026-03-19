import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, MapPin, Pill, LogOut, ShieldCheck } from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
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
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* FULL-WIDTH TOP NAVIGATION BAR */}
      <nav className="bg-white border-b border-slate-200 px-6 md:px-10 py-4 flex justify-between items-center shadow-sm w-full sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 text-green-700 rounded-lg">
            <ShieldCheck size={28} />
          </div>
          <div>
            {/* High-Contrast Gradient Title */}
           <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight !text-green-900">
  Govt. AMU Analytics
</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-slate-800">{user?.name}</p>
            <p className="text-xs text-slate-500 font-medium">System Administrator</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-xl font-bold transition-all"
          >
            <LogOut size={18} />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </nav>

      {/* FULL-WIDTH MAIN CONTENT AREA */}
      <main className="w-full px-4 md:px-8 lg:px-12 py-8 mx-auto">
        
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          <div className="bg-gradient-to-br from-green-600 to-emerald-500 p-8 rounded-3xl shadow-lg shadow-green-200 text-white transform transition duration-300 hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
            <div className="flex justify-between items-center mb-4 relative z-10">
              <h3 className="text-green-50 font-semibold text-lg">Total AMU Records</h3>
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm"><Activity size={24} /></div>
            </div>
            <p className="text-6xl font-extrabold relative z-10">{dashboardData?.overview?.totalAMURecords || 0}</p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center transition-all hover:shadow-md">
             <div className="flex items-center gap-5">
                <div className="p-5 bg-blue-50 text-blue-600 rounded-2xl"><MapPin size={32} /></div>
                <div>
                  <p className="text-slate-500 font-semibold text-sm uppercase tracking-wider mb-1">Active Regions</p>
                  <p className="text-4xl font-extrabold text-slate-800">{dashboardData?.cityData?.length || 0}</p>
                </div>
             </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center transition-all hover:shadow-md">
             <div className="flex items-center gap-5">
                <div className="p-5 bg-purple-50 text-purple-600 rounded-2xl"><Pill size={32} /></div>
                <div>
                  <p className="text-slate-500 font-semibold text-sm uppercase tracking-wider mb-1">Medicines Tracked</p>
                  <p className="text-4xl font-extrabold text-slate-800">{dashboardData?.medicineData?.length || 0}</p>
                </div>
             </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* City Heatmap (Bar Chart) */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-8 border-b border-slate-100 pb-4">Prescriptions by City</h3>
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData?.cityData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="_id" stroke="#64748b" tick={{fontWeight: 600}} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="totalPrescriptions" fill="#0ea5e9" radius={[8, 8, 0, 0]} barSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Medicine Usage (Pie Chart) */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-8 border-b border-slate-100 pb-4">Top Antimicrobials Used</h3>
            <div className="h-96 w-full flex justify-center items-center">
              {dashboardData?.medicineData?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData.medicineData}
                      cx="50%"
                      cy="50%"
                      innerRadius={100}
                      outerRadius={140}
                      paddingAngle={5}
                      dataKey="timesPrescribed"
                      nameKey="_id"
                      label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {dashboardData.medicineData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold' }}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-400 italic font-medium">No prescription data available yet.</p>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;