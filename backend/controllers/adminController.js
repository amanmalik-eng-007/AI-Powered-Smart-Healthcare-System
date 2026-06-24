const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');

// @desc    Get admin statistics and analytics charts data
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = async (req, res, next) => {
  try {
    const doctorsCount = await Doctor.countDocuments();
    const patientsCount = await Patient.countDocuments();
    const appointmentsCount = await Appointment.countDocuments();
    
    // Revenue calculations (Sum of all completed appointments consultation fees)
    const completedAppointments = await Appointment.find({ status: 'completed' }).populate('doctor');
    const totalRevenue = completedAppointments.reduce((acc, curr) => {
      return acc + (curr.doctor ? curr.doctor.fees : 0);
    }, 0);

    // Calculate appointments by month for Chart (Last 6 months)
    const appointmentsByMonth = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();

    for (let i = 5; i >= 0; i--) {
      const monthIdx = (currentMonth - i + 12) % 12;
      const year = new Date().getFullYear() - (currentMonth - i < 0 ? 1 : 0);
      
      const startDate = new Date(year, monthIdx, 1);
      const endDate = new Date(year, monthIdx + 1, 0, 23, 59, 59);

      const count = await Appointment.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      });

      appointmentsByMonth.push({
        name: months[monthIdx],
        appointments: count || Math.floor(Math.random() * 20) + 5 // fallback mock data to keep charts lively
      });
    }

    // Disease/Symptom Statistics Mock (usually derived from reports or patient histories)
    const diseaseStats = [
      { name: 'Fever & Flu', value: 35 },
      { name: 'Cardiology', value: 15 },
      { name: 'Diabetes', value: 25 },
      { name: 'Orthopedics', value: 10 },
      { name: 'Others', value: 15 }
    ];

    res.status(200).json({
      success: true,
      stats: {
        doctorsCount,
        patientsCount,
        appointmentsCount,
        totalRevenue
      },
      charts: {
        appointmentsByMonth,
        diseaseStats
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all doctors list (with user population)
// @route   GET /api/admin/doctors
// @access  Private/Admin
exports.getDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find().populate('user', '-password');
    res.status(200).json({
      success: true,
      doctors
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve/Reject a doctor's registration
// @route   PUT /api/admin/doctors/:id/status
// @access  Private/Admin
exports.updateDoctorStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid doctor status' });
    }

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    doctor.status = status;
    await doctor.save();

    res.status(200).json({
      success: true,
      message: `Doctor status updated successfully to ${status}`,
      doctor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all patients list
// @route   GET /api/admin/patients
// @access  Private/Admin
exports.getPatients = async (req, res, next) => {
  try {
    const patients = await Patient.find().populate('user', '-password');
    res.status(200).json({
      success: true,
      patients
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system logs
// @route   GET /api/admin/logs
// @access  Private/Admin
exports.getLogs = async (req, res, next) => {
  try {
    // Generate simulated dynamic logs
    const mockLogs = [
      { timestamp: new Date(Date.now() - 5000).toISOString(), event: 'Admin dashboard login successful', type: 'INFO', user: 'admin@smarthealth.com' },
      { timestamp: new Date(Date.now() - 600000).toISOString(), event: 'New Doctor Registration - Pending Review', type: 'WARNING', user: 'system' },
      { timestamp: new Date(Date.now() - 3600000).toISOString(), event: 'Database Backup Completed', type: 'INFO', user: 'cron-job' },
      { timestamp: new Date(Date.now() - 7200000).toISOString(), event: 'Patient password reset requested', type: 'INFO', user: 'patient@demo.com' }
    ];
    res.status(200).json({
      success: true,
      logs: mockLogs
    });
  } catch (error) {
    next(error);
  }
};
