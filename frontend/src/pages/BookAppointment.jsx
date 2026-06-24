import React, { useContext, useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { appointmentAPI, patientAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast, ToastContainer } from 'react-toastify';
import { Calendar, Clock, Edit2, Trash2, CheckCircle, XCircle, Info, CalendarClock, User } from 'lucide-react';

const BookAppointment = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedDoctor = searchParams.get('doctor');

  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // Booking Form States
  const [selectedDocId, setSelectedDocId] = useState(preselectedDoctor || '');
  const [bookingDate, setBookingDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('09:00 AM');
  const [notes, setNotes] = useState('');

  // Rescheduling modal states
  const [reschedulingApp, setReschedulingApp] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState('09:00 AM');

  // Available Time Slots Mock (matching doctor availability slots)
  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM',
    '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'
  ];

  useEffect(() => {
    fetchData();
  }, [preselectedDoctor]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appRes, docRes] = await Promise.all([
        appointmentAPI.getMy(),
        user.role === 'patient' ? patientAPI.getDoctors() : Promise.resolve({ data: { success: true, doctors: [] } })
      ]);

      if (appRes.data.success) setAppointments(appRes.data.appointments);
      if (docRes.data.success) setDoctors(docRes.data.doctors);
      if (preselectedDoctor) setSelectedDocId(preselectedDoctor);
    } catch (err) {
      toast.error('Failed to load appointment schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDocId || !bookingDate || !timeSlot) {
      return toast.warn('Please complete all form fields');
    }

    try {
      const res = await appointmentAPI.book({
        doctorId: selectedDocId,
        date: bookingDate,
        timeSlot,
        notes
      });

      if (res.data.success) {
        toast.success('Appointment scheduled successfully!');
        // Reset form
        setBookingDate('');
        setNotes('');
        setSelectedDocId('');
        // Remove query parameter
        navigate('/appointments', { replace: true });
        // Refresh list
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Timeslot already booked or invalid credentials');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const res = await appointmentAPI.cancel(id);
      if (res.data.success) {
        toast.success('Appointment cancelled successfully');
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to cancel appointment');
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!newDate || !newSlot) return toast.warn('Specify reschedule parameters');

    try {
      const res = await appointmentAPI.reschedule(reschedulingApp._id, newDate, newSlot);
      if (res.data.success) {
        toast.success('Reschedule request placed successfully');
        setReschedulingApp(null);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reschedule');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await appointmentAPI.updateStatus(id, status);
      if (res.data.success) {
        toast.toast ? toast.toast(`Status updated to ${status}`) : toast.success(`Status updated to ${status}`);
        fetchData();
      }
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar />
        <div className="flex-1 flex flex-col pl-0 lg:pl-64">
          <Navbar title="Appointments Console" />
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
        <Navbar title="Clinical Appointments Console" />

        <main className="flex-1 p-6 space-y-8 max-w-7xl w-full mx-auto">
          {/* Scheduling split grid for Patients */}
          {user.role === 'patient' && (
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Form container */}
              <div className="glass-card lg:col-span-5 space-y-4">
                <div className="flex items-center space-x-2 text-teal-700 dark:text-teal-400 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <CalendarClock className="w-5 h-5" />
                  <h3 className="font-bold">Book New Consultation</h3>
                </div>

                <form onSubmit={handleBookSubmit} className="space-y-4 text-xs">
                  {/* Select Doctor */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Select Doctor</label>
                    <select
                      value={selectedDocId}
                      onChange={(e) => setSelectedDocId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none text-slate-800 dark:text-slate-200 text-xs"
                    >
                      <option value="">Choose a specialist...</option>
                      {doctors.map((doc) => (
                        <option key={doc._id} value={doc._id}>
                          Dr. {doc.user?.name} ({doc.specialization} - ${doc.fees})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Consultation Date</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none text-slate-800 dark:text-slate-200 text-xs"
                    />
                  </div>

                  {/* Time slots radio list */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Select time slot</label>
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setTimeSlot(slot)}
                          className={`py-2 rounded-lg text-center border font-semibold text-[10px] transition-all ${
                            timeSlot === slot
                              ? 'bg-teal-700 text-white border-teal-700 active-pulse'
                              : 'bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Symptoms description / notes</label>
                    <textarea
                      rows={3}
                      placeholder="Mention any symptoms or background history..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none text-slate-800 dark:text-slate-200 text-xs"
                    />
                  </div>

                  {/* Book button */}
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-teal-700 to-teal-600 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-teal-500 shadow-lg active:scale-95 transition-all text-xs"
                  >
                    Confirm Booking Schedule
                  </button>
                </form>
              </div>

              {/* Appointments List for Patients */}
              <div className="glass-card lg:col-span-7 space-y-4">
                <h3 className="font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                  Your Consultation Schedules
                </h3>

                {appointments.length === 0 ? (
                  <p className="text-sm text-slate-400 py-10 text-center">No appointments booked yet.</p>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((app) => (
                      <div key={app._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-850 dark:text-white">
                              Dr. {app.doctor?.user?.name || 'Clinical Specialist'}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] uppercase font-bold">
                              {app.doctor?.specialization}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                            <span className="flex items-center space-x-1.5">
                              <Calendar className="w-3.5 h-3.5 text-teal-600" />
                              <span>{new Date(app.date).toLocaleDateString()}</span>
                            </span>
                            <span className="flex items-center space-x-1.5">
                              <Clock className="w-3.5 h-3.5 text-teal-600" />
                              <span>{app.timeSlot}</span>
                            </span>
                          </div>
                          {app.notes && (
                            <p className="text-xs text-slate-450 mt-2 bg-white dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-900 leading-relaxed max-w-md">
                              <span className="font-bold text-slate-400 text-[10px] block uppercase">Notes:</span>
                              {app.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center space-x-3 self-end md:self-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            app.status === 'pending' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700' :
                            app.status === 'accepted' ? 'bg-teal-50 dark:bg-teal-950/20 text-teal-700' :
                            app.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700' :
                            'bg-red-50 dark:bg-red-950/20 text-red-700'
                          }`}>
                            {app.status}
                          </span>

                          {['pending', 'accepted'].includes(app.status) && (
                            <div className="flex items-center space-x-1.5">
                              <button
                                onClick={() => setReschedulingApp(app)}
                                title="Reschedule"
                                className="p-2 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                              >
                                <Edit2 className="w-4.5 h-4.5" />
                              </button>
                              <button
                                onClick={() => handleCancel(app._id)}
                                title="Cancel Appointment"
                                className="p-2 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all"
                              >
                                <Trash2 className="w-4.5 h-4.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Doctors Queue Panel */}
          {user.role === 'doctor' && (
            <div className="glass-card space-y-4">
              <h3 className="font-bold text-slate-850 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                Incoming Consultation Appointments
              </h3>

              {appointments.length === 0 ? (
                <p className="text-sm text-slate-400 py-10 text-center">No appointments booked with you.</p>
              ) : (
                <div className="space-y-4">
                  {appointments.map((app) => (
                    <div key={app._id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-teal-600" />
                          <span className="font-bold text-slate-850 dark:text-white">
                            {app.patient?.user?.name || 'Registered Patient'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-bold">
                            Age: {app.patient?.age || 'N/A'} | Gender: {app.patient?.gender || 'N/A'}
                          </span>
                        </div>
                        <div className="flex space-x-4 mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                          <span>Date: {new Date(app.date).toLocaleDateString()}</span>
                          <span className="text-teal-600 dark:text-teal-400 font-semibold">{app.timeSlot}</span>
                        </div>
                        {app.notes && (
                          <div className="mt-3 text-xs p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl leading-relaxed max-w-xl">
                            <span className="font-bold text-slate-400 text-[9px] uppercase tracking-wider block mb-1">Symptoms Checklist:</span>
                            {app.notes}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-3 self-end md:self-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          app.status === 'pending' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700' :
                          app.status === 'accepted' ? 'bg-teal-50 dark:bg-teal-950/20 text-teal-700' :
                          app.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700' :
                          'bg-red-50 dark:bg-red-950/20 text-red-700'
                        }`}>
                          {app.status}
                        </span>

                        {app.status === 'pending' && (
                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={() => handleStatusChange(app._id, 'accepted')}
                              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusChange(app._id, 'rejected')}
                              className="px-3 py-1.5 bg-red-500 hover:bg-red-450 text-white rounded-lg text-xs font-semibold"
                            >
                              Reject
                            </button>
                          </div>
                        )}

                        {app.status === 'accepted' && (
                          <button
                            onClick={() => navigate(`/prescriptions?appointment=${app._id}`)}
                            className="px-3 py-1.5 bg-teal-700 hover:bg-teal-650 text-white rounded-lg text-xs font-semibold shadow-md"
                          >
                            Diagnose & Prescribe
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Rescheduling Modal */}
          {reschedulingApp && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="glass-card w-full max-w-md p-6 space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-800 dark:text-white">Reschedule Appointment</h3>
                <p className="text-xs text-slate-400">Dr. {reschedulingApp.doctor?.user?.name}</p>

                <form onSubmit={handleRescheduleSubmit} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">New Date</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none text-slate-800 dark:text-slate-200 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">New Time Slot</label>
                    <select
                      value={newSlot}
                      onChange={(e) => setNewSlot(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none text-slate-800 dark:text-slate-200 text-xs"
                    >
                      {timeSlots.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-650 text-white font-semibold rounded-xl text-center"
                    >
                      Apply Reschedule
                    </button>
                    <button
                      type="button"
                      onClick={() => setReschedulingApp(null)}
                      className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 rounded-xl text-center"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BookAppointment;
