// // import { useState, useEffect, useContext } from 'react';
// // import { AuthContext } from '../context/AuthContext';
// // import { useNavigate } from 'react-router-dom';
// // import api from '../api';
// // import { Stethoscope, LogOut, CheckCircle, AlertCircle, FileText, Syringe } from 'lucide-react';

// // const VetDashboard = () => {
// //   const { user, logout } = useContext(AuthContext);
// //   const navigate = useNavigate();
// //   const [treatments, setTreatments] = useState([]);
// //   const [loading, setLoading] = useState(true);

// //   // Prescription Form State (For simplicity, we handle one medicine per submit in this UI)
// //   const [medName, setMedName] = useState('');
// //   const [dosage, setDosage] = useState('');
// //   const [withdrawal, setWithdrawal] = useState('');
// //   const [notes, setNotes] = useState('');
// //   const [activePrescriptionId, setActivePrescriptionId] = useState(null);

// //   useEffect(() => {
// //     fetchTreatments();
// //   }, []);

// //   const fetchTreatments = async () => {
// //     try {
// //       const response = await api.get('/treatments/pending');
// //       setTreatments(response.data);
// //     } catch (error) {
// //       console.error("Failed to fetch cases", error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleAccept = async (id) => {
// //     try {
// //       await api.put(`/treatments/${id}/respond`, { status: 'Accepted' });
// //       fetchTreatments(); // Refresh the list!
// //     } catch (error) {
// //       alert("Error accepting case");
// //     }
// //   };

// //   const handlePrescribe = async (e, id) => {
// //     e.preventDefault();
// //     try {
// //       const prescriptionArray = [{
// //         medicineName: medName,
// //         dosage: dosage,
// //         withdrawalPeriodDays: Number(withdrawal),
// //         notes: notes
// //       }];

// //       await api.put(`/treatments/${id}/prescribe`, { prescriptionArray });
      
// //       alert("Prescription submitted successfully! Forwarded to Pharmacist.");
// //       setActivePrescriptionId(null);
// //       fetchTreatments(); // Refresh to remove the completed case
// //     } catch (error) {
// //       alert("Error submitting prescription");
// //     }
// //   };

// //   const handleLogout = () => {
// //     logout();
// //     navigate('/login');
// //   };

// //   if (loading) {
// //     return (
// //       <div className="min-h-screen bg-slate-50 flex items-center justify-center">
// //         <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="min-h-screen bg-slate-50 font-sans pb-12">
      
// //       {/* Vet Navigation Bar */}
// //       <nav className="bg-white border-b border-slate-200 px-6 md:px-10 py-4 flex justify-between items-center shadow-sm w-full sticky top-0 z-50">
// //         <div className="flex items-center gap-3">
// //           <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
// //             <Stethoscope size={28} />
// //           </div>
// //           <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
// //             Doctor's Portal
// //           </h1>
// //         </div>
        
// //         <div className="flex items-center gap-6">
// //           <div className="hidden md:block text-right">
// //             <p className="text-sm font-bold text-slate-800">Dr. {user?.name}</p>
// //             <p className="text-xs text-blue-600 font-bold">{user?.city} Region</p>
// //           </div>
// //           <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold transition-all">
// //             <LogOut size={18} />
// //             <span className="hidden md:inline">Sign Out</span>
// //           </button>
// //         </div>
// //       </nav>

// //       <main className="max-w-5xl mx-auto mt-8 px-4">
// //         <div className="mb-8">
// //           <h2 className="text-2xl font-bold text-slate-800">Emergency & Active Cases</h2>
// //           <p className="text-slate-500">Farmers in your area requesting immediate medical attention.</p>
// //         </div>

// //         {treatments.length === 0 ? (
// //           <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm flex flex-col items-center">
// //             <CheckCircle size={64} className="text-green-400 mb-4" />
// //             <h3 className="text-xl font-bold text-slate-700">All Clear!</h3>
// //             <p className="text-slate-500">There are no pending medical requests in {user?.city}.</p>
// //           </div>
// //         ) : (
// //           <div className="space-y-6">
// //             {treatments.map((ticket) => (
// //               <div key={ticket._id} className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm transition-all hover:shadow-md">
                
