import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { AuthContext } from '../context/authContextCore';
import MeditrackLogo from '../components/MeditrackLogo';
import { useAppSettings } from '../context/AppSettingsContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', phoneNumber: '', password: '', role: 'Farmer', city: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { registerUser } = useContext(AuthContext);
  const { t } = useAppSettings();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const userData = await registerUser(formData);
      
      // Magic routing based on the new role!
      if (userData.role === 'Farmer') navigate('/farmer-dashboard');
      else if (userData.role === 'Vet') navigate('/vet-dashboard');
      else if (userData.role === 'Pharmacist') navigate('/pharmacist-dashboard');
      else if (userData.role === 'Registrar') navigate('/registrar-dashboard');
      else if (userData.role === 'Admin') navigate('/admin-dashboard');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-8">
      <div className="bg-white shadow-2xl rounded-lg flex flex-col md:flex-row w-full max-w-5xl overflow-hidden border border-white/10">
        
        {/* Left Side - Branding */}
        <div className="md:w-5/12 bg-slate-950 p-10 text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(135deg,#064e3b_0_25%,transparent_25%_50%,#0f172a_50%_75%,transparent_75%_100%)] bg-[length:36px_36px]"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-lg bg-white/15 p-2 text-emerald-300 shadow-lg shadow-emerald-950/30 ring-1 ring-white/15 backdrop-blur-sm">
                <MeditrackLogo className="h-12 w-12" />
              </div>
              <h1 className="text-3xl font-extrabold">Meditrack</h1>
            </div>
            <h2 className="text-2xl font-bold mb-4">{t('joinNetwork')}</h2>
            <p className="text-emerald-50 text-base leading-relaxed mb-8">
              {t('registerCopy')}
            </p>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="md:w-7/12 p-8 md:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><UserPlus className="text-teal-600"/> {t('createAccount')}</h2>
          </div>

          {error && <div className="p-3 mb-4 bg-red-50 text-red-600 rounded-lg text-sm font-bold border border-red-100">{error}</div>}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">{t('fullName')}</label>
                <input type="text" name="name" required onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all" placeholder="Full name" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">{t('phoneNumber')}</label>
                <input type="tel" name="phoneNumber" required onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all" placeholder="10-digit number" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">{t('city')}</label>
                <input type="text" name="city" required onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all" placeholder="e.g. Bhopal" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">{t('role')}</label>
                <select name="role" required onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all font-semibold text-slate-700">
                  <option value="Farmer">Farmer (Livestock Owner)</option>
                  <option value="Vet">Veterinarian (Doctor)</option>
                  <option value="Pharmacist">Pharmacist</option>
                  <option value="Registrar">Registrar (Govt Operator)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">{t('password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 pr-12 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-teal-500"
                  placeholder="Minimum 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full mt-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-emerald-900/20 transition-all disabled:opacity-70">
              {isLoading ? t('creatingAccount') : t('createMeditrackAccount')}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            {t('alreadyAccount')} <Link to="/login" className="text-teal-600 font-bold hover:underline">{t('loginHere')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
