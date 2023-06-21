const mongoose = require('mongoose');

const SessionPlanSchema = new mongoose.Schema({
	name: {
		type: String,
		unique: true,
	},
	trainer: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Trainer',
		required: true,
	},
	exercises: [{
		id: {
			type: String,
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
	}],
	notes: {
		type: String,
		required: false,
	},
	difficulty: {
		type: String,
		enum: ['Easy', 'Moderate', 'High']
	},
	equipment: {
		type: [String],
	},
	targets: {
		type: [String],
	},
	expectedResult: {
		mediumCaloriesBurn: Number,
	}
});

const SessionPlan = mongoose.model('SessionPlan', SessionPlanSchema);

module.exports = SessionPlan;