// //                 {/* Ticket Header */}
// //                 <div className={`p-6 border-b ${ticket.status === 'Pending' ? 'bg-orange-50 border-orange-100' : 'bg-blue-50 border-blue-100'}`}>
// //                   <div className="flex justify-between items-start">
// //                     <div>
// //                       <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${ticket.status === 'Pending' ? 'bg-orange-200 text-orange-800' : 'bg-blue-200 text-blue-800'}`}>
// //                         {ticket.status === 'Pending' ? 'ACTION REQUIRED' : 'CASE ACCEPTED'}
// //                       </span>
// //                       <h3 className="text-xl font-bold text-slate-800">
// //                         {ticket.animal?.animalType} ({ticket.animal?.breed})
// //                       </h3>
// //                       <p className="text-slate-600 font-medium mt-1">
// //                         Farmer: {ticket.farmer?.name} • Ph: {ticket.farmer?.phoneNumber}
// //                       </p>
// //                     </div>
// //                     <div className="text-right">
// //                       <p className="text-sm font-bold text-slate-500">ID: {ticket.animal?.animalId}</p>
// //                       <p className="text-xs text-slate-400 mt-1">{new Date(ticket.createdAt).toLocaleDateString()}</p>
// //                     </div>
// //                   </div>
// //                 </div>

// //                 {/* Ticket Body */}
// //                 <div className="p-6">
// //                   <div className="mb-6">
// //                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
// //                       <AlertCircle size={14} /> Reported Symptoms
// //                     </h4>
// //                     <p className="text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
// //                       "{ticket.symptomsDescription}"
// //                     </p>
// //                   </div>

// //                   {/* Action Area */}
// //                   {ticket.status === 'Pending' ? (
// //                     <button 
// //                       onClick={() => handleAccept(ticket._id)}
// //                       className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5"
// //                     >
// //                       Accept This Case
// //                     </button>
// //                   ) : (
// //                     <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
// //                       <h4 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
// //                         <FileText size={20} className="text-blue-600" /> Digital Prescription Pad
// //                       </h4>
                      
// //                       <form onSubmit={(e) => handlePrescribe(e, ticket._id)} className="space-y-4">
// //                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                           <div>
// //                             <label className="block text-xs font-bold text-slate-600 mb-1">Medicine Name</label>
// //                             <input type="text" required value={medName} onChange={e => setMedName(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:border-blue-500" placeholder="e.g., Amoxicillin" />
// //                           </div>
// //                           <div>
// //                             <label className="block text-xs font-bold text-slate-600 mb-1">Dosage</label>
// //                             <input type="text" required value={dosage} onChange={e => setDosage(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:border-blue-500" placeholder="e.g., 500mg daily" />
// //                           </div>
// //                         </div>
                        
// //                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                           <div>
// //                             <label className="block text-xs font-bold text-red-600 mb-1">Withdrawal Period (Days)</label>
// //                             <input type="number" required min="0" value={withdrawal} onChange={e => setWithdrawal(e.target.value)} className="w-full p-3 rounded-lg border border-red-200 bg-red-50 outline-none focus:border-red-500 text-red-700 font-bold" placeholder="0" />
// //                           </div>
// //                           <div>
// //                             <label className="block text-xs font-bold text-slate-600 mb-1">Doctor's Notes</label>
// //                             <input type="text" value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:border-blue-500" placeholder="Optional instructions..." />
// //                           </div>
// //                         </div>

// //                         <button type="submit" className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-all">
// //                           <Syringe size={18} /> Send Prescription to Pharmacy
// //                         </button>
// //                       </form>
// //                     </div>
// //                   )}

