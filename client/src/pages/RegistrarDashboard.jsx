// // import { useState, useContext } from 'react';
// // import { AuthContext } from '../context/AuthContext';
// // import { useNavigate } from 'react-router-dom';
// // import { Users, LogOut, FilePlus, UserCheck, MapPin } from 'lucide-react';
// // import api from '../api'; // <-- Add this line near the top imports

// // const RegistrarDashboard = () => {
// //   const { user, logout } = useContext(AuthContext);
// //   const navigate = useNavigate();

// //   // NEW: State to control the form visibility and inputs
// //   const [showForm, setShowForm] = useState(false);
// //   const [farmerName, setFarmerName] = useState('');
// //   const [farmerPhone, setFarmerPhone] = useState('');
// //   const [animalType, setAnimalType] = useState('Cow');

// //   const handleLogout = () => {
// //     logout();
// //     navigate('/login');
// //   };

// //   // NEW: Function to handle the form submission
// //   const handleOfflineRegistration = async (e) => {
// //     e.preventDefault();
    
// //     try {
// //       // Send the real data to our new backend route!
// //       await api.post('/registrar/onboard', {
// //         name: farmerName,
// //         phoneNumber: farmerPhone,
// //         animalType: animalType
// //       });

// //       alert(`Success! ${farmerName} and their ${animalType} are now officially registered. Their temporary password is: EcoVet123!`);
      
// //       // Reset the form and close it
// //       setShowForm(false);
// //       setFarmerName('');
// //       setFarmerPhone('');
// //       setAnimalType('Cow');
// //     } catch (error) {
// //       alert(error.response?.data?.message || "Failed to register farmer.");
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen bg-slate-50 font-sans pb-12">
// //       <nav className="bg-white border-b border-slate-200 px-6 md:px-10 py-4 flex justify-between items-center shadow-sm w-full sticky top-0 z-50">
// //         <div className="flex items-center gap-3">
// //           <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
// //             <Users size={28} />
// //           </div>
// //           <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
// //             Govt. Registrar Portal
// //           </h1>
// //         </div>
        
// //         <div className="flex items-center gap-6">
// //           <div className="hidden md:block text-right">
// //             <p className="text-sm font-bold text-slate-800">{user?.name}</p>
// //             <p className="text-xs text-indigo-600 font-bold">Official Registrar</p>
// //           </div>
// //           <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold transition-all">
// //             <LogOut size={18} />
// //             <span className="hidden md:inline">Sign Out</span>
// //           </button>
// //         </div>
// //       </nav>

// //       <main className="max-w-6xl mx-auto mt-8 px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        
// //         {/* Quick Stats */}
// //         <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
// //           <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
// //              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><MapPin size={28} /></div>
// //              <div><p className="text-slate-500 font-bold text-sm">Your Region</p><p className="text-2xl font-extrabold text-slate-800">{user?.city}</p></div>
// //           </div>
// //           <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
// //              <div className="p-4 bg-green-50 text-green-600 rounded-2xl"><UserCheck size={28} /></div>
// //              <div><p className="text-slate-500 font-bold text-sm">Farmers Onboarded</p><p className="text-2xl font-extrabold text-slate-800">Ready</p></div>
// //           </div>
// //         </div>

// //         {/* Action Center */}
// //         <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
// //           <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
// //             <FilePlus className="text-indigo-600"/> Offline Farmer Onboarding
// //           </h2>
// //           <p className="text-slate-500 mb-6">Use this terminal to register farmers who do not have access to smartphones, ensuring they are connected to the EcoVet network.</p>
          
// //           <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 text-center transition-all">
// //             <p className="text-indigo-800 font-bold mb-4">Registration Terminal is Online.</p>
            
// //             {/* NEW: The button now toggles the form state! */}
// //             <button 
// //               onClick={() => setShowForm(!showForm)}
// //               className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all"
// //             >
// //               {showForm ? '- Close Terminal' : '+ Launch Registration Form'}
// //             </button>

