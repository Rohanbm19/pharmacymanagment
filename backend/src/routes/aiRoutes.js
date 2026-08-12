const express = require('express');
const router = express.Router();
const { generateInsight } = require('../controllers/aiController');

router.post('/insight', generateInsight);

module.exports = router;
