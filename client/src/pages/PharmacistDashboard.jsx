// import { useState, useEffect, useContext } from 'react';
// import { AuthContext } from '../context/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import api from '../api';
// import { Store, LogOut, CheckCircle, Receipt, CreditCard, AlertCircle } from 'lucide-react';

// const PharmacistDashboard = () => {
//   const { user, logout } = useContext(AuthContext);
//   const navigate = useNavigate();
//   const [pendingBills, setPendingBills] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Billing Form State
//   const [activeBillId, setActiveBillId] = useState(null);
//   const [totalAmount, setTotalAmount] = useState('');
//   const [quantityNotes, setQuantityNotes] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   useEffect(() => {
//     fetchPendingBills();
//   }, []);

//   const fetchPendingBills = async () => {
//     try {
//       const response = await api.get('/pharmacist/pending-bills');
//       setPendingBills(response.data);
//     } catch (error) {
//       console.error("Failed to fetch bills", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGenerateBill = async (e, ticket) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     try {
//       // Map the Vet's prescription into the format our backend AMU Log expects
//       const dispensedMedicines = ticket.prescription.map(med => ({
//         medicineName: med.medicineName,
//         quantityOrMg: quantityNotes || 'As prescribed', 
//         price: Number(totalAmount) / ticket.prescription.length // Split price evenly for the log
//       }));

//       await api.post('/pharmacist/generate-bill', {
//         treatmentId: ticket._id,
//         dispensedMedicines,
//         totalBillAmount: Number(totalAmount)
//       });

//       alert("Bill Generated! AMU Data has been securely logged for Government Analytics.");
//       setActiveBillId(null);
//       setTotalAmount('');
//       setQuantityNotes('');
//       fetchPendingBills(); // Refresh the list!
//     } catch (error) {
//       alert(error.response?.data?.message || "Error generating bill");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-slate-50 flex items-center justify-center">
//         <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-50 font-sans pb-12">
      
//       {/* Pharmacist Navigation Bar */}
//       <nav className="bg-white border-b border-slate-200 px-6 md:px-10 py-4 flex justify-between items-center shadow-sm w-full sticky top-0 z-50">
//         <div className="flex items-center gap-3">
//           <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
//             <Store size={28} />
//           </div>
//           <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
//             Pharmacy Gateway
//           </h1>
//         </div>
        
//         <div className="flex items-center gap-6">
//           <div className="hidden md:block text-right">
//             <p className="text-sm font-bold text-slate-800">{user?.name}</p>
//             <p className="text-xs text-purple-600 font-bold">{user?.city} Branch</p>
//           </div>
//           <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold transition-all">
//             <LogOut size={18} />
//             <span className="hidden md:inline">Sign Out</span>
//           </button>
//         </div>
//       </nav>

//       <main className="max-w-5xl mx-auto mt-8 px-4">
//         <div className="mb-8">
//           <h2 className="text-2xl font-bold text-slate-800">Pending Prescriptions</h2>
//           <p className="text-slate-500">Farmers waiting to pick up their medicines in your city.</p>
//         </div>

//         {pendingBills.length === 0 ? (
//           <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm flex flex-col items-center">
//             <CheckCircle size={64} className="text-green-400 mb-4" />
//             <h3 className="text-xl font-bold text-slate-700">Queue Empty</h3>
//             <p className="text-slate-500">All prescriptions in {user?.city} have been billed.</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 gap-6">
//             {pendingBills.map((ticket) => (
//               <div key={ticket._id} className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm transition-all hover:shadow-md flex flex-col md:flex-row">
                
//                 {/* Left Side - Details */}
//                 <div className="p-6 md:w-2/3 border-b md:border-b-0 md:border-r border-slate-100">
//                   <div className="flex justify-between items-start mb-4">
//                     <div>
//                       <h3 className="text-xl font-bold text-slate-800">
//                         Farmer: {ticket.farmer?.name}
//                       </h3>
//                       <p className="text-slate-500 font-medium">Ph: {ticket.farmer?.phoneNumber}</p>
//                     </div>
//                     <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold flex items-center gap-1">
//                       <Receipt size={14} /> Unpaid
//                     </span>
//                   </div>