// //             {/* NEW: The Dropdown Form */}
// //             {showForm && (
// //               <div className="mt-6 bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm text-left">
// //                 <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">New Offline Registration</h3>
// //                 <form onSubmit={handleOfflineRegistration} className="space-y-4">
// //                   <div>
// //                     <label className="block text-xs font-bold text-slate-600 mb-1">Farmer Full Name</label>
// //                     <input type="text" required value={farmerName} onChange={e => setFarmerName(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 bg-slate-50" placeholder="e.g. Ramu Kaka" />
// //                   </div>
// //                   <div>
// //                     <label className="block text-xs font-bold text-slate-600 mb-1">Phone Number (For SMS Alerts)</label>
// //                     <input type="tel" required value={farmerPhone} onChange={e => setFarmerPhone(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 bg-slate-50" placeholder="10-digit mobile number" />
// //                   </div>
// //                   <div>
// //                     <label className="block text-xs font-bold text-slate-600 mb-1">Livestock Type</label>
// //                     <select value={animalType} onChange={e => setAnimalType(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 bg-slate-50">
// //                       <option value="Cow">Cow</option>
// //                       <option value="Buffalo">Buffalo</option>
// //                       <option value="Goat">Goat</option>
// //                       <option value="Sheep">Sheep</option>
// //                     </select>
// //                   </div>
// //                   <button type="submit" className="w-full py-3 mt-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-all">
// //                     Submit & Issue EcoVet ID
// //                   </button>
// //                 </form>
// //               </div>
// //             )}
// //           </div>
// //         </div>

// //         {/* Info Sidebar */}
// //         <div className="md:col-span-1 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-lg">
// //           <h3 className="text-lg font-bold mb-4 text-indigo-300">Registrar Duties</h3>
// //           <ul className="space-y-4 text-sm text-slate-300">
// //             <li className="flex gap-2"><span>1.</span> Verify identity of local farmers.</li>
// //             <li className="flex gap-2"><span>2.</span> Register livestock details into the central AMU database.</li>
// //             <li className="flex gap-2"><span>3.</span> Assist farmers in requesting emergency Vet visits.</li>
// //           </ul>
// //         </div>

// //       </main>
// //     </div>
// //   );
// // };

// // export default RegistrarDashboard;

// import { useState, useContext } from 'react';
// import { AuthContext } from '../context/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import api from '../api';
// import { Users, LogOut, FilePlus, UserCheck, MapPin } from 'lucide-react';

// const RegistrarDashboard = () => {
//   const { user, logout } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const [showForm, setShowForm] = useState(false);
  
//   // Form State
//   const [farmerName, setFarmerName] = useState('');
//   const [farmerPhone, setFarmerPhone] = useState('');
//   const [animalType, setAnimalType] = useState('Cow');
//   const [breed, setBreed] = useState('');
//   const [age, setAge] = useState('');
//   const [weight, setWeight] = useState('');

//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };

//   const handleOfflineRegistration = async (e) => {
//     e.preventDefault();
    
//     try {
//       await api.post('/registrar/onboard', {
//         name: farmerName,
//         phoneNumber: farmerPhone,
//         animalType,
//         breed,
//         age,
//         weight
//       });

//       alert(`Success! ${farmerName} and their ${animalType} are now officially registered. Their temporary password is: EcoVet123!`);
      
//       // Reset the form
//       setShowForm(false);
//       setFarmerName('');
//       setFarmerPhone('');
//       setAnimalType('Cow');
//       setBreed('');
//       setAge('');
//       setWeight('');
//     } catch (error) {
//       alert(error.response?.data?.message || "Failed to register farmer.");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 font-sans pb-12">
//       <nav className="bg-white border-b border-slate-200 px-6 md:px-10 py-4 flex justify-between items-center shadow-sm w-full sticky top-0 z-50">
//         <div className="flex items-center gap-3">
//           <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
//             <Users size={28} />
//           </div>
//           <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
//             Govt. Registrar Portal
//           </h1>
//         </div>
        
//         <div className="flex items-center gap-6">
//           <div className="hidden md:block text-right">
//             <p className="text-sm font-bold text-slate-800">{user?.name}</p>
//             <p className="text-xs text-indigo-600 font-bold">Official Registrar</p>
//           </div>
//           <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold transition-all">
//             <LogOut size={18} />
//             <span className="hidden md:inline">Sign Out</span>
//           </button>
//         </div>
//       </nav>

//       <main className="max-w-6xl mx-auto mt-8 px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        
//         <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
//              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><MapPin size={28} /></div>
//              <div><p className="text-slate-500 font-bold text-sm">Your Region</p><p className="text-2xl font-extrabold text-slate-800">{user?.city}</p></div>
//           </div>
//           <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
//              <div className="p-4 bg-green-50 text-green-600 rounded-2xl"><UserCheck size={28} /></div>
//              <div><p className="text-slate-500 font-bold text-sm">Farmers Onboarded</p><p className="text-2xl font-extrabold text-slate-800">Ready</p></div>
//           </div>
//         </div>

