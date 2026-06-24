const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { generatePrescriptionPDF } = require('../utils/pdfGenerator');

// @desc    Create a new prescription
// @route   POST /api/prescriptions
// @access  Private/Doctor
exports.createPrescription = async (req, res, next) => {
  try {
    const { appointmentId, medicines, notes } = req.body;

    if (!medicines || medicines.length === 0) {
      return res.status(400).json({ success: false, message: 'Please add at least one medicine' });
    }

    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(403).json({ success: false, message: 'Only approved doctors can write prescriptions' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Verify appointment belongs to this doctor
    if (appointment.doctor.toString() !== doctor._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to write prescription for this appointment' });
    }

    const prescription = await Prescription.create({
      appointment: appointmentId,
      doctor: doctor._id,
      patient: appointment.patient,
      medicines,
      notes
    });

    // Automatically mark appointment as completed
    appointment.status = 'completed';
    await appointment.save();

    res.status(201).json({
      success: true,
      message: 'Prescription created and appointment completed',
      prescription
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get prescription by appointment ID
// @route   GET /api/prescriptions/appointment/:appointmentId
// @access  Private
exports.getPrescriptionByAppointment = async (req, res, next) => {
  try {
    const prescription = await Prescription.findOne({ appointment: req.params.appointmentId })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name' }
      })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name age gender' }
      });

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'No prescription found for this appointment' });
    }

    res.status(200).json({
      success: true,
      prescription
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my prescriptions list (Patient or Doctor)
// @route   GET /api/prescriptions/my-prescriptions
// @access  Private
exports.getMyPrescriptions = async (req, res, next) => {
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

    const prescriptions = await Prescription.find(filter)
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name specialization' }
      })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name' }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      prescriptions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download prescription PDF
// @route   GET /api/prescriptions/:id/pdf
// @access  Private
exports.downloadPrescriptionPDF = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name specialization experience' }
      })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name' }
      });

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    // Set Response Headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=prescription-${prescription._id}.pdf`);

    // Stream PDF
    generatePrescriptionPDF(prescription, res);
  } catch (error) {
    next(error);
  }
};
