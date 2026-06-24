import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { patientAPI, doctorAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast, ToastContainer } from 'react-toastify';
import { User, Activity, Calendar, Lock, CheckCircle, ShieldAlert, Award, FileText } from 'lucide-react';

const Profile = () => {
  const { user, profile, refreshUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Common details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Patient profile details
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [medicalHistoryInput, setMedicalHistoryInput] = useState('');

  // Doctor profile details
  const [specialization, setSpecialization] = useState('General Physician');
  const [experience, setExperience] = useState('');
  const [fees, setFees] = useState('');
  const [bio, setBio] = useState('');
  
  // Doctor availability checkboxes and slot list strings
  const [checkedDays, setCheckedDays] = useState({
    Monday: false, Tuesday: false, Wednesday: false, Thursday: false,
    Friday: false, Saturday: false, Sunday: false
  });
  const [daySlots, setDaySlots] = useState({
    Monday: '09:00 AM, 10:30 AM, 02:00 PM',
    Tuesday: '09:00 AM, 10:30 AM, 02:00 PM',
    Wednesday: '09:00 AM, 10:30 AM, 02:00 PM',
    Thursday: '09:00 AM, 10:30 AM, 02:00 PM',
    Friday: '09:00 AM, 10:30 AM, 02:00 PM',
    Saturday: '10:00 AM, 12:00 PM',
    Sunday: '10:00 AM, 12:00 PM'
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      
      if (user.role === 'patient' && profile) {
        setAge(profile.age || '');
        setGender(profile.gender || 'Male');
        setBloodGroup(profile.bloodGroup || 'O+');
        setMedicalHistoryInput(profile.medicalHistory ? profile.medicalHistory.join(', ') : '');
      } else if (user.role === 'doctor' && profile) {
        setSpecialization(profile.specialization || 'General Physician');
        setExperience(profile.experience || '');
        setFees(profile.fees || '');
        setBio(profile.bio || '');

        // Sync availability
        if (profile.availability && profile.availability.length > 0) {
          const newChecked = {
            Monday: false, Tuesday: false, Wednesday: false, Thursday: false,
            Friday: false, Saturday: false, Sunday: false
          };
          const newSlots = { ...daySlots };

          profile.availability.forEach((avail) => {
            newChecked[avail.day] = true;
            newSlots[avail.day] = avail.slots.join(', ');
          });

          setCheckedDays(newChecked);
          setDaySlots(newSlots);
        }
      }
      setLoading(false);
    }
  }, [user, profile]);

  const handleCheckboxChange = (day) => {
    setCheckedDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  const handleSlotChange = (day, value) => {
    setDaySlots(prev => ({ ...prev, [day]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (user.role === 'patient') {
        const medicalHistory = medicalHistoryInput
          .split(',')
          .map(item => item.trim())
          .filter(item => item.length > 0);

        const res = await patientAPI.updateProfile({
          age: age ? Number(age) : null,
          gender,
          bloodGroup,
          medicalHistory
        });

        if (res.data.success) {
          toast.success('Patient profile updated successfully!');
          refreshUser();
        }
      } else if (user.role === 'doctor') {
        // Build availability structure
        const availability = [];
        daysOfWeek.forEach((day) => {
          if (checkedDays[day]) {
            const slots = daySlots[day]
              .split(',')
              .map(s => s.trim())
              .filter(s => s.length > 0);
            availability.push({ day, slots });
          }
        });

        const res = await doctorAPI.updateProfile({
          specialization,
          experience: Number(experience),
          fees: Number(fees),
          bio,
          availability
        });

        if (res.data.success) {
          toast.success('Doctor profile updated successfully!');
          refreshUser();
        }
      }
    } catch (err) {
      toast.error('Failed to update profile records');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar />
        <div className="flex-1 flex flex-col pl-0 lg:pl-64">
          <Navbar title="My Profile" />
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
        <Navbar title="Account Settings & Profile" />

        <main className="flex-1 p-6 space-y-6 max-w-4xl w-full mx-auto">
          <form onSubmit={handleSubmit} className="glass-card space-y-6">
            
            {/* Header info */}
            <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <User className="w-6 h-6 text-teal-600" />
              <div>
                <h3 className="font-bold text-slate-850 dark:text-white">Profile Configuration</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Role: {user.role}</p>
              </div>
            </div>

            {/* Read-Only Identity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-150 dark:border-slate-800/85">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Name</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 text-xs">{name}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Email Address</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 text-xs">{email}</p>
              </div>
            </div>

            {/* PATIENT FORM FIELDS */}
            {user.role === 'patient' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Age</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 25"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-teal-500 text-slate-800 dark:text-slate-200 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-2 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-teal-500 text-slate-800 dark:text-slate-200 text-xs"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Blood Group</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full px-2 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-teal-500 text-slate-800 dark:text-slate-200 text-xs"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Medical History (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Asthma, High blood pressure, Diabetes"
                    value={medicalHistoryInput}
                    onChange={(e) => setMedicalHistoryInput(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-teal-500 text-slate-800 dark:text-slate-200 text-xs"
                  />
                </div>
              </div>
            )}

            {/* DOCTOR FORM FIELDS */}
            {user.role === 'doctor' && (
              <div className="space-y-5 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Specialization</label>
                    <select
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full px-2 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-teal-500 text-slate-800 dark:text-slate-200 text-xs"
                    >
                      {['General Physician', 'Cardiologist', 'Dermatologist', 'Pediatrician', 'Neurologist', 'Orthopedic'].map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Experience (Years)</label>
                    <input
                      type="number"
                      required
                      placeholder="Years"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-teal-500 text-slate-800 dark:text-slate-200 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Consultation Fees ($)</label>
                    <input
                      type="number"
                      required
                      placeholder="Fees"
                      value={fees}
                      onChange={(e) => setFees(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-teal-500 text-slate-800 dark:text-slate-200 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Biography</label>
                  <textarea
                    rows={3}
                    placeholder="Short description of medical expertise..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-teal-500 text-slate-800 dark:text-slate-200"
                  />
                </div>

                {/* Availability Scheduler */}
                <div className="space-y-3 border-t border-slate-100 dark:border-slate-855 pt-4">
                  <div className="flex items-center space-x-1.5 text-teal-700 dark:text-teal-400">
                    <Calendar className="w-4.5 h-4.5" />
                    <span className="font-bold text-xs">Configure Weekly Availability Slots</span>
                  </div>

                  <div className="space-y-3">
                    {daysOfWeek.map((day) => (
                      <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-2xl gap-3">
                        <label className="inline-flex items-center space-x-2.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={checkedDays[day]}
                            onChange={() => handleCheckboxChange(day)}
                            className="rounded border-slate-300 dark:border-slate-800 text-teal-600 focus:ring-teal-500 w-4.5 h-4.5 cursor-pointer"
                          />
                          <span className="font-bold text-slate-700 dark:text-slate-200">{day}</span>
                        </label>
                        
                        {checkedDays[day] && (
                          <input
                            type="text"
                            placeholder="Slots (e.g. 09:00 AM, 10:30 AM)"
                            value={daySlots[day]}
                            onChange={(e) => handleSlotChange(day, e.target.value)}
                            className="flex-1 max-w-md px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-teal-500 text-slate-800 dark:text-slate-200 text-xs"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Submit changes button */}
            {user.role !== 'admin' && (
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-600 hover:to-teal-500 text-white font-semibold rounded-xl text-xs shadow-lg active:scale-95 transition-all text-center flex items-center justify-center space-x-2"
              >
                {saving ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            )}
          </form>
        </main>
      </div>
    </div>
  );
};

export default Profile;
