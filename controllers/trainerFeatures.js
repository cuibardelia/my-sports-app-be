const Client = require('../schemas/Client');
const SessionPlan = require('../schemas/SessionPlan');
const Exercise = require('../schemas/Exercise');
const Appointment = require('../schemas/Appointment');

exports.addTrainingSession = async (request, response, next) => {
	const { exercises,  difficulty, notes, expectedResults, name } = request.body;
	const { user } = request;

	try {

		const exerciseIdValues = exercises.map((exercise) => exercise.id);

		const exercisesData = await Exercise.find({
			id: { $in: exerciseIdValues },
		});

		const equipment = Array.from(new Set(exercisesData.map(exercise => exercise.equipment)));
		const targets = Array.from(new Set(exercisesData.map(exercise => exercise.bodyPart)));

		const session = new SessionPlan({
			name,
			trainer: user._id,
			exercises,
			notes,
			difficulty,
			equipment,
			targets,
			expectedResults,
		});

		await session.save();
		user.sessions.push(session._id);
		await user.save();

		return response.status(200).json({ success: true, session });
	} catch (error) {
		next(error);
	}
};

exports.getSession = async (request, response, next) => {
	const { sessionId } = request.body;
	const { user } = request;

	try {
		const session = user.sessions.find((s) => s._id.equals(sessionId));

		if (!session) {
			return response.status(404).json({ success: false, message: 'Session does not exist among trainer plans' });
		}
		const sessionDoc = await SessionPlan.findById(sessionId).populate('exercises._id');

		if (!sessionDoc) {
			return response.status(404).json({ success: false, message: 'Session document not found' });
		}

		return response.status(200).json({ success: true, session: sessionDoc });
	} catch (error) {
		next(error);
	}
};

exports.getSessions = async (request, response, next) => {
	const { user } = request;

	try {
		const sessions = await SessionPlan.find({ trainer: user._id }).populate('exercises._id');

		return response.status(200).json({ success: true, sessions });
	} catch (error) {
		next(error);
	}
};

// delete the whole plan
exports.deleteSessionPlan = async (request, response, next) => {
	const { sessionId } = request.body;
	const { user } = request;

	try {
		const sessionPlan = await SessionPlan.findById(sessionId);

		if (!sessionPlan) {
			return response.status(404).json({ success: false, message: 'Session plan not found' });
		}

		const trainer = await user.update({$pull: { sessions: sessionId }});

		await sessionPlan.deleteOne();

		return response.status(200).json({ success: true, trainer });
	} catch (error) {
		next(error);
	}
};

const getFavoriteExercises = async (client) => {
	const favoriteExerciseIds = client.favoriteExercises || [];
	return await Exercise.find({ id: { $in: favoriteExerciseIds } });
};

const getFullClientsData = async (clients) => {
	return await Promise.all(
		clients.map(async (client) => {
			const clientCopy = client.toObject();
			return { ...clientCopy, favoriteExercises: await getFavoriteExercises(client) };
		})
	);
};

exports.getClientsForPT = async (request, response, next) => {
	const { user } = request;

	try {
		const users = await Client.find({ favoriteTrainers: user._id });
		const clients = await getFullClientsData(users);

		return response.status(200).json({ clients });
	} catch (error) {
		next(error);
	}
};

exports.createAppointment = async (request, response, next) => {
	const { session, roomName, startDate, endDate, clients } = request.body;
	const { user } = request;

	try {
		const appointment = new Appointment({
			trainer: user._id,
			session,
			roomName,
			startDate,
			endDate,
			clients,
		});

		user.appointments.push(appointment._id);
		await user.save();

		for (const clientId of clients) {
			const client = await Client.findById(clientId);
			if (client) {
				client.appointments.push(appointment._id);
				await client.save();
			}
		}

		await appointment.save();

		return response.status(200).json({ success: true, appointment });
	} catch (error) {
		next(error);
	}
};

exports.getAppointments = async (request, response, next) => {
	const { user } = request;

	try {
		const appointments = await Appointment.find({ trainer: user._id })
			.populate({
				path: 'session',
				populate: { path: 'exercises._id' }
			})
			.populate('clients', 'firstName lastName')
			.exec();

		return response.status(200).json({ success: true, appointments });
	} catch (error) {
		return next(error);
	}
};