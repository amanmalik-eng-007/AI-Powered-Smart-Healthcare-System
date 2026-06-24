const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private/Patient
exports.bookAppointment = async (req, res, next) => {
  try {
    const { doctorId, date, timeSlot, notes } = req.body;

    // Verify patient profile
    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found. Please complete registration.' });
    }

    // Verify doctor exists & approved
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || doctor.status !== 'approved') {
      return res.status(404).json({ success: false, message: 'Doctor not found or not active' });
    }

    // Check if slot is already booked for this doctor on this date
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0); // normalize date to midnight for day comparison

    const nextDay = new Date(dateObj);
    nextDay.setDate(nextDay.getDate() + 1);

    const slotBooked = await Appointment.findOne({
      doctor: doctorId,
      date: { $gte: dateObj, $lt: nextDay },
      timeSlot,
      status: { $in: ['pending', 'accepted', 'completed'] }
    });

    if (slotBooked) {
      return res.status(400).json({ success: false, message: 'This timeslot is already booked' });
    }

    const appointment = await Appointment.create({
      doctor: doctorId,
      patient: patient._id,
      date: dateObj,
      timeSlot,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user appointments (Patient, Doctor, or Admin)
// @route   GET /api/appointments/my-appointments
// @access  Private
exports.getMyAppointments = async (req, res, next) => {
  try {
    let filter = {};

    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user.id });
      if (!patient) return res.status(404).json({ success: false, message: 'Patient profile not found' });
      filter = { patient: patient._id };
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user.id });
      if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });
      filter = { doctor: doctor._id };
    }

    const appointments = await Appointment.find(filter)
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email' }
      })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name email' }
      })
      .sort({ date: -1, timeSlot: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reschedule Appointment
// @route   PUT /api/appointments/:id/reschedule
// @access  Private (Patient or Doctor)
exports.rescheduleAppointment = async (req, res, next) => {
  try {
    const { date, timeSlot } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Verify ownership
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user.id });
      if (appointment.patient.toString() !== patient._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized to reschedule this appointment' });
      }
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user.id });
      if (appointment.doctor.toString() !== doctor._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized to reschedule this appointment' });
      }
    }

    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);

    appointment.date = dateObj;
    appointment.timeSlot = timeSlot;
    appointment.status = 'pending'; // revert to pending for review
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment rescheduled successfully, pending confirmation',
      appointment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel Appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private (Patient, Doctor, or Admin)
exports.cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Update status
    appointment.status = 'cancelled';
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Appointment Status (Doctor accepts/rejects or completes)
// @route   PUT /api/appointments/:id/status
// @access  Private/Doctor
exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected', 'completed', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status update request' });
    }

    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) return res.status(403).json({ success: false, message: 'Not authorized as a doctor' });

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.doctor.toString() !== doctor._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this appointment' });
    }

    appointment.status = status;
    await appointment.save();

    res.status(200).json({
      success: true,
      message: `Appointment ${status} successfully`,
      appointment
    });
  } catch (error) {
    next(error);
  }
};
