const express = require('express');
const router = express.Router();

const { protectUser } = require('../middleware/protect')
const { getWinners, getObjectiveAttainers } = require('../controllers/commonFeatures');

router.use(protectUser);
router.get('/get-winners', getWinners);
router.get('/get-objecive-attainers', getObjectiveAttainers);

module.exports = router;