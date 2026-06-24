const express = require('express');
const router = express.Router();
const {
  createPrescription,
  getPrescriptionByAppointment,
  getMyPrescriptions,
  downloadPrescriptionPDF
} = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', authorize('doctor'), createPrescription);
router.get('/appointment/:appointmentId', getPrescriptionByAppointment);
router.get('/my-prescriptions', getMyPrescriptions);
router.get('/:id/pdf', downloadPrescriptionPDF);

module.exports = router;
