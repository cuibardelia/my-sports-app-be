const mongoose = require('mongoose');

// TODO: revisit
// TODO: class plan
const ExerciseSchema = new mongoose.Schema({
	id: {
		type: String,
		required: [true, 'How could ID be missing?'],
		unique: true,
	},
	name: {
		type: String,
		required: [true, 'Exercise name missing']
	},
	// description: {
	// 	type: String,
	// },
	bodyPart: {
		type: String,
		required: true
	},
	equipment: {
		type: String,
		required: true
	},
	gifUrl: {
		type: String,
		required: [true, 'Won\'t save without a pic']
	},
	videoUrl: {
		type: String,
		required: false
	}
});

const Exercise = mongoose.model('Exercise', ExerciseSchema);

module.exports = Exercise;