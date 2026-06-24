const express = require('express');
const router = express.Router();
const { symptomCheck, chat } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/symptom-check', symptomCheck);
router.post('/chat', chat);

module.exports = router;
