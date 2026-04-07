import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/authContextCore';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { LogOut, PlusCircle, Activity, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import AIReportPanel from '../components/AIReportPanel';
import MeditrackLogo from '../components/MeditrackLogo';
import { useAppSettings } from '../context/AppSettingsContext';

const FarmerDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { t } = useAppSettings();
  const navigate = useNavigate();
  
  const [animals, setAnimals] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [animalId, setAnimalId] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [animalRes, treatmentRes] = await Promise.all([
        api.get('/animals/my-animals'),
        api.get('/treatments/my-requests')
      ]);
      setAnimals(animalRes.data);
      setTreatments(treatmentRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/treatments/request', {
        animalId,
        symptomsDescription: symptoms,
        imageUrl: "", // We will add file uploads later if needed
        voiceNoteUrl: "" 
      });
      // Clear form and refresh list
      setAnimalId('');
      setSymptoms('');
      fetchData(); 
      alert(t('treatmentRequestSuccess'));
    } catch (error) {
      alert(error.response?.data?.message || t('treatmentRequestError'));
    } finally {
      setIsSubmitting(false);
    }
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
      
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 px-6 md:px-10 py-4 flex justify-between items-center shadow-sm w-full sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-green-100 p-1.5 text-green-700">
            <MeditrackLogo className="h-11 w-11" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-green-800">
            {t('farmerCare')}
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-slate-800">{user?.name}</p>
            <p className="text-xs text-slate-500 font-medium">{t('registeredFarmer')}</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold transition-all">
            <LogOut size={18} />
            <span className="hidden md:inline">{t('signOut')}</span>
          </button>
        </div>
      </nav>

      <main className="w-full px-4 md:px-8 lg:px-12 py-8 mx-auto space-y-8">
        <AIReportPanel title={t('myMedicineAdherenceReport')} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Request New Treatment Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 sticky top-28">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <PlusCircle className="text-green-600" /> {t('askVetHelp')}
            </h2>
            
            <form onSubmit={handleSubmitRequest} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{t('selectAnimal')}</label>
                <select 
                  required
                  value={animalId}
                  onChange={(e) => setAnimalId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                >
                  <option value="">{t('chooseFromHerd')}</option>
                  {animals.map(animal => (
                    <option key={animal._id} value={animal._id}>
                      {animal.animalId} - {animal.animalType} ({animal.breed})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{t('describeSymptoms')}</label>
                <textarea 
                  required
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder={t('symptomsPlaceholder')}
                  rows="4"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all resize-none"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-green-200 transition-all disabled:opacity-70"
              >
                {isSubmitting ? t('sendingAlert') : t('submitRequest')}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Treatment History */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 min-h-[500px]">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Clock className="text-blue-600" /> {t('treatmentHistory')}
            </h2>

            {treatments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Activity size={48} className="mb-4 opacity-50" />
                <p>{t('noTreatmentRecords')}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {treatments.map((ticket) => (
                  <div key={ticket._id} className="border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-all bg-slate-50/50">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg">
                          {ticket.animal?.animalType} ({ticket.animal?.animalId})
                        </h3>
                        <p className="text-sm text-slate-500">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                      </div>
                      
                      {/* Status Badge */}
                      <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                        ticket.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                        ticket.status === 'Accepted' ? 'bg-blue-100 text-blue-700' : 
                        'bg-green-100 text-green-700'
                      }`}>
                        {ticket.status === 'Completed' ? <CheckCircle size={14} /> : <Clock size={14} />}
                        {t(`status${ticket.status}`)}
                      </span>
                    </div>
                    
                    <p className="text-slate-700 mb-4 bg-white p-3 rounded-xl border border-slate-100">
                      <span className="font-semibold block text-xs text-slate-400 uppercase mb-1">{t('symptomsReported')}</span>
                      "{ticket.symptomsDescription}"
                    </p>

                    {/* Show Prescription if Completed */}
                    {ticket.status === 'Completed' && ticket.prescription?.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                          <CheckCircle size={16} className="text-green-600" /> {t('vetPrescription')} (Dr. {ticket.vet?.name})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {ticket.prescription.map((med, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                              <p className="font-bold text-blue-700">{med.medicineName}</p>
                              <p className="text-sm text-slate-600 mb-2">{med.dosage}</p>
                              {med.withdrawalPeriodDays > 0 && (
                                <p className="text-xs font-bold text-red-600 bg-red-50 p-2 rounded-lg flex items-center gap-1">
                                  <AlertTriangle size={14} /> {t('withdrawal')}: {med.withdrawalPeriodDays} {t('days')}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        </div>
      </main>
    </div>
  );
};

export default FarmerDashboard;
