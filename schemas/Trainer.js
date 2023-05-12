require('dotenv').config({path: './config/.env'});

const mongoose = require('mongoose');
const moment = require('moment');
const dateFormat = require('mongoose-date-format');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('./User');


// select - whenever we query a trainer, do we want the pass too?
const TrainerSchema = new mongoose.Schema({
	dateOfBirth: {
		type: Date,
		required: true,
		set: (value) => moment(value, 'DD-MM-YYYY').toDate()
	},
	bio: {
		type: String,
		required: false,
	},
	specialties: {
		type: [String],
		// TODO: reuse this for Classes (names) -> get list of trainers fit for a class
		enum: ['HIIT', 'Pilates', 'Body Pump', 'Zumba', 'Circuit Training', 'TRX', 'Body Combat', 'Core', 'Rebounder'],
		required: false,
	},
	// TODO: photo,
	resetPasswordToken: String,
	resetPasswordExp: Date,
	isPublished: Boolean,
	userType: {
		type: String,
		required: false,
	},
});

TrainerSchema.add(User.schema);
TrainerSchema.plugin(dateFormat);

TrainerSchema.pre('save', async function(next) {
	if (!this.isModified('password')) {
		next();
	}

	Trainer.find({}, function (err, clients) {
		if (err) {
			console.error(err);
		} else {
			console.log(clients);
		}
	});

	// generate salt, the higher the number, the more secure
	const salt = await bcrypt.genSalt(10);
	// save the new hashed password, then save the document
	this.password = await bcrypt.hash(this.password, salt);
	this.userType = 'trainer';
	next();
});

TrainerSchema.methods.checkPassword =  async function (password) {
	return await bcrypt.compare(password, this.password);
};

TrainerSchema.methods.getSignedToken = function() {
	return jwt.sign({id: this._id}, process.env.JWT_TRAINER_SECRET, {
		expiresIn: '30min'
	});
};

TrainerSchema.methods.getResetPassToken = function() {
	const resetToken = crypto.randomBytes(20).toString('hex');
	this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
	// makes sure it expires in 10 minutes;
	this.resetPasswordExpire = Date.now() + 30 * (60 * 1000);

	return resetToken;
};

const Trainer = mongoose.model('Trainer',TrainerSchema);

module.exports = Trainer;