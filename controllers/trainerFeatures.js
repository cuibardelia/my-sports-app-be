const Session = require('../schemas/SessionPlan');
const Client = require('../schemas/Client');

exports.addTrainingSession = async (request, response, next) => {
	const { user , body: { clientId, sessionData } } = request;
	try {

		// TODO: if exercise not in db, add
		const session = await Session.create({ ...sessionData, trainer: user._id });

		// Add the session to the trainer's sessions
		user.sessions.push(session);
		await user.save();

		// // Find the client by ID and add the session to their sessions
		// const client = await Client.findById(clientId);
		// if (!client) {
		// 	return response.status(404).json({ error: 'Client not found.' });
		// }
		//
		// client.sessions.push(session);
		// await client.save();

		return response.status(200).json({ message: 'Session added successfully.' });

	} catch (error) {
		next(error);
	}
};

exports.getClientsForPT = async (request, response, next) => {
	const { user } = request;

	try {
		const clients = await Client.find({ favoriteTrainers: user._id });
		return response.status(200).json({ clients });
	} catch (error) {
		next(error);
	}
};