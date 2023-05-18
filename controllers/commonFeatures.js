const Trainer = require('../schemas/Trainer');
const Exercise = require('../schemas/Exercise');
const { v2: cloudinary } = require('cloudinary');


const getUsers = async (request, response, next, model) => {
	try {
		const users = await model.find();

		if (users) {
			return response.status(200).json({success: true, users});
		} else {
			return response.status(404).json({ error: 'No such users yet' });
		}
	} catch (error) {
		next(error);
	}
};

// FIXME: admin should not see trainer token
const getTrainers = async (request, response, next) => {
	await getUsers(request, response, next, Trainer);
};

const removeFavoriteExercise = async (request, response, next) => {
	try {
		const { id } = request.body;
		const { user } = request;

		if (!user) {
			return response.status(404).json({ error: 'User not found.' });
		}

		if (!(user?.favoriteExercises?.includes(id))) {
			return response.status(404).json({ error: 'Exercise not favorite.' });
		} else {
			const index = user.favoriteExercises.indexOf(id);
			user.favoriteExercises.splice(index, 1);
		}
		await user.save();

		return response.status(200).json({success: true, user});
	} catch (error) {
		next(error);
	}
};

const getFavoriteExercises = async (request, response, next) => {
	const { user } = request;

	try {
		const favoriteExerciseIds = user.favoriteExercises || [];
		const favoriteExercises = await Exercise.find({ id: { $in: favoriteExerciseIds } });

		return response.status(200).json({ success: true, data: favoriteExercises });
	} catch (error) {
		next(error);
	}
};

 const addFavoriteExercise = async (request, response, next) => {
	try {
		const { id, name, bodyPart, equipment, gifUrl } = request.body;
		const { user } = request;
		// Find or create the exercise by its original ID
		let exercise = await Exercise.findOne({ id });

		if (!exercise) {
			exercise = await Exercise.create({ id, name, bodyPart, equipment, gifUrl });
		}

		if (!user.favoriteExercises) {
			user.favoriteExercises = [];
		}

		const exerciseId = exercise.id;
		const exerciseExists = user.favoriteExercises.some((favExercise) =>
			favExercise === exerciseId
		);

		if (exerciseExists) {
			return response.status(400).json({ error: 'Exercise is already a favorite.' });
		}

		// Add the exercise original ID to the client's favoriteExercises array
		user.favoriteExercises.push(exerciseId);

		// Save the user document with the new favorites
		await user.save();

		return response.status(200).json({success: true, user});
	} catch (error) {
		next(error);
	}
};

const uploadPic  = async (request, response, next) => {
	try {
		const file = request.file;
		const result = await cloudinary.uploader.upload(file.path);
		const imageUrl = result.secure_url;

		response.status(200).json({ imageUrl });
	} catch (error) {
		next(error);
	}
}

module.exports = {
	getUsers, getTrainers, uploadPic, addFavoriteExercise, getFavoriteExercises, removeFavoriteExercise
};