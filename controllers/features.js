const Client = require('../schemas/Client');
const Trainer = require('../schemas/Trainer');
const Exercise = require('../schemas/Exercise');

exports.favoriteExercise = async (request, response, next) => {
	try {
		const { id, name, bodyPart, equipment, gifUrl } = request.body;
		const userId = request.header('user-id');
		const userType = request.header('user-type');

		// Validate the userType header
		if (!['client', 'trainer'].includes(userType)) {
			return response.status(400).json({ message: 'Invalid user type.' });
		}

		const model = userType === 'trainer' ? Trainer : Client;
		const user = await model.findOne({ _id: userId });

		if (!user) {
			return response.status(404).json({ error: 'User not found.' });
		}

		// Find or create the exercise by its original ID
		let exercise = await Exercise.findOne({ oId: id });

		if (!exercise) {
			exercise = await Exercise.create({ oId: id, name, bodyPart, equipment, gifUrl });
		}

		if (!user.favoriteExercises) {
			user.favoriteExercises = [];
		}

		const exerciseId = exercise._id
		const exerciseExists = user.favoriteExercises.some((favExercise) =>
			favExercise.equals(exerciseId)
		);

		if (exerciseExists) {
			return response.status(400).json({ error: 'Exercise is already a favorite.' });
		}

		// Add the exercise ID to the client's favoriteExercises array
		user.favoriteExercises.push(exerciseId);

		// Save the user document with the new favorites
		await user.save();

		return response.status(200).json({ message: 'Exercise saved as a favorite successfully.' });
	} catch (error) {
		next(error);
	}
};

exports.getFavoriteExercises = async (request, response, next) => {
	const userId = request.header('user-id');
	const userType = request.header('user-type');
	try {
		let user;
		let favoriteExercises = [];

		const model = userType === 'trainer' ? Trainer : Client;
		user = await model.findById(userId).populate('favoriteExercises');

		if (!user) {
			return response.status(404).json({ error: 'User not found.' });
		}

		favoriteExercises = user.favoriteExercises;

		return response.status(200).json({ favoriteExercises });
	} catch (error) {
		next(error);
	}
};