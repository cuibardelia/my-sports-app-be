const express = require('express');
const router = express.Router();

const { protectAdmin } = require('../middleware/protect')
const { deleteExercise } = require('../controllers/features');
const { deleteUser, updateTrainer } = require('../controllers/userAdmin');

router.use(protectAdmin);
router.delete('/delete-exercise', deleteExercise);
router.delete('/delete-user', deleteUser);
router.post('/update-trainer', updateTrainer);

module.exports = router;