// //                 </div>
// //               </div>
// //             ))}
// //           </div>
// //         )}
// //       </main>
// //     </div>
// //   );
// // };

// // export default VetDashboard;

// import { useState, useEffect, useContext } from 'react';
// import { AuthContext } from '../context/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import api from '../api';
// import { Stethoscope, LogOut, CheckCircle, AlertCircle, FileText, Syringe, XCircle } from 'lucide-react';

// const VetDashboard = () => {
//   const { user, logout } = useContext(AuthContext);
//   const navigate = useNavigate();
//   const [treatments, setTreatments] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [medName, setMedName] = useState('');
//   const [dosage, setDosage] = useState('');
//   const [withdrawal, setWithdrawal] = useState('');
//   const [notes, setNotes] = useState('');
//   const [activePrescriptionId, setActivePrescriptionId] = useState(null);

//   useEffect(() => {
//     fetchTreatments();
//   }, []);

//   const fetchTreatments = async () => {
//     try {
//       const response = await api.get('/treatments/pending');
//       setTreatments(response.data);
//     } catch (error) {
//       console.error("Failed to fetch cases", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAccept = async (id) => {
//     try {
//       await api.put(`/treatments/${id}/respond`, { status: 'Accepted' });
//       fetchTreatments();
//     } catch (error) {
//       alert("Error accepting case");
//     }
//   };

//   // NEW: Handle Reject Function
//   const handleReject = async (id) => {
//     // Add a confirmation so they don't accidentally click it
//     if (window.confirm("Are you sure you want to decline this case? It will be routed to other available Vets.")) {
//       try {
//         await api.put(`/treatments/${id}/respond`, { status: 'Rejected' });
//         fetchTreatments(); // Refresh to remove it from their screen
//       } catch (error) {
//         alert("Error rejecting case. Make sure 'Rejected' is allowed in your backend schema!");
//       }
//     }
//   };

//   const handlePrescribe = async (e, id) => {
//     e.preventDefault();
//     try {
//       const prescriptionArray = [{
//         medicineName: medName,
//         dosage: dosage,
//         withdrawalPeriodDays: Number(withdrawal),
//         notes: notes
//       }];

//       await api.put(`/treatments/${id}/prescribe`, { prescriptionArray });
      
//       alert("Prescription submitted successfully! Forwarded to Pharmacist.");
//       setActivePrescriptionId(null);
//       fetchTreatments();
//     } catch (error) {
//       alert("Error submitting prescription");
//     }
//   };

//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-slate-50 flex items-center justify-center">
//         <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-50 font-sans pb-12">
      
//       <nav className="bg-white border-b border-slate-200 px-6 md:px-10 py-4 flex justify-between items-center shadow-sm w-full sticky top-0 z-50">
//         <div className="flex items-center gap-3">
//           <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
//             <Stethoscope size={28} />
//           </div>
//           <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
//             Doctor's Portal
//           </h1>
//         </div>
        
//         <div className="flex items-center gap-6">
//           <div className="hidden md:block text-right">
//             <p className="text-sm font-bold text-slate-800">Dr. {user?.name}</p>
//             <p className="text-xs text-blue-600 font-bold">{user?.city} Region</p>
//           </div>
//           <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold transition-all">
//             <LogOut size={18} />
//             <span className="hidden md:inline">Sign Out</span>
//           </button>
//         </div>
//       </nav>

//       <main className="max-w-5xl mx-auto mt-8 px-4">
//         <div className="mb-8">
//           <h2 className="text-2xl font-bold text-slate-800">Emergency & Active Cases</h2>
//           <p className="text-slate-500">Farmers in your area requesting immediate medical attention.</p>
//         </div>

//         {treatments.length === 0 ? (
//           <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm flex flex-col items-center">
//             <CheckCircle size={64} className="text-green-400 mb-4" />
//             <h3 className="text-xl font-bold text-slate-700">All Clear!</h3>
//             <p className="text-slate-500">There are no pending medical requests in {user?.city}.</p>
//           </div>
//         ) : (
//           <div className="space-y-6">
//             {treatments.map((ticket) => (
//               <div key={ticket._id} className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm transition-all hover:shadow-md">
                
