const express = require('express');
const router = express.Router();
const { protectTrainer } = require('../middleware/protect')
const { addFavoriteExercise, removeFavoriteExercise, getFavoriteExercises } = require('../controllers/commonFeatures');
const { addTrainingSession, getClientsForPT } = require('../controllers/trainerFeatures');

router.use(protectTrainer);
router.post('/favorite-exercise', addFavoriteExercise);
router.post('/remove-favorite-exercise', removeFavoriteExercise);
router.get('/get-exercises', getFavoriteExercises);
router.post('/add-session', addTrainingSession);
router.get('/get-clients', getClientsForPT);


module.exports = router;