const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// TODO: retry w proper binding
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

const getUserTypeFromSchema = function (modelName) {
	// Map the model name to the user type
	const modelTypeMap = {
		Client: 'client',
		Trainer: 'trainer',
		Admin: 'admin',
	};

	return modelTypeMap[modelName];
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
	this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

	return resetToken;
};

module.exports = { checkPassword, hashPasswordAndSetUserType, getSignedToken, getResetPassToken };
