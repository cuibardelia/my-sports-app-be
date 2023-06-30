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

module.exports = Appointment;