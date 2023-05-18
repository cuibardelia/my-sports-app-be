const mongoose = require('mongoose');

const SessionPlanSchema = new mongoose.Schema({
	trainer: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Trainer',
		required: true,
	},
	client: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Client',
	},
	date: {
		type: Date,
	},
	exercises: [{
		exercise: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Exercise',
			required: true,
		},
		sets: {
			type: Number,
			required: true,
		},
		repetitions: {
			type: Number,
			required: true,
		},
		notes: {
			type: String,
			required: false,
		},
		difficulty: {
			type: String,
			enum: ['Easy', 'Moderate', 'High']
		}
	}],
});

const SessionPlan = mongoose.model('SessionPlan', SessionPlanSchema);

module.exports = SessionPlan;
