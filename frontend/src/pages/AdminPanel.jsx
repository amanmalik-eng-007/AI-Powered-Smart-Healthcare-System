import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast, ToastContainer } from 'react-toastify';
import { ShieldAlert, CheckCircle, XCircle, Users, Activity, Terminal } from 'lucide-react';

const AdminPanel = () => {
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('doctors');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [docRes, patRes, logRes] = await Promise.all([
        adminAPI.getDoctors(),
        adminAPI.getPatients(),
        adminAPI.getLogs()
      ]);

      if (docRes.data.success) setDoctors(docRes.data.doctors);
      if (patRes.data.success) setPatients(patRes.data.patients);
      if (logRes.data.success) setLogs(logRes.data.logs);
    } catch (err) {
      toast.error('Failed to retrieve administrator directory records');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await adminAPI.updateDoctorStatus(id, status);
      if (res.data.success) {
        toast.success(`Doctor profile status set to ${status}`);
        // Update local state list
        setDoctors(prev =>
          prev.map(doc => (doc._id === id ? { ...doc, status } : doc))
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval state change failed');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar />
        <div className="flex-1 flex flex-col pl-0 lg:pl-64">
          <Navbar title="Admin Panel" />
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
        <Navbar title="System Administration" />

        <main className="flex-1 p-6 space-y-8 max-w-7xl w-full mx-auto">
          {/* Tab buttons */}
          <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-1.5 rounded-2xl w-fit space-x-1">
            <button
              onClick={() => setActiveTab('doctors')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'doctors'
                  ? 'bg-teal-700 text-white active-pulse shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Verify Doctors ({doctors.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('patients')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'patients'
                  ? 'bg-teal-700 text-white active-pulse shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Registered Patients ({patients.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'logs'
                  ? 'bg-teal-700 text-white active-pulse shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Security Audit Logs</span>
            </button>
          </div>

          {/* Tab 1: Doctors Verification */}
          {activeTab === 'doctors' && (
            <div className="glass-card">
              <h3 className="font-bold text-slate-800 dark:text-white mb-6">Doctor Registry approvals</h3>
              {doctors.length === 0 ? (
                <p className="text-sm text-slate-400">No medical professionals registered.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold">
                        <th className="pb-3">Name</th>
                        <th className="pb-3">Specialization</th>
                        <th className="pb-3">Experience</th>
                        <th className="pb-3">Consultation Fees</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {doctors.map(doc => (
                        <tr key={doc._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="py-4 font-semibold text-slate-800 dark:text-slate-100">
                            {doc.user ? doc.user.name : 'Unknown User'}
                            <p className="text-[10px] text-slate-400 font-medium">{doc.user?.email}</p>
                          </td>
                          <td className="py-4">{doc.specialization}</td>
                          <td className="py-4 font-medium text-slate-700 dark:text-slate-300">{doc.experience} Years</td>
                          <td className="py-4 font-medium text-teal-600 dark:text-teal-400">${doc.fees}</td>
                          <td className="py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              doc.status === 'approved' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 border border-emerald-100' :
                              doc.status === 'rejected' ? 'bg-red-50 dark:bg-red-950/20 text-red-700 border border-red-100' :
                              'bg-amber-50 dark:bg-amber-950/20 text-amber-700 border border-amber-100'
                            }`}>
                              {doc.status}
                            </span>
                          </td>
                          <td className="py-4 text-right space-x-2">
                            {doc.status !== 'approved' && (
                              <button
                                onClick={() => handleStatusChange(doc._id, 'approved')}
                                className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                            )}
                            {doc.status !== 'rejected' && (
                              <button
                                onClick={() => handleStatusChange(doc._id, 'rejected')}
                                className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-red-500 hover:bg-red-400 text-white rounded-lg text-xs font-semibold shadow-sm"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Patients directory */}
          {activeTab === 'patients' && (
            <div className="glass-card">
              <h3 className="font-bold text-slate-800 dark:text-white mb-6">Patient Registry Database</h3>
              {patients.length === 0 ? (
                <p className="text-sm text-slate-400">No patient entries logged.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold">
                        <th className="pb-3">Name</th>
                        <th className="pb-3">Email Address</th>
                        <th className="pb-3">Age</th>
                        <th className="pb-3">Gender</th>
                        <th className="pb-3">Blood Group</th>
                        <th className="pb-3">Medical History Log</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {patients.map(pat => (
                        <tr key={pat._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="py-4 font-semibold text-slate-800 dark:text-slate-100">
                            {pat.user ? pat.user.name : 'Unknown Patient'}
                          </td>
                          <td className="py-4 text-slate-500 dark:text-slate-400">{pat.user?.email}</td>
                          <td className="py-4 font-semibold text-slate-700 dark:text-slate-300">{pat.age || 'N/A'} Years</td>
                          <td className="py-4">{pat.gender || 'N/A'}</td>
                          <td className="py-4 font-bold text-teal-600 dark:text-teal-400">{pat.bloodGroup || 'N/A'}</td>
                          <td className="py-4 max-w-[200px] truncate text-xs text-slate-400 font-medium">
                            {pat.medicalHistory && pat.medicalHistory.length > 0 ? pat.medicalHistory.join(', ') : 'None Registered'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Security Logs */}
          {activeTab === 'logs' && (
            <div className="glass-card space-y-4">
              <div className="flex items-center space-x-2 text-slate-700 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4">
                <ShieldAlert className="w-5 h-5 text-indigo-500 animate-pulse" />
                <h3 className="font-bold">System Operations & Security Logs</h3>
              </div>
              <div className="bg-slate-900/90 text-teal-400 font-mono text-xs rounded-2xl p-6 overflow-y-auto max-h-96 space-y-3 leading-relaxed border border-slate-800 shadow-2xl">
                {logs.map((log, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/50 pb-2 gap-2">
                    <div>
                      <span className="text-slate-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                      <span className={`font-bold ${log.type === 'WARNING' ? 'text-amber-500' : 'text-emerald-400'}`}>
                        {log.type}
                      </span>{' '}
                      <span className="text-slate-200">{log.event}</span>
                    </div>
                    <span className="text-slate-500 text-[10px]">Actor: {log.user}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
