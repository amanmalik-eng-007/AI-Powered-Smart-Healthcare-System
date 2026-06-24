const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Patient = require('./models/Patient');
const Appointment = require('./models/Appointment');
const Prescription = require('./models/Prescription');
const Report = require('./models/Report');

dotenv.config();

const seedDatabase = async () => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart-healthcare';
    console.log(`Connecting database for seeding: ${connUri}`);
    await mongoose.connect(connUri);

    // Clear existing database
    await User.deleteMany();
    await Doctor.deleteMany();
    await Patient.deleteMany();
    await Appointment.deleteMany();
    await Prescription.deleteMany();
    await Report.deleteMany();
    console.log('Database collections cleared successfully.');

    // 1. Create Administrator
    const admin = await User.create({
      name: 'SmartHealth Admin',
      email: 'admin@smarthealth.com',
      password: 'adminpassword', // Will be hashed automatically by pre-save
      role: 'admin',
      isVerified: true
    });
    console.log('Admin account seeded: admin@smarthealth.com / adminpassword');

    // 2. Create Patient User
    const patientUser = await User.create({
      name: 'Jane Smith',
      email: 'patient@demo.com',
      password: 'patientpassword',
      role: 'patient',
      isVerified: true
    });
    const patientProfile = await Patient.create({
      user: patientUser._id,
      age: 28,
      gender: 'Female',
      bloodGroup: 'AB+',
      medicalHistory: ['Mild Asthma', 'Pollen Allergy']
    });
    console.log('Patient account seeded: patient@demo.com / patientpassword');

    // 3. Create Approved Doctor
    const doctorUser1 = await User.create({
      name: 'Gregory House',
      email: 'house@demo.com',
      password: 'doctorpassword',
      role: 'doctor',
      isVerified: true
    });
    const doctorProfile1 = await Doctor.create({
      user: doctorUser1._id,
      specialization: 'Cardiologist',
      experience: 16,
      fees: 150,
      bio: 'Diagnostics expert specializing in cardiac complications and complex symptom analysis.',
      status: 'approved',
      availability: [
        { day: 'Monday', slots: ['09:00 AM', '10:30 AM', '02:00 PM'] },
        { day: 'Wednesday', slots: ['09:00 AM', '10:30 AM', '02:00 PM'] },
        { day: 'Friday', slots: ['10:00 AM', '03:00 PM'] }
      ]
    });
    console.log('Approved Doctor account seeded: house@demo.com / doctorpassword');

    // 4. Create Pending Doctor
    const doctorUser2 = await User.create({
      name: 'John Watson',
      email: 'watson@demo.com',
      password: 'doctorpassword',
      role: 'doctor',
      isVerified: true
    });
    const doctorProfile2 = await Doctor.create({
      user: doctorUser2._id,
      specialization: 'General Physician',
      experience: 8,
      fees: 60,
      bio: 'Dedicated clinical physician focusing on preventative care and primary consultations.',
      status: 'pending',
      availability: [
        { day: 'Tuesday', slots: ['09:00 AM', '11:00 AM'] },
        { day: 'Thursday', slots: ['02:00 PM', '04:00 PM'] }
      ]
    });
    console.log('Pending Doctor account seeded: watson@demo.com / doctorpassword');

    // 5. Seed one completed mock appointment and prescription for metrics chart display
    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() - 2);
    
    const appointment = await Appointment.create({
      doctor: doctorProfile1._id,
      patient: patientProfile._id,
      date: appointmentDate,
      timeSlot: '10:30 AM',
      status: 'completed',
      notes: 'Patient reports mild chest tightness after exercise.'
    });

    await Prescription.create({
      appointment: appointment._id,
      doctor: doctorProfile1._id,
      patient: patientProfile._id,
      medicines: [
        { name: 'Aspirin 81mg', dosage: '1 tab', frequency: '1-0-0', duration: '30 days' },
        { name: 'Atorvastatin 20mg', dosage: '1 tab', frequency: '0-0-1', duration: '30 days' }
      ],
      notes: 'Avoid high intensity cardio workouts. Monitor resting heart rate.'
    });
    console.log('Mock completed appointment and prescription seeded.');

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Database seeding error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