//                 <div className={`p-6 border-b ${ticket.status === 'Pending' ? 'bg-orange-50 border-orange-100' : 'bg-blue-50 border-blue-100'}`}>
//                   <div className="flex justify-between items-start">
//                     <div>
//                       <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${ticket.status === 'Pending' ? 'bg-orange-200 text-orange-800' : 'bg-blue-200 text-blue-800'}`}>
//                         {ticket.status === 'Pending' ? 'ACTION REQUIRED' : 'CASE ACCEPTED'}
//                       </span>
//                       <h3 className="text-xl font-bold text-slate-800">
//                         {ticket.animal?.animalType} ({ticket.animal?.breed})
//                       </h3>
//                       <p className="text-slate-600 font-medium mt-1">
//                         Farmer: {ticket.farmer?.name} • Ph: {ticket.farmer?.phoneNumber}
//                       </p>
//                     </div>
//                     <div className="text-right">
//                       <p className="text-sm font-bold text-slate-500">ID: {ticket.animal?.animalId}</p>
//                       <p className="text-xs text-slate-400 mt-1">{new Date(ticket.createdAt).toLocaleDateString()}</p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="p-6">
//                   <div className="mb-6">
//                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
//                       <AlertCircle size={14} /> Reported Symptoms
//                     </h4>
//                     <p className="text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
//                       "{ticket.symptomsDescription}"
//                     </p>
//                   </div>

//                   {ticket.status === 'Pending' ? (
//                     // NEW: The Button Layout is now a flex container with both Accept and Reject
//                     <div className="flex flex-col md:flex-row gap-3">
//                       <button 
//                         onClick={() => handleAccept(ticket._id)}
//                         className="flex-1 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5"
//                       >
//                         Accept This Case
//                       </button>
//                       <button 
//                         onClick={() => handleReject(ticket._id)}
//                         className="flex items-center justify-center gap-2 px-8 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-all"
//                       >
//                         <XCircle size={18} /> Decline
//                       </button>
//                     </div>
//                   ) : (
//                     <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
//                       <h4 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
//                         <FileText size={20} className="text-blue-600" /> Digital Prescription Pad
//                       </h4>
                      
//                       <form onSubmit={(e) => handlePrescribe(e, ticket._id)} className="space-y-4">
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                           <div>
//                             <label className="block text-xs font-bold text-slate-600 mb-1">Medicine Name</label>
//                             <input type="text" required value={medName} onChange={e => setMedName(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:border-blue-500" placeholder="e.g., Amoxicillin" />
//                           </div>
//                           <div>
//                             <label className="block text-xs font-bold text-slate-600 mb-1">Dosage</label>
//                             <input type="text" required value={dosage} onChange={e => setDosage(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:border-blue-500" placeholder="e.g., 500mg daily" />
//                           </div>
//                         </div>
                        
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                           <div>
//                             <label className="block text-xs font-bold text-red-600 mb-1">Withdrawal Period (Days)</label>
//                             <input type="number" required min="0" value={withdrawal} onChange={e => setWithdrawal(e.target.value)} className="w-full p-3 rounded-lg border border-red-200 bg-red-50 outline-none focus:border-red-500 text-red-700 font-bold" placeholder="0" />
//                           </div>
//                           <div>
//                             <label className="block text-xs font-bold text-slate-600 mb-1">Doctor's Notes</label>
//                             <input type="text" value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:border-blue-500" placeholder="Optional instructions..." />
//                           </div>
//                         </div>

//                         <button type="submit" className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-all">
//                           <Syringe size={18} /> Send Prescription to Pharmacy
//                         </button>
//                       </form>
//                     </div>
//                   )}

//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </main>
//     </div>
//   );
// };

// export default VetDashboard;

