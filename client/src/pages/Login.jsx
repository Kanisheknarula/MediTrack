import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Shield, Stethoscope, Pill, Sprout } from 'lucide-react';
import { AuthContext } from '../context/authContextCore';
import MeditrackLogo from '../components/MeditrackLogo';
import { useAppSettings } from '../context/AppSettingsContext';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const { t } = useAppSettings();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const userData = await login(phoneNumber.trim(), password.trim());
      
      // Magic routing based on role!
      if (userData.role === 'Admin') navigate('/admin-dashboard');
      else if (userData.role === 'Farmer') navigate('/farmer-dashboard');
      else if (userData.role === 'Vet') navigate('/vet-dashboard');
      else if (userData.role === 'Pharmacist') navigate('/pharmacist-dashboard');
      else if (userData.role === 'Registrar') navigate('/registrar-dashboard');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-8">
      
      {/* Main Glassmorphism Card */}
      <div className="bg-white shadow-2xl rounded-lg flex flex-col md:flex-row w-full max-w-5xl overflow-hidden border border-white/10">
        
        {/* Left Side - Branding & Visuals */}
        <div className="md:w-1/2 bg-slate-950 p-10 text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(135deg,#064e3b_0_25%,transparent_25%_50%,#0f172a_50%_75%,transparent_75%_100%)] bg-[length:36px_36px]"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-lg bg-white/15 p-2 text-emerald-300 shadow-lg shadow-emerald-950/30 ring-1 ring-white/15 backdrop-blur-sm">
                <MeditrackLogo className="h-12 w-12" />
              </div>
              <h1 className="text-3xl font-extrabold">Meditrack</h1>
            </div>
            <p className="text-emerald-50 text-lg leading-relaxed mb-8">
              A premium livestock health workspace for treatment requests, prescriptions, medicine safety, AMU analytics, and AI adherence insights.
            </p>
            
            {/* Animated Role Icons */}
            <div className="flex gap-4">
              {[Sprout, Stethoscope, Pill, Shield].map((Icon, index) => (
                <div key={index} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-300 cursor-default hover:-translate-y-1">
                  <Icon className="w-6 h-6 text-emerald-50" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="md:w-1/2 p-10 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800">{t('loginTitle')}</h2>
            <p className="text-gray-500 mt-2">{t('loginSubtitle')}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('phoneNumber')}</label>
              <input 
                type="tel" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g., 9876543210"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('enterPassword')}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 pr-12 outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-green-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-emerald-900/20 transition-all duration-300 active:translate-y-0"
            >
              {isLoading ? t('signingIn') : t('signIn')}
            </button>
          </form>

          {error && (
            <p className="mt-4 text-sm font-semibold text-red-600">
              {error}
            </p>
          )}

          {/* <p className="text-center text-sm text-gray-400 mt-8">
            Powered by Dept. of Animal Husbandry & Dairying
          </p> */}
          <p className="text-center text-sm text-slate-500 mt-6">
            {t('noAccount')} <Link to="/register" className="text-green-600 font-bold hover:underline">{t('signupHere')}</Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
