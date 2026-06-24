const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getMyAppointments,
  rescheduleAppointment,
  cancelAppointment,
  updateAppointmentStatus
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', authorize('patient'), bookAppointment);
router.get('/my-appointments', getMyAppointments);
router.put('/:id/reschedule', rescheduleAppointment);
router.put('/:id/cancel', cancelAppointment);
router.put('/:id/status', authorize('doctor'), updateAppointmentStatus);

module.exports = router;
