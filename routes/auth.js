const express = require('express');
const router = express.Router();

const { registerClient, registerTrainer, registerAdmin, adminLogin, clientLogin, trainerLogin,
	clientForgotPassword, trainerForgotPassword, clientResetPassword, trainerResetPassword} = require('../controllers/auth');

const { favoriteExercise, getFavoriteExercises, deleteExercise } = require('../controllers/features');

// FIXME: client env
// TODO: refactor - use headers
router.route('/register-client').post(registerClient);
router.route('/register-trainer').post(registerTrainer);
router.route('/register-admin').post(registerAdmin);
router.route('/login-client').post(clientLogin);
router.route('/login-trainer').post(trainerLogin);
router.route('/login-admin').post(adminLogin);
router.route('/forgot-password-client').post(clientForgotPassword);
router.route('/forgot-password-trainer').post(trainerForgotPassword);
router.route('/reset-password-client/:resetToken').put(clientResetPassword);
router.route('/reset-password-trainer/:resetToken').put(trainerResetPassword);
router.route('/favorite-exercise').post(favoriteExercise);
router.route('/get-exercises').get(getFavoriteExercises);
router.route('/delete-exercise').delete(deleteExercise);

module.exports = router;