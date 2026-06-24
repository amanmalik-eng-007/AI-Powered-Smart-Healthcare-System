const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// @desc    Get current doctor profile
// @route   GET /api/doctor/profile
// @access  Private/Doctor
exports.getProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id }).populate('user', '-password');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }
    res.status(200).json({
      success: true,
      doctor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update doctor profile & availability
// @route   PUT /api/doctor/profile
// @access  Private/Doctor
exports.updateProfile = async (req, res, next) => {
  try {
    const { specialization, experience, fees, availability, bio } = req.body;
    
    let doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    // Update fields
    if (specialization) doctor.specialization = specialization;
    if (experience) doctor.experience = experience;
    if (fees) doctor.fees = fees;
    if (availability) doctor.availability = availability;
    if (bio !== undefined) doctor.bio = bio;

    await doctor.save();
    doctor = await doctor.populate('user', '-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      doctor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get appointments scheduled for the doctor
// @route   GET /api/doctor/appointments
// @access  Private/Doctor
exports.getAppointments = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const appointments = await Appointment.find({ doctor: doctor._id })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name email' }
      })
      .sort({ date: 1, timeSlot: 1 });

    res.status(200).json({
      success: true,
      appointments
    });
  } catch (error) {
    next(error);
  }
};
