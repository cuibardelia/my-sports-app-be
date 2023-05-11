const Trainer = require('../schemas/Trainer');
const { getModel } = require('../utils/common');

// TODO: admin receives a request via email and proceeds to delete
exports.deleteUser = async (request, response, next) => {
	try {
		const { _id, userType } = request.body;
		const model = getModel(userType);
		const user = await model.findOne({ _id });

		// TODO: check if need to verify db roles for this one
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
		const { _id, bio, specialties } = request.body;
		const trainer = await Trainer.findOne({ _id });

		if (trainer) {
			if (!!bio) {
				trainer.bio = bio;
			}

			// TODO: delete one of the sp
			if (!!specialties) {
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

			await trainer.save();
			return response.status(200).json({ message: 'Specialties and/or Bio updated successfully.' });
		} else {
			return response.status(404).json({ error: 'Trainer not found.' });
		}
	} catch (error) {
		next(error);
	}
};