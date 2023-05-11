const mongoose = require('mongoose');

// TODO: revisit
// TODO: class plan
// trainer specific fields
// repetitions: {
// 	type: Number,
// 		required: false,
// },
// caloriesPerRepetition: {
// 	type: String,
// 		required: false,
// },
// difficulty: {
// 	type: Number,
// 		required: true
// },
const ExerciseSchema = new mongoose.Schema({
	oId: {
		type: String,
		required: [true, "How could ID be missing?"],
	},
	name: {
		type: String,
		required: [true, "Exercise name missing"]
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
		required: [true, "Won't save without a pic"]
	},
	videoUrl: {
		type: String,
		required: false
	}
});

const Exercise = mongoose.model("Exercise", ExerciseSchema);

module.exports = Exercise;