//                   <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
//                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Prescribed by Dr. {ticket.vet?.name}</p>
//                     <ul className="space-y-2">
//                       {ticket.prescription.map((med, idx) => (
//                         <li key={idx} className="flex justify-between items-center text-sm">
//                           <span className="font-bold text-slate-700">{med.medicineName}</span>
//                           <span className="text-slate-500">{med.dosage}</span>
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 </div>

//                 {/* Right Side - Billing Action */}
//                 <div className="p-6 md:w-1/3 bg-purple-50/30 flex flex-col justify-center">
//                   {activeBillId === ticket._id ? (
//                     <form onSubmit={(e) => handleGenerateBill(e, ticket)} className="space-y-4">
//                       <div>
//                         <label className="block text-xs font-bold text-slate-600 mb-1">Total Amount (₹)</label>
//                         <input type="number" required min="1" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:border-purple-500 font-bold" placeholder="e.g. 450" />
//                       </div>
//                       <div>
//                         <label className="block text-xs font-bold text-slate-600 mb-1">Quantity Dispensed</label>
//                         <input type="text" required value={quantityNotes} onChange={e => setQuantityNotes(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:border-purple-500" placeholder="e.g. 2 Bottles, 10 Pills" />
//                       </div>
//                       <div className="flex gap-2">
//                         <button type="button" onClick={() => setActiveBillId(null)} className="px-4 py-3 text-slate-500 hover:bg-slate-100 rounded-xl font-bold transition-all">Cancel</button>
//                         <button type="submit" disabled={isSubmitting} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all disabled:opacity-70">
//                           {isSubmitting ? 'Processing...' : 'Collect Pay'}
//                         </button>
//                       </div>
//                     </form>
//                   ) : (
//                     <div className="text-center">
//                       <AlertCircle className="mx-auto text-purple-400 mb-2" size={32} />
//                       <p className="text-sm text-slate-600 font-medium mb-4">Medicines are ready for pickup. Bill needs to be generated.</p>
//                       <button 
//                         onClick={() => setActiveBillId(ticket._id)}
//                         className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-200 transition-all transform hover:-translate-y-0.5"
//                       >
//                         <CreditCard size={18} /> Process Bill
//                       </button>
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

// export default PharmacistDashboard;

import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/authContextCore';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { LogOut, CheckCircle, Receipt, CreditCard, AlertCircle, Clock, FileCheck } from 'lucide-react';
import MeditrackLogo from '../components/MeditrackLogo';
import { useAppSettings } from '../context/AppSettingsContext';

const PharmacistDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { t } = useAppSettings();
  const navigate = useNavigate();
  
  // State Management
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'history'
  const [pendingBills, setPendingBills] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Billing Form State
  const [activeBillId, setActiveBillId] = useState(null);
  const [totalAmount, setTotalAmount] = useState('');
  const [quantityNotes, setQuantityNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'pending') {
        const response = await api.get('/pharmacist/pending-bills');
        setPendingBills(response.data);
      } else {
        const response = await api.get('/pharmacist/history');
        setHistory(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Refetch when tabs change

  const handleGenerateBill = async (e, ticket) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const dispensedMedicines = ticket.prescription.map(med => ({
        medicineName: med.medicineName,
        quantityOrMg: quantityNotes || 'As prescribed', 
        price: Number(totalAmount) / ticket.prescription.length 
      }));

      await api.post('/pharmacist/generate-bill', {
        treatmentId: ticket._id,
        dispensedMedicines,
        totalBillAmount: Number(totalAmount)
      });

      alert("Bill Generated! AMU Data has been securely logged for Government Analytics.");
      setActiveBillId(null);
      setTotalAmount('');
      setQuantityNotes('');
      fetchData(); // Refresh the list
    } catch (error) {
      alert(error.response?.data?.message || "Error generating bill");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading && pendingBills.length === 0 && history.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      
      <nav className="bg-white border-b border-slate-200 px-6 md:px-10 py-4 flex justify-between items-center shadow-sm w-full sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-100 p-1.5 text-emerald-700">
            <MeditrackLogo className="h-11 w-11" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">
            {t('pharmacy')}
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-slate-800">{user?.name}</p>
            <p className="text-xs text-emerald-600 font-bold">{user?.city} Branch</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold transition-all">
            <LogOut size={18} />
            <span className="hidden md:inline">{t('signOut')}</span>
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto mt-8 px-4">
        
        {/* TOP TOGGLE ROW */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {activeTab === 'pending' ? 'Pending Prescriptions' : 'Billing History'}
            </h2>
            <p className="text-slate-500">
              {activeTab === 'pending' ? 'Farmers waiting to pick up their medicines.' : 'Secure log of all AMU data processed by you.'}
            </p>
          </div>

          <div className="flex bg-slate-200 p-1 rounded-xl w-full md:w-auto">
            <button 
              onClick={() => setActiveTab('pending')}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'pending' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Active Queue
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'history' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Clock size={16} /> Bill Logs
            </button>
          </div>
        </div>

        {/* TAB 1: PENDING BILLS */}
        {activeTab === 'pending' && (
          pendingBills.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm flex flex-col items-center">
              <CheckCircle size={64} className="text-green-400 mb-4" />
              <h3 className="text-xl font-bold text-slate-700">Queue Empty</h3>
              <p className="text-slate-500">All prescriptions in {user?.city} have been billed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {pendingBills.map((ticket) => (
                <div key={ticket._id} className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm transition-all hover:shadow-md flex flex-col md:flex-row">
                  
                  <div className="p-6 md:w-2/3 border-b md:border-b-0 md:border-r border-slate-100">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">
                          Farmer: {ticket.farmer?.name}
                        </h3>
                        <p className="text-slate-500 font-medium">Ph: {ticket.farmer?.phoneNumber}</p>
                      </div>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-1">
                        <Receipt size={14} /> Unpaid
                      </span>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Prescribed by Dr. {ticket.vet?.name}</p>
                      <ul className="space-y-2">
                        {ticket.prescription.map((med, idx) => (
                          <li key={idx} className="flex justify-between items-center text-sm">
                            <span className="font-bold text-slate-700">{med.medicineName}</span>
                            <span className="text-slate-500">{med.dosage}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-6 md:w-1/3 bg-emerald-50/30 flex flex-col justify-center">
                    {activeBillId === ticket._id ? (
                      <form onSubmit={(e) => handleGenerateBill(e, ticket)} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Total Amount (₹)</label>
                          <input type="number" required min="1" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:border-emerald-500 font-bold" placeholder="e.g. 450" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Quantity Dispensed</label>
                          <input type="text" required value={quantityNotes} onChange={e => setQuantityNotes(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:border-emerald-500" placeholder="e.g. 2 Bottles" />
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setActiveBillId(null)} className="px-4 py-3 text-slate-500 hover:bg-slate-100 rounded-xl font-bold transition-all">Cancel</button>
                          <button type="submit" disabled={isSubmitting} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all disabled:opacity-70">
                            {isSubmitting ? 'Processing...' : 'Collect Pay'}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="text-center">
                        <AlertCircle className="mx-auto text-emerald-500 mb-2" size={32} />
                        <p className="text-sm text-slate-600 font-medium mb-4">Medicines are ready for pickup. Bill needs to be generated.</p>
                        <button 
                          onClick={() => setActiveBillId(ticket._id)}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all transform hover:-translate-y-0.5"
                        >
                          <CreditCard size={18} /> Process Bill
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )
        )}

        {/* TAB 2: BILLING HISTORY */}
        {activeTab === 'history' && (
          history.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm flex flex-col items-center">
              <Clock size={64} className="text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-700">No History Found</h3>
              <p className="text-slate-500">You haven't processed any bills yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {history.map((log) => (
                <div key={log._id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                  
                  <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <FileCheck className="text-green-500" size={20} /> Bill Paid
                      </h3>
                      <p className="text-slate-500 text-sm mt-1">Farmer: {log.treatment?.farmer?.name || 'Unknown'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-extrabold text-emerald-700">Rs. {log.totalBillAmount}</p>
                      <p className="text-xs font-bold text-slate-400 mt-1">{new Date(log.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-slate-400 uppercase text-xs block mb-2">Medicines Dispensed (AMU Logged)</span>
                    <ul className="space-y-2">
                      {log.dispensedMedicines.map((med, idx) => (
                        <li key={idx} className="flex justify-between items-center text-sm bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="font-bold text-slate-700">{med.medicineName}</span>
                          <span className="text-slate-500 font-medium">{med.quantityOrMg}</span>
                        </li>
                      ))}
                    </ul>
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

export default PharmacistDashboard;
