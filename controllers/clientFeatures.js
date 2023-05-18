const Trainer = require('../schemas/Trainer');

exports.addPersonalTrainer = async (request, response, next) => {
	try {
		const { _id } = request.body;
		const { user } = request;
		const trainer = await Trainer.findById(_id);

		if (!trainer) {
			return response.status(404).json({ error: 'Trainer not found.' });
		}

		// Unfortunately I have to check this for previous clients :">
		if (!user.favoriteTrainers) {
			user.favoriteTrainers = [];
		}

		const trainerExists = user.favoriteTrainers.some((trainerId) => String(trainerId) === _id);
		if (trainerExists) {
			return response.status(400).json({ error: 'Trainer is already a favorite.' });
		}

		user.favoriteTrainers.push(_id);
		// Save the user document with the new favorites
		await user.save();

		return response.status(200).json({success: true, user});
	} catch (error) {
		next(error);
	}
};

exports.updateSettings = async (request, response, next) => {
	const { user } = request;
	const { currentWeight, goalWeight, height, picUrl } = request.body;

	try {
		user.currentWeight = currentWeight || user.currentWeight;
		user.goalWeight = goalWeight || user.goalWeight;
		user.height = height || user.height;
		user.picUrl = picUrl || user.picUrl;

		await user.save();

		return response.status(200).json({ success: true, user });
	} catch (error) {
		next(error);
	}
};

exports.getPersonalTrainers = async (request, response, next) => {
	const { user } = request;

	try {
		const updatedUser = await user.populate('favoriteTrainers');

		return response.status(200).json({ success: true, users: updatedUser.favoriteTrainers });
	} catch (error) {
		next(error);
	}
};