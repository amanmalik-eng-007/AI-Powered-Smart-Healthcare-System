import React, { useContext, useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { prescriptionAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast, ToastContainer } from 'react-toastify';
import { Plus, Trash2, FileText, Download, User, Activity, AlertCircle } from 'lucide-react';

const Prescriptions = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetAppointmentId = searchParams.get('appointment');

  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState([]);

  // Create Prescription Form States
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', frequency: '1-0-1', duration: '5 days' }]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const res = await prescriptionAPI.getMy();
      if (res.data.success) {
        setPrescriptions(res.data.prescriptions);
      }
    } catch (err) {
      toast.error('Failed to load prescriptions list');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicineRow = () => {
    setMedicines(prev => [...prev, { name: '', dosage: '', frequency: '1-0-1', duration: '5 days' }]);
  };

  const handleRemoveMedicineRow = (index) => {
    if (medicines.length === 1) return toast.warn('A prescription requires at least 1 medicine row');
    setMedicines(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    setMedicines(prev =>
      prev.map((med, idx) => (idx === index ? { ...med, [field]: value } : med))
    );
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    if (!targetAppointmentId) return toast.error('No associated appointment linked');

    // Validation
    const emptyMed = medicines.some(m => !m.name || !m.dosage || !m.frequency || !m.duration);
    if (emptyMed) return toast.warn('Please complete all medicine inputs');

    try {
      const res = await prescriptionAPI.create({
        appointmentId: targetAppointmentId,
        medicines,
        notes
      });

      if (res.data.success) {
        toast.success('Prescription generated successfully! Appointment completed.');
        // Reset form
        setMedicines([{ name: '', dosage: '', frequency: '1-0-1', duration: '5 days' }]);
        setNotes('');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate prescription');
    }
  };

  const triggerPDFDownload = (id) => {
    const pdfUrl = prescriptionAPI.downloadPDF(id);
    window.open(pdfUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar />
        <div className="flex-1 flex flex-col pl-0 lg:pl-64">
          <Navbar title="Prescriptions Hub" />
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <Sidebar />

      <div className="flex-1 flex flex-col pl-0 lg:pl-64">
        <Navbar title="Electronic Prescriptions Hub" />

        <main className="flex-1 p-6 space-y-8 max-w-7xl w-full mx-auto">
          {/* Doctor Write Mode: Only active when targeting an appointment */}
          {user.role === 'doctor' && targetAppointmentId && (
            <div className="glass-card space-y-6">
              <div className="flex items-center space-x-2 text-teal-700 dark:text-teal-400 border-b border-slate-100 dark:border-slate-800 pb-3">
                <FileText className="w-5 h-5 animate-pulse" />
                <h3 className="font-bold">Write Clinical Prescription</h3>
              </div>

              <form onSubmit={handlePrescriptionSubmit} className="space-y-4">
                {/* Medicines List Rows */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Prescribed Medicines</label>
                  
                  {medicines.map((med, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      <div className="sm:col-span-4">
                        <input
                          type="text"
                          required
                          placeholder="Medicine Name (e.g. Paracetamol 650mg)"
                          value={med.name}
                          onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none text-slate-800 dark:text-slate-200"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <input
                          type="text"
                          required
                          placeholder="Dosage (e.g. 1 tab / 5ml)"
                          value={med.dosage}
                          onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none text-slate-800 dark:text-slate-200"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <select
                          value={med.frequency}
                          onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                          className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none text-slate-800 dark:text-slate-200"
                        >
                          <option value="1-0-1">1-0-1 (Twice Daily)</option>
                          <option value="1-1-1">1-1-1 (Thrice Daily)</option>
                          <option value="1-0-0">1-0-0 (Morning Only)</option>
                          <option value="0-0-1">0-0-1 (Night Only)</option>
                          <option value="SOS">SOS (As Required)</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          required
                          placeholder="Duration (e.g. 5 days)"
                          value={med.duration}
                          onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none text-slate-800 dark:text-slate-200"
                        />
                      </div>
                      <div className="sm:col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicineRow(index)}
                          className="p-2 border border-slate-200 dark:border-slate-800 text-red-500 hover:text-white hover:bg-red-500 rounded-xl transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddMedicineRow}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 border border-dashed border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-950/20 text-teal-600 dark:text-teal-400 rounded-lg text-xs font-semibold mt-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Medicine Row</span>
                  </button>
                </div>

                {/* Notes Field */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Instructions / Clinical Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Provide dietary guidelines, lifestyle changes, or clinical warning advice..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-600 hover:to-teal-500 text-white font-semibold rounded-xl text-xs shadow-md active:scale-95 transition-all text-center"
                  >
                    Publish electronic prescription
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/appointments')}
                    className="px-6 py-3 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Prescriptions List view */}
          <div className="glass-card">
            <h3 className="font-bold text-slate-850 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
              Clinical Prescription History
            </h3>

            {prescriptions.length === 0 ? (
              <p className="text-sm text-slate-400 py-10 text-center">No prescriptions found on file.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {prescriptions.map((presc) => (
                  <div key={presc._id} className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 hover:border-teal-500/30 transition-all flex flex-col justify-between space-y-4">
                    {/* Header info */}
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-teal-600" />
                          <span className="font-bold text-sm text-slate-800 dark:text-white">
                            {user.role === 'patient'
                              ? `Dr. ${presc.doctor?.user?.name || 'Expert'}`
                              : `Patient: ${presc.patient?.user?.name || 'Registered User'}`}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {new Date(presc.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {/* Specialization if patient */}
                      {user.role === 'patient' && (
                        <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider block mt-1">
                          {presc.doctor?.specialization}
                        </span>
                      )}

                      {/* Medicines checklist Summary */}
                      <div className="mt-4 space-y-2.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Rx Prescribed Dosage</span>
                        <div className="space-y-1.5">
                          {presc.medicines.map((med, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-350 bg-white dark:bg-slate-950 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-900">
                              <span className="font-semibold text-slate-700 dark:text-slate-200 truncate pr-2">{med.name}</span>
                              <div className="flex space-x-3 shrink-0 text-[10px] font-bold">
                                <span className="text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 px-2 py-0.5 rounded">{med.dosage}</span>
                                <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded">{med.frequency}</span>
                                <span className="text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{med.duration}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Notes summary */}
                      {presc.notes && (
                        <div className="mt-4 text-xs text-slate-500 bg-slate-100 dark:bg-slate-850 p-3 rounded-xl flex items-start space-x-2">
                          <AlertCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                          <p className="leading-relaxed"><strong className="text-slate-700 dark:text-slate-300">Clinician Advice: </strong>{presc.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* PDF Download Button */}
                    <button
                      onClick={() => triggerPDFDownload(presc._id)}
                      className="w-full py-2.5 border border-teal-600/30 hover:border-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/20 text-teal-700 dark:text-teal-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PDF Prescription</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Prescriptions;
