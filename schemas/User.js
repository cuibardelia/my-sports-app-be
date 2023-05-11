const mongoose = require('mongoose');

// TODO: better email regex
const UserSchema = new mongoose.Schema({
	createdAt: { type: Date, default: Date.now },
	lastName: {
		type: String,
		required: [true, "Please add Last Name"],
	},
	firstName: {
		type: String,
		required: [true, "Please add First Name"],
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
		minlength: 6,
		select: false,
	},
	// TODO: fixme and remove users
	// gender: {
	// 	type: String,
	// 	enum: ['Male', 'Female', 'Other'],
	// 	required: true,
	// },
	// phone: {
	// 	type: String,
	// 	required:[true, "Please add your mobile phone number"],
	// 	match:[/^07\d{8}$/, "Please add a phone number"]
	// },
	userType: {
		type: String,
		enum: ['admin', 'client', 'trainer'],
		required: false,
	},
	favoriteExercises: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Exercise',
	}],
});

module.exports = mongoose.model('User', UserSchema);