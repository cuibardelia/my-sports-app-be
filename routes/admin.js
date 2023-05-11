const express = require('express');
const router = express.Router();

const { protectAdmin } = require('../middleware/protect')
const { deleteExercise } = require('../controllers/features');

router.use(protectAdmin);
router.delete('/delete-exercise', deleteExercise);

module.exports = router;