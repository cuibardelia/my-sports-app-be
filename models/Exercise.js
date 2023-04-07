const mongoose = require('mongoose');

// TODO: revisit
const ExerciseSkeem = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Please add a username"]
	},
	description: {
		type: String,
		required: true
	},
	muscles: [{
		type: String,
		required: true
	}],
	equipment: [{
		type: String,
		required: true
	}],
	difficulty: {
		type: Number,
		required: true
	},
	videoUrls: [{
		type: String,
		required: true
	}],
	// user specific fields
	repetitions: {
		type: Number,
		required: false,
	},
	caloriesPerRepetition: {
		type: String,
		required: false,
	},
});

const exerciseSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	muscles: [{
		type: String,
		required: true
	}],
	equipment: [{
		type: String,
		required: true
	}],
	difficulty: {
		type: Number,
		required: true
	},
	videoUrl: {
		type: String,
		required: true
	}
});