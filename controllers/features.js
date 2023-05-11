const Client = require('../schemas/Client');
const Trainer = require('../schemas/Trainer');
// const Admin = require('../schemas/Admin');
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

exports.deleteExercise = async (request, response, next) => {
	try {
		const { exerciseId } = request.body;
		const userType = request.header('user-type');

		// Check if the user is an admin
		// TODO: worth checking if the userId in in the admin collection + token? => ROUTING
		// TODO: delete other admins
		if (userType === 'admin') {
			// const admin = await Admin.findOne({ _id: userId });
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
		} else {
			// User is not an admin, return an error indicating insufficient permissions
			return response.status(403).json({ error: 'Insufficient permissions to delete the exercise.' });
		}
	} catch (error) {
		next(error);
	}
};