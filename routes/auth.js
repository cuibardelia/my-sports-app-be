const express = require('express');
const router = express.Router();

const { register, registerAdmin, login,
	forgotPassword, resetPassword, getObjectiveStats, getAgeIntervals, getTrainers, getExercises } = require('../controllers/auth');

router.route('/register-admin').post(registerAdmin);
router.route('/register/:userType').post(register);
router.route('/login').post(login);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password/:resetToken').put(resetPassword);
router.route('/get-objectives').get(getObjectiveStats);
router.route('/get-age-stats').get(getAgeIntervals);
router.route('/get-trainers').get(getTrainers);
router.route('/get-exercises').get(getExercises);

module.exports = router;