const express = require('express');
const router = express.Router();
const {
  uploadReport,
  getMyReports,
  analyzeReport
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.post('/upload', authorize('patient'), upload.single('reportFile'), uploadReport);
router.get('/my-reports', getMyReports);
router.post('/:id/analyze', analyzeReport);

module.exports = router;
