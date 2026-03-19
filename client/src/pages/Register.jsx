import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Leaf } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', phoneNumber: '', password: '', role: 'Farmer', city: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { registerUser } = useContext(AuthContext);
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
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl flex flex-col md:flex-row w-full max-w-4xl overflow-hidden border border-white/50">
        
        {/* Left Side - Branding */}
        <div className="md:w-5/12 bg-gradient-to-br from-teal-600 to-green-700 p-10 text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm"><Leaf className="w-8 h-8 text-green-100" /></div>
              <h1 className="text-3xl font-extrabold tracking-tight">EcoVet</h1>
            </div>
            <h2 className="text-2xl font-bold mb-4">Join the Network</h2>
            <p className="text-green-50 text-base leading-relaxed mb-8">
              Create your account to start managing livestock health, tracking prescriptions, and securing the food supply chain.
            </p>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="md:w-7/12 p-8 md:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><UserPlus className="text-teal-600"/> Create Account</h2>
          </div>

          {error && <div className="p-3 mb-4 bg-red-50 text-red-600 rounded-lg text-sm font-bold border border-red-100">{error}</div>}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Full Name</label>
                <input type="text" name="name" required onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Phone Number</label>
                <input type="tel" name="phoneNumber" required onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all" placeholder="10-digit number" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">City/District</label>
                <input type="text" name="city" required onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all" placeholder="e.g. Bhopal" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Select Role</label>
                <select name="role" required onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all font-semibold text-slate-700">
                  <option value="Farmer">Farmer (Livestock Owner)</option>
                  <option value="Vet">Veterinarian (Doctor)</option>
                  <option value="Pharmacist">Pharmacist</option>
                  <option value="Registrar">Registrar (Govt Operator)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Password</label>
              <input type="password" name="password" required onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all" placeholder="••••••••" />
            </div>

            <button type="submit" disabled={isLoading} className="w-full mt-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-teal-200 transition-all transform hover:-translate-y-0.5 disabled:opacity-70">
              {isLoading ? 'Creating Account...' : 'Sign Up Now'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account? <Link to="/login" className="text-teal-600 font-bold hover:underline">Log in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;