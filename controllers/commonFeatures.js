const Trainer = require('../schemas/Trainer');
const Client = require('../schemas/Client');
const Appointment = require('../schemas/Appointment');
const Exercise = require('../schemas/Exercise');
const { v2: cloudinary } = require('cloudinary');
const moment = require('moment-timezone');
moment.tz.setDefault('UTC');

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

		return response.status(200).json({ success: true, data: favoriteExerciseIds });
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

const getWinners = async (request, response, next) => {
	try {
		const startDate = moment().startOf('isoWeek').toDate();
		const endDate = moment().endOf('isoWeek').toDate();

		const appointmentsThisWeek = await Appointment.find({
			startDate: { $gte: startDate, $lte: endDate }
		});

		const appointmentsCount = {};
		appointmentsThisWeek.forEach(appointment => {
			appointment.clients.forEach(clientId => {
				if (appointmentsCount[clientId]) {
					appointmentsCount[clientId]++;
				} else {
					appointmentsCount[clientId] = 1;
				}
			});
		});

		const clientIds = Object.keys(appointmentsCount);
		const topClients = await Client.find({ _id: { $in: clientIds } });

		const sortedClients = topClients.sort(
			(a, b) => appointmentsCount[b._id] - appointmentsCount[a._id]
		);

		const topClientsWithCount = [];
		let prevCount = null;

		for (const element of sortedClients) {
			const client = element;
			const appointmentCount = appointmentsCount[client._id];

			if (topClientsWithCount.length < 2 || appointmentCount === prevCount) {
				topClientsWithCount.push({ client, appointmentCount });
			} else {
				break;
			}

			prevCount = appointmentCount;
		}

		return response.status(200).json({ topClients: topClientsWithCount });
	} catch (error) {
		next(error);
	}
};

const getObjectiveAttainers = async (request, response, next) => {
	try {
		const clients = await Client.find({
			'objectives.dateAchieved': { $exists: true },
		})
			.sort({ 'objectives.dateAchieved': -1 })
			.limit(2)
			.select('username picUrl objectives.dateAchieved objectives.initialWeight objectives.goalWeight')
			.lean();

		const result = clients.map((client) => {
			const { username, picUrl, objectives } = client;
			// TODO: latest objective
			const { dateAchieved, initialWeight, goalWeight } = objectives[0];
			const weightDifference = initialWeight - goalWeight;
			const weightStatus = weightDifference > 0 ? `${weightDifference}kg lost` : `${Math.abs(weightDifference)}kg gained`;

			return {
				username,
				picUrl,
				dateAchieved,
				weightStatus,
			};
		});

		return response.status(200).json({ success: true, clients: result });
	} catch (error) {
		next(error);
	}
};


module.exports = {
	getUsers, getTrainers, uploadPic, addFavoriteExercise, getFavoriteExercises, removeFavoriteExercise, getWinners, getObjectiveAttainers
};