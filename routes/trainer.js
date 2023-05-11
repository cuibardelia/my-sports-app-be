const express = require('express');
const router = express.Router();

const { protectTrainer } = require('../middleware/protect')
const { favoriteExercise, getFavoriteExercises } = require('../controllers/features');

router.use(protectTrainer);
router.post('/favorite-exercise', favoriteExercise);
router.get('/get-exercises', getFavoriteExercises);

module.exports = router;