//         <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
//           <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
//             <FilePlus className="text-indigo-600"/> Offline Farmer Onboarding
//           </h2>
//           <p className="text-slate-500 mb-6">Use this terminal to register farmers who do not have access to smartphones, ensuring they are connected to the EcoVet network.</p>
          
//           <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 text-center transition-all">
//             <p className="text-indigo-800 font-bold mb-4">Registration Terminal is Online.</p>
            
//             <button 
//               onClick={() => setShowForm(!showForm)}
//               className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all"
//             >
//               {showForm ? '- Close Terminal' : '+ Launch Registration Form'}
//             </button>

//             {showForm && (
//               <div className="mt-6 bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm text-left">
//                 <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">New Offline Registration</h3>
//                 <form onSubmit={handleOfflineRegistration} className="space-y-4">
                  
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-xs font-bold text-slate-600 mb-1">Farmer Full Name</label>
//                       <input type="text" required value={farmerName} onChange={e => setFarmerName(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 bg-slate-50" placeholder="e.g. Ramu Kaka" />
//                     </div>
//                     <div>
//                       <label className="block text-xs font-bold text-slate-600 mb-1">Phone Number (For SMS Alerts)</label>
//                       <input type="tel" required value={farmerPhone} onChange={e => setFarmerPhone(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 bg-slate-50" placeholder="10-digit mobile number" />
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
//                     <div>
//                       <label className="block text-xs font-bold text-slate-600 mb-1">Livestock Type</label>
//                       <select value={animalType} onChange={e => setAnimalType(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 bg-slate-50">
//                         <option value="Cow">Cow</option>
//                         <option value="Buffalo">Buffalo</option>
//                         <option value="Goat">Goat</option>
//                         <option value="Sheep">Sheep</option>
//                       </select>
//                     </div>
//                     <div>
//                       <label className="block text-xs font-bold text-slate-600 mb-1">Breed</label>
//                       <input type="text" required value={breed} onChange={e => setBreed(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 bg-slate-50" placeholder="e.g. Gir, Murrah" />
//                     </div>
//                     <div>
//                       <label className="block text-xs font-bold text-slate-600 mb-1">Age (Years)</label>
//                       <input type="number" required min="0" value={age} onChange={e => setAge(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 bg-slate-50" placeholder="e.g. 3" />
//                     </div>
//                     <div>
//                       <label className="block text-xs font-bold text-slate-600 mb-1">Weight (Kg)</label>
//                       <input type="number" required min="0" value={weight} onChange={e => setWeight(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 bg-slate-50" placeholder="e.g. 450" />
//                     </div>
//                   </div>

//                   <button type="submit" className="w-full py-3 mt-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-all">
//                     Submit & Issue EcoVet ID
//                   </button>
//                 </form>
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="md:col-span-1 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-lg h-fit">
//           <h3 className="text-lg font-bold mb-4 text-indigo-300">Registrar Duties</h3>
//           <ul className="space-y-4 text-sm text-slate-300">
//             <li className="flex gap-2"><span>1.</span> Verify identity of local farmers.</li>
//             <li className="flex gap-2"><span>2.</span> Register livestock details into the central AMU database.</li>
//             <li className="flex gap-2"><span>3.</span> Assist farmers in requesting emergency Vet visits.</li>
//           </ul>
//         </div>

//       </main>
//     </div>
//   );
// };

// export default RegistrarDashboard;

import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Users, LogOut, FilePlus, UserCheck, MapPin, Clock, Fingerprint } from 'lucide-react';

const RegistrarDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // State Management
  const [activeTab, setActiveTab] = useState('onboard'); // 'onboard' or 'history'
  const [showForm, setShowForm] = useState(false);
  const [history, setHistory] = useState([]);
  
  // Form State
  const [farmerName, setFarmerName] = useState('');
  const [farmerPhone, setFarmerPhone] = useState('');
  const [animalType, setAnimalType] = useState('Cow');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/registrar/history');
      setHistory(response.data);
    } catch (error) {
      console.error("Failed to fetch history", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOfflineRegistration = async (e) => {
    e.preventDefault();
    try {
      await api.post('/registrar/onboard', {
        name: farmerName, phoneNumber: farmerPhone, animalType, breed, age, weight
      });

      alert(`Success! ${farmerName} and their ${animalType} are now officially registered. Their temporary password is: EcoVet123!`);
      
      setShowForm(false);
      setFarmerName(''); setFarmerPhone(''); setAnimalType('Cow'); setBreed(''); setAge(''); setWeight('');
      
      if(activeTab === 'history') fetchHistory(); // Refresh if they are looking at history
    } catch (error) {
      alert(error.response?.data?.message || "Failed to register farmer.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      <nav className="bg-white border-b border-slate-200 px-6 md:px-10 py-4 flex justify-between items-center shadow-sm w-full sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
            <Users size={28} />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            Govt. Registrar Portal
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-slate-800">{user?.name}</p>
            <p className="text-xs text-indigo-600 font-bold">Official Registrar</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold transition-all">
            <LogOut size={18} />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto mt-8 px-4">
        
        {/* TOP STATS & TOGGLE ROW */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex gap-4">
            <div className="bg-white px-6 py-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
               <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><MapPin size={24} /></div>
               <div><p className="text-slate-500 font-bold text-xs uppercase">Region</p><p className="text-lg font-extrabold text-slate-800">{user?.city}</p></div>
            </div>
          </div>

          <div className="flex bg-slate-200 p-1 rounded-xl w-full md:w-auto">
            <button 
              onClick={() => setActiveTab('onboard')}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'onboard' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              New Registration
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'history' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Clock size={16} /> Audit Trail
            </button>
          </div>
        </div>

        {/* TAB 1: ONBOARDING FORM */}
        {activeTab === 'onboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <FilePlus className="text-indigo-600"/> Offline Farmer Onboarding
              </h2>
              <p className="text-slate-500 mb-6">Use this terminal to register farmers who do not have access to smartphones.</p>
              
              <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 text-center transition-all">
                <p className="text-indigo-800 font-bold mb-4">Registration Terminal is Online.</p>
                <button onClick={() => setShowForm(!showForm)} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all">
                  {showForm ? '- Close Terminal' : '+ Launch Registration Form'}
                </button>

                {showForm && (
                  <div className="mt-6 bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm text-left">
                    <form onSubmit={handleOfflineRegistration} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-xs font-bold text-slate-600 mb-1">Farmer Full Name</label><input type="text" required value={farmerName} onChange={e => setFarmerName(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-indigo-500" /></div>
                        <div><label className="block text-xs font-bold text-slate-600 mb-1">Phone Number</label><input type="tel" required value={farmerPhone} onChange={e => setFarmerPhone(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-indigo-500" /></div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
                        <div><label className="block text-xs font-bold text-slate-600 mb-1">Type</label><select value={animalType} onChange={e => setAnimalType(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-indigo-500"><option value="Cow">Cow</option><option value="Buffalo">Buffalo</option><option value="Goat">Goat</option></select></div>
                        <div><label className="block text-xs font-bold text-slate-600 mb-1">Breed</label><input type="text" required value={breed} onChange={e => setBreed(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-indigo-500" /></div>
                        <div><label className="block text-xs font-bold text-slate-600 mb-1">Age (Yrs)</label><input type="number" required value={age} onChange={e => setAge(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-indigo-500" /></div>
                        <div><label className="block text-xs font-bold text-slate-600 mb-1">Weight (Kg)</label><input type="number" required value={weight} onChange={e => setWeight(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-indigo-500" /></div>
                      </div>
                      <button type="submit" className="w-full py-3 mt-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-all">Submit & Issue EcoVet ID</button>
                    </form>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-1 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-lg h-fit">
              <h3 className="text-lg font-bold mb-4 text-indigo-300">Registrar Duties</h3>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex gap-2"><span>1.</span> Verify identity of local farmers.</li>
                <li className="flex gap-2"><span>2.</span> Register livestock into the central AMU database.</li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB 2: AUDIT TRAIL / HISTORY */}
        {activeTab === 'history' && (
          history.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm flex flex-col items-center">
              <Clock size={64} className="text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-700">No Records Found</h3>
              <p className="text-slate-500">You haven't onboarded any farmers yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Fingerprint className="text-indigo-600"/> Registration Log</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {history.map((record) => (
                  <div key={record._id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                      <p className="text-xs font-bold text-slate-400 mb-1">{new Date(record.createdAt).toLocaleString()}</p>
                      <h4 className="text-lg font-bold text-slate-800">{record.farmer?.name} <span className="text-sm font-medium text-slate-500">({record.farmer?.phoneNumber})</span></h4>
                    </div>
                    <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 text-right">
                      <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Registered Animal</p>
                      <p className="font-bold text-indigo-900">{record.animalType} ({record.breed}) <span className="text-indigo-600 font-black ml-2">{record.animalId}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}

      </main>
    </div>
  );
};

export default RegistrarDashboard;