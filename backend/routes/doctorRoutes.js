const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getAppointments
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('doctor'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/appointments', getAppointments);

module.exports = router;
