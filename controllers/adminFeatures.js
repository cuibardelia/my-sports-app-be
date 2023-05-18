const cloudinary = require('cloudinary').v2;
const Trainer = require('../schemas/Trainer');
const Client = require('../schemas/Client');
const Exercise = require('../schemas/Exercise');
const { getModel } = require('../utils/common');
const { getUsers } = require('./commonFeatures');

cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.CLOUD_KEY,
	api_secret: process.env.CLOUD_SECRET,
});

// TODO: admin receives a request via email and proceeds to delete
exports.deleteUser = async (request, response, next) => {
	try {
		const { _id, userType } = request.body;
		const model = getModel(userType);
		const user = await model.findOne({ _id });

		// TODO: check if need to verify db roles for this one
		// FIXME: delete from connected users documents as well
		if (user) {
			await user.remove();
			return response.status(200).json({ message: 'User deleted successfully.' });
		} else {
			return response.status(404).json({ error: 'User not found.' });
		}
	} catch (error) {
		next(error);
	}
};

exports.updateTrainer = async (request, response, next) => {
	try {
		const { _id, bio, specialties, picUrl } = request.body;
		const trainer = await Trainer.findOne({ _id });

		if (trainer) {
			if (bio !== undefined) {
				trainer.bio = bio;
			}

			if (specialties !== undefined) {
				if (Array.isArray(specialties)) {
					specialties.forEach((specialty) => {
						if (!trainer.specialties.includes(specialty)) {
							trainer.specialties.push(specialty);
						}
					});
				} else {
					if (!trainer.specialties.includes(specialties)) {
						trainer.specialties.push(specialties);
					}
				}
			}

			if (picUrl !== undefined) {
				trainer.picUrl = picUrl;
			}

			await trainer.save();
			return response.status(200).json({ message: 'Trainer info updated successfully.' });
		} else {
			return response.status(404).json({ error: 'Trainer not found.' });
		}
	} catch (error) {
		next(error);
	}
};

exports.getClients = async (request, response, next) => {
	await getUsers(request, response, next, Client);
};


exports.deleteExercise = async (request, response, next) => {
	try {
		const { exerciseId } = request.body;
		const exercise = await Exercise.findOne({ id: exerciseId });

		if (exercise) {
			// FIXME
			const exerciseIdToDelete = exercise._id;
			await Trainer.updateMany({ favoriteExercises: exerciseIdToDelete }, { $pull: { favoriteExercises: exerciseIdToDelete } });
			await Client.updateMany({ favoriteExercises: exerciseIdToDelete }, { $pull: { favoriteExercises: exerciseIdToDelete } });
			exercise.remove();
			return response.status(200).json({success: true, message: 'Exercise deleted successfully.'});
		} else {
			return response.status(404).json({ error: 'Exercise not found.' });
		}
	} catch (error) {
		next(error);
	}
};