const Client = require('../schemas/Client');
const Trainer = require('../schemas/Trainer');
const Exercise = require('../schemas/Exercise');
const { getModel } = require('../utils/common');

exports.favoriteExercise = async (request, response, next) => {
	try {
		const { id, name, bodyPart, equipment, gifUrl } = request.body;
		const { user: { userType, _id } } = request;

		const model = getModel(userType);
		const user = await model.findOne({ _id });

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
	const { user: { userType, _id } } = request;

	try {
		let user;
		let favoriteExercises = [];
		const model = getModel(userType)

		user = await model.findById(_id).populate('favoriteExercises');

		if (!user) {
			return response.status(404).json({ error: 'User not found.' });
		}

		favoriteExercises = user.favoriteExercises;

		return response.status(200).json({ favoriteExercises });
	} catch (error) {
		next(error);
	}
};

exports.deleteExercise = async (request, response, next) => {
	try {
		const { exerciseId } = request.body;
		const exercise = await Exercise.findOne({ oId: exerciseId });

		if (exercise) {
			const exerciseIdToDelete = exercise._id;
			// Delete the exercise in the trainers collection
			await Trainer.updateMany({ favoriteExercises: exerciseIdToDelete }, { $pull: { favoriteExercises: exerciseIdToDelete } });
			// Delete the exercise in  the clients collection
			await Client.updateMany({ favoriteExercises: exerciseIdToDelete }, { $pull: { favoriteExercises: exerciseIdToDelete } });
			exercise.remove();
			// Exercise was deleted
			return response.status(200).json({ message: 'Exercise deleted successfully.' });
		} else {
			// No exercise found with the specified oId
			return response.status(404).json({ error: 'Exercise not found.' });
		}
	} catch (error) {
		next(error);
	}
};