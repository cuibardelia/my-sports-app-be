require('dotenv').config({path: "./config/.env"});
const dateFormat = require('mongoose-date-format');
const moment = require('moment');

const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// TODO: better regex
// select - whenever we query a trainer, do we want the pass too?
const TrainerSchema = new mongoose.Schema({
	firstName: {
		type: String,
		required: true,
	},
	lastName: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: [true, "Please add an email"],
		unique: true,
		trim: true,
		match:[/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g, "Please add a valid email"]
	},
	password: {
		type: String,
		required: [true, "Please add pwd"],
		minlength: 8,
		select: false,
	},
	dateOfBirth: {
		type: Date,
		required: true,
		set: (value) => moment(value, 'DD-MM-YYYY').toDate()
	},
	gender: {
		type: String,
		enum: ['Male', 'Female', 'Other'],
		required: true,
	},
	// TODO: add phone for clients?
	phone: {
		type: String,
		required:[true, "Please add your mobile phone number"],
		match:[/^07\d{8}$/, "Please add a phone number"]
	},
	bio: {
		type: String,
		required: false,
	},
	specialties: {
		type: [String],
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

TrainerSchema.plugin(dateFormat);

// pre-saving and post-saving via mongoose
TrainerSchema.pre("save", async function(next) {
	// first we make sure we don;t hash an already hashed pass
	if(!this.isModified("password")) {
		next();
	}

	Trainer.find({}, function (err, clients) {
		if (err) {
			console.error(err);
		} else {
			console.log(clients);
		}
	});

	// generate a salt, the higher the number, the more secure
	const salt = await bcrypt.genSalt(10);
	// save the new hashed password, then save the document
	this.password = await bcrypt.hash(this.password, salt);
	this.userType = 'trainer';
	next();
});

TrainerSchema.methods.checkPassword = async function(pwd) {
	return await bcrypt.compare(pwd, this.password);
};

TrainerSchema.methods.getSignedToken = function() {
	return jwt.sign({id: this._id}, process.env.JWT_TRAINER_SECRET, {
		expiresIn: '10min'
	});
};

TrainerSchema.methods.getResetPassToken = function() {
	const resetToken = crypto.randomBytes(20).toString("hex");
	this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
	// makes sure it expires in 10 minutes;
	this.resetPasswordExpire = Date.now() + 10 * (60 * 1000);

	return resetToken;
};

module.exports = TrainerSchema;

