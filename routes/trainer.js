const express = require('express');
const router = express.Router();
const { protectTrainer } = require('../middleware/protect')
const { addFavoriteExercise, removeFavoriteExercise, getFavoriteExercises } = require('../controllers/commonFeatures');
const { addTrainingSession, getClientsForPT, getSession, deleteSessionPlan, createAppointment, getAppointments, getSessions } = require('../controllers/trainerFeatures');

router.use(protectTrainer);
router.post('/favorite-exercise', addFavoriteExercise);
router.post('/remove-favorite-exercise', removeFavoriteExercise);
router.get('/get-exercises', getFavoriteExercises);
router.post('/add-session', addTrainingSession);
router.get('/get-clients', getClientsForPT);
router.get('/get-session', getSession);
router.delete('/delete-session-plan', deleteSessionPlan);
router.post('/create-session-appointment', createAppointment);
router.get('/get-appointments', getAppointments);
router.get('/get-sessions', getSessions);

module.exports = router;