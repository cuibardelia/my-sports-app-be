const express = require('express');
const router = express.Router();

const { protectClient } = require('../middleware/protect')
const { favoriteExercise, getFavoriteExercises } = require('../controllers/features');

router.use(protectClient);
router.post('/favorite-exercise', favoriteExercise);
router.get('/get-exercises', getFavoriteExercises);

module.exports = router;