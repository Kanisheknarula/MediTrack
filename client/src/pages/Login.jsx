import { useState, useContext } from 'react';
import { useNavigate,Link } from 'react-router-dom';
import { Leaf, Shield, Stethoscope, Pill, Sprout } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const userData = await login(phoneNumber, password);
      
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

  
// ... keep all your existing HTML down here!
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      
      {/* Main Glassmorphism Card */}
      <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl flex flex-col md:flex-row w-full max-w-4xl overflow-hidden border border-white/50">
        
        {/* Left Side - Branding & Visuals */}
        <div className="md:w-1/2 bg-gradient-to-br from-green-600 to-teal-700 p-10 text-white flex flex-col justify-center relative overflow-hidden">
          {/* Decorative background circles */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-black/10 blur-xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Leaf className="w-8 h-8 text-green-100" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">EcoVet Portal</h1>
            </div>
            <p className="text-green-50 text-lg leading-relaxed mb-8">
              A unified digital ecosystem for MRL & Antimicrobial Usage tracking. Secure, transparent, and built for the future of livestock health.
            </p>
            
            {/* Animated Role Icons */}
            <div className="flex gap-4">
              {[Sprout, Stethoscope, Pill, Shield].map((Icon, index) => (
                <div key={index} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-300 cursor-default hover:-translate-y-1">
                  <Icon className="w-6 h-6 text-green-50" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="md:w-1/2 p-10 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-500 mt-2">Enter your credentials to access your dashboard.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input 
                type="tel" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g., 9876543210"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-green-500/30 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Sign In Securely
            </button>
          </form>

          {/* <p className="text-center text-sm text-gray-400 mt-8">
            Powered by Dept. of Animal Husbandry & Dairying
          </p> */}
          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account? <Link to="/register" className="text-green-600 font-bold hover:underline">Sign up here</Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;