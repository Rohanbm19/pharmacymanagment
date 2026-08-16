const express = require('express');
const router = express.Router();
const { generateInsight, generateRecommendations } = require('../controllers/aiController');

router.post('/insight', generateInsight);
router.post('/recommendations', generateRecommendations);

module.exports = router;