import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Stethoscope, LogOut, CheckCircle, AlertCircle, FileText, Syringe, XCircle, Clock } from 'lucide-react';

const VetDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // NEW: State for our Tab Toggle and History Data
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'
  const [treatments, setTreatments] = useState([]);
  const [historyCases, setHistoryCases] = useState([]);
  const [loading, setLoading] = useState(true);

  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [withdrawal, setWithdrawal] = useState('');
  const [notes, setNotes] = useState('');
  const [activePrescriptionId, setActivePrescriptionId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch BOTH active cases and history at the same time
      const [pendingRes, historyRes] = await Promise.all([
        api.get('/treatments/pending'),
        api.get('/treatments/vet-history')
      ]);
      setTreatments(pendingRes.data);
      setHistoryCases(historyRes.data);
    } catch (error) {
      console.error("Failed to fetch cases", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await api.put(`/treatments/${id}/respond`, { status: 'Accepted' });
      fetchData(); // Refresh both lists
    } catch (error) {
      alert("Error accepting case");
    }
  };

  const handleReject = async (id) => {
    if (window.confirm("Are you sure you want to decline this case? It will be routed to other available Vets.")) {
      try {
        await api.put(`/treatments/${id}/respond`, { status: 'Rejected' });
        fetchData(); 
      } catch (error) {
        alert("Error rejecting case.");
      }
    }
  };

  const handlePrescribe = async (e, id) => {
    e.preventDefault();
    try {
      const prescriptionArray = [{
        medicineName: medName,
        dosage: dosage,
        withdrawalPeriodDays: Number(withdrawal),
        notes: notes
      }];

      await api.put(`/treatments/${id}/prescribe`, { prescriptionArray });
      
      alert("Prescription submitted successfully! Forwarded to Pharmacist.");
      setActivePrescriptionId(null);
      
      // Clear form
      setMedName(''); setDosage(''); setWithdrawal(''); setNotes('');
      fetchData(); // Refresh both lists so it moves to history!
    } catch (error) {
      alert("Error submitting prescription");
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      
      <nav className="bg-white border-b border-slate-200 px-6 md:px-10 py-4 flex justify-between items-center shadow-sm w-full sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
            <Stethoscope size={28} />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            Doctor's Portal
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-slate-800">Dr. {user?.name}</p>
            <p className="text-xs text-blue-600 font-bold">{user?.city} Region</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold transition-all">
            <LogOut size={18} />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto mt-8 px-4">
        
        {/* NEW: Sleek Tab Toggle System */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {activeTab === 'active' ? 'Emergency & Active Cases' : 'My Medical History'}
            </h2>
            <p className="text-slate-500">
              {activeTab === 'active' ? 'Farmers requesting immediate medical attention.' : 'Cases you have previously completed or declined.'}
            </p>
          </div>

          <div className="flex bg-slate-200 p-1 rounded-xl w-full md:w-auto">
            <button 
              onClick={() => setActiveTab('active')}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'active' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Active Queue
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'history' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Clock size={16} /> History
            </button>
          </div>
        </div>

        {/* ============================== */}
        {/* ACTIVE TAB CONTENT             */}
        {/* ============================== */}
        {activeTab === 'active' && (
          treatments.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm flex flex-col items-center">
              <CheckCircle size={64} className="text-green-400 mb-4" />
              <h3 className="text-xl font-bold text-slate-700">All Clear!</h3>
              <p className="text-slate-500">There are no pending medical requests in {user?.city}.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {treatments.map((ticket) => (
                <div key={ticket._id} className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm transition-all hover:shadow-md">
                  
                  <div className={`p-6 border-b ${ticket.status === 'Pending' ? 'bg-orange-50 border-orange-100' : 'bg-blue-50 border-blue-100'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${ticket.status === 'Pending' ? 'bg-orange-200 text-orange-800' : 'bg-blue-200 text-blue-800'}`}>
                          {ticket.status === 'Pending' ? 'ACTION REQUIRED' : 'CASE ACCEPTED'}
                        </span>
                        <h3 className="text-xl font-bold text-slate-800">
                          {ticket.animal?.animalType} ({ticket.animal?.breed})
                        </h3>
                        <p className="text-slate-600 font-medium mt-1">
                          Farmer: {ticket.farmer?.name} • Ph: {ticket.farmer?.phoneNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-500">ID: {ticket.animal?.animalId}</p>
                        <p className="text-xs text-slate-400 mt-1">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="mb-6">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <AlertCircle size={14} /> Reported Symptoms
                      </h4>
                      <p className="text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        "{ticket.symptomsDescription}"
                      </p>
                    </div>

                    {ticket.status === 'Pending' ? (
                      <div className="flex flex-col md:flex-row gap-3">
                        <button onClick={() => handleAccept(ticket._id)} className="flex-1 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5">
                          Accept This Case
                        </button>
                        <button onClick={() => handleReject(ticket._id)} className="flex items-center justify-center gap-2 px-8 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-all">
                          <XCircle size={18} /> Decline
                        </button>
                      </div>
                    ) : (
                      <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                        <h4 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                          <FileText size={20} className="text-blue-600" /> Digital Prescription Pad
                        </h4>
                        
                        <form onSubmit={(e) => handlePrescribe(e, ticket._id)} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">Medicine Name</label>
                              <input type="text" required value={medName} onChange={e => setMedName(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:border-blue-500" placeholder="e.g., Amoxicillin" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">Dosage</label>
                              <input type="text" required value={dosage} onChange={e => setDosage(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:border-blue-500" placeholder="e.g., 500mg daily" />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-red-600 mb-1">Withdrawal Period (Days)</label>
                              <input type="number" required min="0" value={withdrawal} onChange={e => setWithdrawal(e.target.value)} className="w-full p-3 rounded-lg border border-red-200 bg-red-50 outline-none focus:border-red-500 text-red-700 font-bold" placeholder="0" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">Doctor's Notes</label>
                              <input type="text" value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:border-blue-500" placeholder="Optional instructions..." />
                            </div>
                          </div>

                          <button type="submit" className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-all">
                            <Syringe size={18} /> Send Prescription to Pharmacy
                          </button>
                        </form>
                      </div>
                    )}

                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ============================== */}
        {/* HISTORY TAB CONTENT            */}
        {/* ============================== */}
        {activeTab === 'history' && (
          historyCases.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm flex flex-col items-center">
              <Clock size={64} className="text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-700">No History Found</h3>
              <p className="text-slate-500">You haven't completed or declined any cases yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {historyCases.map((ticket) => (
                <div key={ticket._id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                  
                  {/* Status Indicator Bar */}
                  <div className={`absolute top-0 left-0 w-2 h-full ${ticket.status === 'Completed' ? 'bg-green-500' : 'bg-red-400'}`}></div>
                  
                  <div className="flex justify-between items-start mb-4 pl-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{ticket.animal?.animalType} ({ticket.animal?.animalId})</h3>
                      <p className="text-slate-500 text-sm">Farmer: {ticket.farmer?.name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${ticket.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {ticket.status}
                    </span>
                  </div>

                  <div className="pl-4">
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3 line-clamp-2">
                      <span className="font-bold text-slate-400 uppercase text-xs block mb-1">Symptoms</span>
                      {ticket.symptomsDescription}
                    </p>

                    {ticket.status === 'Completed' && ticket.prescription?.length > 0 && (
                       <div className="mt-3">
                         <span className="font-bold text-slate-400 uppercase text-xs block mb-1 flex items-center gap-1"><Syringe size={12}/> Prescribed</span>
                         <p className="font-bold text-blue-700">{ticket.prescription[0]?.medicineName}</p>
                       </div>
                    )}
                    <p className="text-xs text-slate-400 mt-4 text-right">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

      </main>
    </div>
  );
};

export default VetDashboard;