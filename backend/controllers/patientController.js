const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

// @desc    Get patient profile
// @route   GET /api/patient/profile
// @access  Private/Patient
exports.getProfile = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id }).populate('user', '-password');
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }
    res.status(200).json({
      success: true,
      patient
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update patient profile
// @route   PUT /api/patient/profile
// @access  Private/Patient
exports.updateProfile = async (req, res, next) => {
  try {
    const { age, gender, bloodGroup, medicalHistory } = req.body;

    let patient = await Patient.findOne({ user: req.user.id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    if (age) patient.age = age;
    if (gender) patient.gender = gender;
    if (bloodGroup) patient.bloodGroup = bloodGroup;
    if (medicalHistory) patient.medicalHistory = medicalHistory;

    await patient.save();
    patient = await patient.populate('user', '-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      patient
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search and filter approved doctors
// @route   GET /api/patient/doctors
// @access  Private
exports.getDoctors = async (req, res, next) => {
  try {
    const { specialization, experience, maxFees, day, minRating } = req.query;

    // Filter build object
    let query = { status: 'approved' };

    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    if (experience) {
      query.experience = { $gte: Number(experience) };
    }

    if (maxFees) {
      query.fees = { $lte: Number(maxFees) };
    }

    if (day) {
      query['availability.day'] = day;
    }

    if (minRating) {
      query['ratings.average'] = { $gte: Number(minRating) };
    }

    const doctors = await Doctor.find(query).populate('user', 'name email');

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors
    });
  } catch (error) {
    next(error);
  }
};
