const express = require('express');
const router = express.Router();

const { registerClient, registerTrainer, login, forgotPassword, resetPassword } = require('../controllers/auth');

// FIXME: client env
router.route('/register-client').post(registerClient);
router.route('/register-trainer').post(registerTrainer);
router.route('/login').post(login);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password/:resetToken').put(resetPassword);

module.exports = router;