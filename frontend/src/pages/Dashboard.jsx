import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { adminAPI, doctorAPI, appointmentAPI, prescriptionAPI, reportAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast, ToastContainer } from 'react-toastify';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import {
  Calendar, Users, DollarSign, Activity, FileText, ClipboardList,
  AlertTriangle, CheckCircle2, Clock, Ban, ArrowRight, BrainCircuit
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  
  // Shared & Role Specific States
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptionsCount, setPrescriptionsCount] = useState(0);
  const [reportsCount, setReportsCount] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (user.role === 'admin') {
        const res = await adminAPI.getStats();
        if (res.data.success) {
          setStats(res.data.stats);
          setCharts(res.data.charts);
        }
      } else if (user.role === 'doctor') {
        const res = await doctorAPI.getAppointments();
        if (res.data.success) {
          setAppointments(res.data.appointments);
        }
      } else if (user.role === 'patient') {
        // Fetch appointments, prescriptions, and reports counts
        const [appRes, prescRes, repRes] = await Promise.all([
          appointmentAPI.getMy(),
          prescriptionAPI.getMy(),
          reportAPI.getMy()
        ]);
        if (appRes.data.success) setAppointments(appRes.data.appointments);
        if (prescRes.data.success) setPrescriptionsCount(prescRes.data.prescriptions.length);
        if (repRes.data.success) setReportsCount(repRes.data.reports.length);
      }
    } catch (err) {
      console.error('Error fetching dashboard info:', err);
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentAction = async (id, status) => {
    try {
      const res = await appointmentAPI.updateStatus(id, status);
      if (res.data.success) {
        toast.success(`Appointment marked as ${status}`);
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar />
        <div className="flex-1 flex flex-col pl-0 lg:pl-64">
          <Navbar title="Loading Hub..." />
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  // COLORS FOR PIE CHART
  const COLORS = ['#0d9488', '#06b6d4', '#10b981', '#f59e0b', '#6366f1'];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <Sidebar />

      {/* Main Body */}
      <div className="flex-1 flex flex-col pl-0 lg:pl-64">
        <Navbar title="Analytics Dashboard" />

        <main className="flex-1 p-6 space-y-8 max-w-7xl w-full mx-auto">
          {/* Header message */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Hello, {user.name}</h1>
              <p className="text-xs text-slate-400 font-medium">Here is your clinical metrics overview for today.</p>
            </div>
            {user.role === 'patient' && (
              <Link to="/appointments" className="px-5 py-2.5 bg-teal-700 hover:bg-teal-600 text-white rounded-xl text-xs font-semibold shadow-lg shadow-teal-700/10 active:scale-95 transition-all flex items-center gap-2 w-fit">
                <span>Book Appointment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* ================= ADMIN VIEW ================= */}
          {user.role === 'admin' && stats && (
            <>
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Doctors</span>
                    <h3 className="text-2xl font-extrabold mt-1 text-slate-800 dark:text-white">{stats.doctorsCount}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/20 text-teal-600 flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                <div className="glass-card flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Patients</span>
                    <h3 className="text-2xl font-extrabold mt-1 text-slate-800 dark:text-white">{stats.patientsCount}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/20 text-cyan-500 flex items-center justify-center">
                    <Activity className="w-6 h-6" />
                  </div>
                </div>

                <div className="glass-card flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Appointments</span>
                    <h3 className="text-2xl font-extrabold mt-1 text-slate-800 dark:text-white">{stats.appointmentsCount}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>

                <div className="glass-card flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Platform Revenue</span>
                    <h3 className="text-2xl font-extrabold mt-1 text-slate-800 dark:text-white">${stats.totalRevenue}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-yellow-50 dark:bg-yellow-950/20 text-yellow-500 flex items-center justify-center">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              {charts && (
                <div className="grid lg:grid-cols-12 gap-8">
                  {/* Line Chart */}
                  <div className="glass-card lg:col-span-8 space-y-4">
                    <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Booking History (Monthly)</h3>
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={charts.appointmentsByMonth}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                          <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }} />
                          <Line type="monotone" dataKey="appointments" stroke="#0f766e" strokeWidth={3} dot={{ fill: '#0f766e', r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Pie Chart */}
                  <div className="glass-card lg:col-span-4 space-y-4 flex flex-col justify-between">
                    <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Disease Distribution</h3>
                    <div className="h-56 w-full flex justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={charts.diseaseStats}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {charts.diseaseStats.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Pie Legends */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {charts.diseaseStats.map((entry, idx) => (
                        <div key={entry.name} className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                          <span className="text-slate-500 dark:text-slate-400 truncate">{entry.name} ({entry.value}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ================= DOCTOR VIEW ================= */}
          {user.role === 'doctor' && (
            <div className="space-y-6">
              {/* Stats Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="glass-card flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-500 flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Pending Bookings</span>
                    <h4 className="text-xl font-bold mt-0.5">{appointments.filter(a => a.status === 'pending').length}</h4>
                  </div>
                </div>

                <div className="glass-card flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/20 text-teal-500 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Approved Bookings</span>
                    <h4 className="text-xl font-bold mt-0.5">{appointments.filter(a => a.status === 'accepted').length}</h4>
                  </div>
                </div>

                <div className="glass-card flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Completed Rounds</span>
                    <h4 className="text-xl font-bold mt-0.5">{appointments.filter(a => a.status === 'completed').length}</h4>
                  </div>
                </div>
              </div>

              {/* Appointments Management Table */}
              <div className="glass-card">
                <h3 className="font-bold text-slate-700 dark:text-white mb-6">Patient Consultation Queue</h3>
                {appointments.length === 0 ? (
                  <p className="text-sm text-slate-400">No scheduled appointments logged yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold">
                          <th className="pb-3">Patient Name</th>
                          <th className="pb-3">Date</th>
                          <th className="pb-3">Slot</th>
                          <th className="pb-3">Reason / Notes</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                        {appointments.map((app) => (
                          <tr key={app._id} className="text-slate-600 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                            <td className="py-3.5 font-semibold text-slate-800 dark:text-slate-100">
                              {app.patient?.user ? app.patient.user.name : 'Registered Patient'}
                            </td>
                            <td className="py-3.5">{new Date(app.date).toLocaleDateString()}</td>
                            <td className="py-3.5 font-medium text-teal-600 dark:text-teal-400">{app.timeSlot}</td>
                            <td className="py-3.5 max-w-[200px] truncate">{app.notes || 'N/A'}</td>
                            <td className="py-3.5">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                app.status === 'pending' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700' :
                                app.status === 'accepted' ? 'bg-teal-50 dark:bg-teal-950/20 text-teal-700' :
                                app.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700' :
                                'bg-red-50 dark:bg-red-950/20 text-red-700'
                              }`}>
                                {app.status}
                              </span>
                            </td>
                            <td className="py-3.5 text-right space-x-2">
                              {app.status === 'pending' && (
                                <>
                                  <button onClick={() => handleAppointmentAction(app._id, 'accepted')} className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold">
                                    Accept
                                  </button>
                                  <button onClick={() => handleAppointmentAction(app._id, 'rejected')} className="px-2.5 py-1.5 bg-red-500 hover:bg-red-400 text-white rounded-lg text-xs font-semibold">
                                    Reject
                                  </button>
                                </>
                              )}
                              {app.status === 'accepted' && (
                                <Link to={`/prescriptions?appointment=${app._id}`} className="inline-block px-3 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-semibold shadow-md">
                                  Prescribe / Complete
                                </Link>
                              )}
                              {app.status === 'completed' && (
                                <span className="text-xs text-slate-400 italic">No action required</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= PATIENT VIEW ================= */}
          {user.role === 'patient' && (
            <div className="space-y-6">
              {/* Quick Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="glass-card flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/20 text-teal-500 flex items-center justify-center shrink-0">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Appointments booked</span>
                    <h4 className="text-xl font-bold mt-0.5">{appointments.length}</h4>
                  </div>
                </div>

                <div className="glass-card flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/20 text-cyan-500 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Prescriptions Received</span>
                    <h4 className="text-xl font-bold mt-0.5">{prescriptionsCount}</h4>
                  </div>
                </div>

                <div className="glass-card flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 flex items-center justify-center shrink-0">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Uploaded Lab Reports</span>
                    <h4 className="text-xl font-bold mt-0.5">{reportsCount}</h4>
                  </div>
                </div>
              </div>

              {/* Booking status alert banner */}
              {appointments.filter(a => a.status === 'pending').length > 0 && (
                <div className="flex items-center space-x-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/15 border border-amber-200 dark:border-amber-900/30 text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <div className="text-xs">
                    <p className="font-semibold">Pending Approvals</p>
                    <p className="opacity-90">You have {appointments.filter(a => a.status === 'pending').length} appointment request(s) awaiting doctor confirmation.</p>
                  </div>
                </div>
              )}

              {/* AI symptom helper prompt banner */}
              <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-gradient-to-r from-teal-800 to-teal-700 text-white rounded-3xl shadow-xl shadow-teal-800/10 gap-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-teal-200">
                    <BrainCircuit className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Not feeling well today?</h4>
                    <p className="text-xs text-teal-100 mt-0.5">Use our automated symptom checker to find recommended medical specializations instantly.</p>
                  </div>
                </div>
                <Link to="/ai-assistant" className="px-5 py-2.5 bg-white text-teal-800 hover:bg-teal-50 rounded-xl text-xs font-semibold shadow-md active:scale-95 transition-all text-center">
                  Consult AI Agent
                </Link>
              </div>

              {/* Recent Bookings Schedule */}
              <div className="glass-card">
                <h3 className="font-bold text-slate-700 dark:text-white mb-6">Your Upcoming Consultations</h3>
                {appointments.length === 0 ? (
                  <p className="text-sm text-slate-400">No active bookings recorded. Search doctors to book a slot.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold">
                          <th className="pb-3">Doctor</th>
                          <th className="pb-3">Specialization</th>
                          <th className="pb-3">Date</th>
                          <th className="pb-3">Time slot</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                        {appointments.slice(0, 5).map((app) => (
                          <tr key={app._id} className="text-slate-600 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                            <td className="py-3.5 font-semibold text-slate-800 dark:text-slate-100">
                              Dr. {app.doctor?.user?.name || 'Specialist'}
                            </td>
                            <td className="py-3.5">{app.doctor?.specialization || 'Clinical'}</td>
                            <td className="py-3.5">{new Date(app.date).toLocaleDateString()}</td>
                            <td className="py-3.5 font-medium text-teal-600 dark:text-teal-400">{app.timeSlot}</td>
                            <td className="py-3.5">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                app.status === 'pending' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700' :
                                app.status === 'accepted' ? 'bg-teal-50 dark:bg-teal-950/20 text-teal-700' :
                                app.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700' :
                                'bg-red-50 dark:bg-red-950/20 text-red-700'
                              }`}>
                                {app.status}
                              </span>
                            </td>
                            <td className="py-3.5 text-right">
                              {['pending', 'accepted'].includes(app.status) ? (
                                <button onClick={() => handleAppointmentAction(app._id, 'cancelled')} className="px-2.5 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 rounded-lg text-xs font-semibold transition-colors">
                                  Cancel Booking
                                </button>
                              ) : (
                                <span className="text-xs text-slate-400 italic">Closed</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
