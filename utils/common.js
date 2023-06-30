const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const moment = require('moment-timezone');
moment.tz.setDefault('UTC');

const Client = require('../schemas/Client');
const Trainer = require('../schemas/Trainer');
const Admin = require('../schemas/Admin');

const hashPasswordAndSetUserType = async function (next) {
	if (!this.isModified('password')) {
		return next();
	}

	// generate salt, the higher the number, the more secure
	const salt = await bcrypt.genSalt(10);
	// save the new hashed password, then save the document
	this.password = await bcrypt.hash(this.password, salt);
	this.userType = getUserTypeFromSchema(this.constructor.modelName);

	if (this.userType === 'admin') {
		// Grant the userAdminAnyDatabase role
		this.db.admin().grantRolesToUser(this.email, ['userAdminAnyDatabase'], next);
	} else {
		next();
	}

	// this.constructor.modelName.find({}, function (err, clients) {
	// 	if (err) {
	// 		console.error(err);
	// 	} else {
	// 		console.log(clients);
	// 	}
	// });

	next();
};

// FIXME
const checkPassword = async function (password) {
	return await bcrypt.compare(password, this.password);
};

const getSignedToken = function (secret) {
	return jwt.sign({ id: this._id }, secret);
};

const getResetPassToken = function () {
	const resetToken = crypto.randomBytes(20).toString('hex');
	this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
	this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 10 minutes

	return resetToken;
};

const getUserTypeFromSchema = function (modelName) {
	// Map the model name to the user type
	const modelTypeMap = {
		Client: 'client',
		Trainer: 'trainer',
		Admin: 'admin',
	};

	return modelTypeMap[modelName];
};

const getModel = function (userType) {
// Map the model name to the user type
	const modelTypeMap = {
		client: Client,
		trainer: Trainer,
		admin: Admin,
	};

	const model = modelTypeMap[userType];

	if (!modelTypeMap[userType]) {
		console.error('Incorrect userType provided for mapping')
	}

	return model;
};

const getUserSecret = (model) => {
	const modelName = model.modelName;
	const modelTypeMap = {
		Client: process.env.JWT_CLIENT_SECRET,
		Trainer: process.env.JWT_TRAINER_SECRET,
		Admin: process.env.JWT_ADMIN_SECRET,
	};

	return modelTypeMap[modelName];
};

const getAge = (ageString) => {
	if (!ageString) {
		return 0;
	}

	const birth = moment(ageString, 'YYYY-MM-DD').toDate();
	return moment().diff(birth, 'years');
};

const isDayApart = (latestStat) => {
	const currentDate = new Date();
	const timeDiff = currentDate.getTime() - latestStat.date.getTime();
	const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
	return daysDiff >= 1;
}

module.exports = { getModel, checkPassword, hashPasswordAndSetUserType, getSignedToken, getResetPassToken, getUserSecret, getAge, isDayApart  };
