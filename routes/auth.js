const express = require('express');
const router = express.Router();

const { register, registerAdmin, login,
	forgotPassword, resetPassword } = require('../controllers/auth');

// FIXME: client env
router.route('/register-admin').post(registerAdmin);
router.route('/register/:userType').post(register);
router.route('/login').post(login);
router.route('/forgot-password').post(forgotPassword);
// TODO: test for trainers - new email
router.route('/reset-password/:resetToken').put(resetPassword);

module.exports = router;