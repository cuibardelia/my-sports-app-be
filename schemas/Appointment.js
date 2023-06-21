const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
	trainer: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Trainer',
		required: true,
	},
	session: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'SessionPlan',
		required: true,
	},
	roomName: {
		type: String,
		enum: ['Green Room', 'Yellow Room', 'Blue Room']
	},
	startDate: {
		type: Date,
		validate: {
			validator: function(value) {
				return value < this.endDate;
			},
			message: 'Start date must be before end date',
		},
	},
	endDate: {
		type: Date,
	},
	clients: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Client',
	}],
});

const Appointment = mongoose.model('Appointment', AppointmentSchema);

// TODO
// AppointmentSchema.path('endDate').validate(function() {
// 	const twoHours = 2 * 60 * 60 * 1000; // Convert 2 hours to milliseconds
// 	const timeDifference = this.endDate - this.startDate;
// 	return timeDifference <= twoHours; // Check if the time difference is not higher than 2 hours
// }, 'The duration between start date and end date must not exceed 2 hours.');

module.exports = Appointment;