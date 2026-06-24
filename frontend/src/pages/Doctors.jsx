import React, { useEffect, useState } from 'react';
import { patientAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast, ToastContainer } from 'react-toastify';
import { Link } from 'react-router-dom';
import { Search, Star, DollarSign, Calendar, Clock, Award, FilterX } from 'lucide-react';

const Doctors = () => {
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  
  // Search Filter States
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState('');
  const [maxFees, setMaxFees] = useState('');
  const [day, setDay] = useState('');
  const [minRating, setMinRating] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const params = {};
      if (specialization) params.specialization = specialization;
      if (experience) params.experience = experience;
      if (maxFees) params.maxFees = maxFees;
      if (day) params.day = day;
      if (minRating) params.minRating = minRating;

      const res = await patientAPI.getDoctors(params);
      if (res.data.success) {
        setDoctors(res.data.doctors);
      }
    } catch (err) {
      toast.error('Failed to load clinic directory');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSpecialization('');
    setExperience('');
    setMaxFees('');
    setDay('');
    setMinRating('');
    // Re-fetch everything
    setTimeout(() => {
      fetchDoctors();
    }, 50);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <Sidebar />

      <div className="flex-1 flex flex-col pl-0 lg:pl-64">
        <Navbar title="Clinical Specialists Directory" />

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Filters Form Card */}
          <form onSubmit={fetchDoctors} className="glass-card grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            {/* Specialization */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Specialization</label>
              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none text-slate-800 dark:text-slate-200"
              >
                <option value="">Any Specialization</option>
                {['General Physician', 'Cardiologist', 'Dermatologist', 'Pediatrician', 'Neurologist', 'Orthopedic'].map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            {/* Experience */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Min Experience (Years)</label>
              <input
                type="number"
                placeholder="e.g. 5"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Max Fees */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Max consultation Fees ($)</label>
              <input
                type="number"
                placeholder="e.g. 100"
                value={maxFees}
                onChange={(e) => setMaxFees(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Day */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Availability Day</label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none text-slate-800 dark:text-slate-200"
              >
                <option value="">Any Day</option>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 w-full">
              <button
                type="submit"
                className="flex-1 py-2 bg-teal-700 hover:bg-teal-600 text-white rounded-xl text-xs font-semibold shadow-md transition-colors flex items-center justify-center space-x-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                className="p-2 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                title="Clear Filters"
              >
                <FilterX className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Doctors Grid View */}
          {loading ? (
            <div className="py-20">
              <LoadingSpinner />
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80">
              <p className="text-slate-400 text-sm">No doctors match your active query criteria.</p>
              <button onClick={handleClearFilters} className="mt-4 px-4 py-2 bg-teal-50 dark:bg-teal-950/20 text-teal-700 dark:text-teal-400 text-xs font-semibold rounded-lg hover:underline">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doc) => (
                <div key={doc._id} className="glass-card hover:translate-y-[-4px] transition-all duration-300 flex flex-col justify-between space-y-4">
                  {/* Doctor Info Header */}
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 text-[10px] font-bold uppercase border border-teal-100 dark:border-teal-900/30">
                        {doc.specialization}
                      </span>
                      {/* Rating Mock */}
                      <div className="flex items-center space-x-1 text-yellow-500 font-bold text-xs">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{doc.ratings?.average || '4.5'}</span>
                        <span className="text-slate-400">({doc.ratings?.count || '12'})</span>
                      </div>
                    </div>

                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg mt-3">
                      Dr. {doc.user?.name || 'Medical Expert'}
                    </h3>
                    <p className="text-xs text-slate-400 truncate font-semibold mt-0.5">{doc.user?.email}</p>
                    
                    {/* Bio text */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 line-clamp-3 leading-relaxed">
                      {doc.bio || 'Experienced medical practitioner focused on preventive healthcare models, checkups, and smart diagnostic advice.'}
                    </p>
                  </div>

                  {/* Vitals grid (Fees and Experience) */}
                  <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 dark:border-slate-800/80 py-3 text-xs">
                    <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                      <Award className="w-4 h-4 text-teal-600" />
                      <span>{doc.experience} Years Exp</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-400 font-bold text-slate-800 dark:text-slate-200">
                      <DollarSign className="w-4 h-4 text-teal-600" />
                      <span>${doc.fees} Consultation</span>
                    </div>
                  </div>

                  {/* Availability Slots display */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Weekly availability</span>
                    <div className="flex flex-wrap gap-1">
                      {doc.availability && doc.availability.length > 0 ? (
                        doc.availability.map((avail) => (
                          <span key={avail.day} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded text-[9px] font-bold uppercase tracking-tight">
                            {avail.day.slice(0, 3)}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Mon - Fri slots available</span>
                      )}
                    </div>
                  </div>

                  {/* Book Button */}
                  <Link
                    to={`/appointments?doctor=${doc._id}`}
                    className="w-full py-2.5 bg-teal-700 hover:bg-teal-600 text-white rounded-xl text-xs font-semibold shadow-lg text-center flex items-center justify-center space-x-2 transition-colors active:scale-95"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book Consultation</span>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Doctors;
