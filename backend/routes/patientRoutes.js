const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getDoctors
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Anyone logged in can search/view doctors list
router.get('/doctors', getDoctors);

// Only patients can access/modify their patient profile details
router.get('/profile', authorize('patient'), getProfile);
router.put('/profile', authorize('patient'), updateProfile);

module.exports = router;
