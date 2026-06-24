const express = require('express');
const router = express.Router();
const {
  getStats,
  getDoctors,
  updateDoctorStatus,
  getPatients,
  getLogs
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Protect all admin routes
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/doctors', getDoctors);
router.put('/doctors/:id/status', updateDoctorStatus);
router.get('/patients', getPatients);
router.get('/logs', getLogs);

module.exports = router;
