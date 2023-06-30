const mongoose = require('mongoose');
const moment = require('moment-timezone');
moment.tz.setDefault('UTC');

const UserSchema = new mongoose.Schema({
	createdAt: { type: Date, default: Date.now },
	lastName: {
		type: String,
		required: [true, 'Please add Last Name'],
	},
	firstName: {
		type: String,
		required: [true, 'Please add First Name'],
	},
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
	dateOfBirth: {
		type: Date,
		set: (value) => moment(value, 'YYYY-MM-DD').toDate()
	},
	age: Number,
	gender: {
		type: String,
		enum: ['Male', 'Female', 'Other'],
		required: true,
	},
	phone: {
		type: String,
		required:[true, 'Please add your mobile phone number'],
		match:[/^07\d{8}$/, 'Please add a phone number']
	},
	userType: {
		type: String,
		enum: ['admin', 'client', 'trainer'],
		required: false,
	},
	favoriteExercises: [String],
	picUrl: String,
	sessions: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Session',
		},
	],
	appointments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Appointment',
		},
	],
	appointmentsCount: Number,
});

module.exports = mongoose.model('User', UserSchema);