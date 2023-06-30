// For safety reasons, admin has been manually created
// with `userAdminAnyDatabase` rights, a built-in role in MongoDB that has the privileges to perform administrative actions on all databases in the MongoDB deployment, including creating and modifying users, roles, and indexes.
// db.createUser({ user, pwd, roles[]})
// Password has been manually hashed using:
// (async () => {const salt = await bcrypt.genSalt(10); const hashed = await bcrypt.hash(pwd, salt); console.log(hashed);})();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const AdminSchema = new mongoose.Schema({
	email: {
		type: String,
		required: [true, 'Please add an email'],
		unique: true,
		trim: true,
		match:[/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g, 'Please add a valid email']
	},
	password: {
		type: String,
		required: [true, 'Please add pwd'],
		minlength: 6,
		select: false,
	},
	userType: {
		type: String,
		required: false,
	}
});

AdminSchema.pre('save', async function(next) {
	if (!this.isModified('password')) {
		next();
	}

	// Admin.find({}, function (err, admins) {
	// 	if (err) {
	// 		console.error(err);
	// 	} else {
	// 		console.log(admins);
	// 	}
	// });

	try {
	// generate salt, the higher the number, the more secure
	const salt = await bcrypt.genSalt(10);
	// save the new hashed password, then save the document
	this.password = await bcrypt.hash(this.password, salt);
	this.userType = 'admin';
	next();
	} catch (error) {
		next(error);
	}
});

AdminSchema.methods.checkPassword =  async function (password) {
	return await bcrypt.compare(password, this.password);
};

AdminSchema.methods.getSignedToken = function() {
	// For the Admin role we went with a stronger secret
	return jwt.sign({id: this._id}, process.env.JWT_ADMIN_SECRET, {
		expiresIn: '1d'
	});
};

AdminSchema.methods.getResetPassToken = function() {
	const resetToken = crypto.randomBytes(20).toString('hex');
	this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
	// makes sure it expires in 30 minutes;
	this.resetPasswordExpire = Date.now() + 30 * (60 * 1000);

	return resetToken;
};

const Admin = mongoose.model('Admin', AdminSchema);

module.exports = Admin;
