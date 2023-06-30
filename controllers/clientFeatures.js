const Trainer = require('../schemas/Trainer');
const { getAge } = require('../utils/common');
const Appointment = require('../schemas/Appointment');
const moment = require('moment-timezone');
moment.tz.setDefault('UTC');

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

// exports.updateSettings = async (request, response, next) => {
// 	const { user } = request;
// 	const { height } = request.body;
//
// 	const monthlyDates = [
// 		"2022-07-22T18:34:32.058+00:00",
// 		"2022-06-22T18:34:32.058+00:00",
// 		"2022-08-18T18:34:32.058+00:00",
// 		"2022-09-19T18:34:32.058+00:00",
// 		"2022-10-20T18:34:32.058+00:00",
// 		"2022-11-10T18:34:32.058+00:00",
// 		"2022-12-11T18:34:32.058+00:00",
// 		"2023-01-03T18:34:32.058+00:00",
// 		"2023-02-08T18:34:32.058+00:00",
// 	];
//
// 	const weights = [
// 		102, 99, 83, 77, 73, 66, 68, 62, 60,
// 	];
//
// 	try {
// 		const goalWeight = 57;
//
// 		const parsedDateOfBirth = moment(user.dateOfBirth).startOf('day').toDate();
//
// 		const date = "2023-01-22T18:34:32.058+00:00";
//
// 		// Add the first entry to user.objectives using values from arrays
// 		user.objectives = [
// 			{
// 				initialWeight: weights[0],
// 				dateInitial: monthlyDates[0],
// 				goalWeight
// 			}
// 		];
//
// 		for (let i = 1; i < monthlyDates.length; i++) {
// 			const weightStat = {
// 				date: monthlyDates[i],
// 				value: weights[i]
// 			};
// 			user.weightStats.push(weightStat);
// 			user.currentWeight = weights[i];
// 			if (goalWeight === weights[i]) {
// 				user.objectives[0].dateAchieved = monthlyDates[i];
// 			}
// 		}
//
//
// 		user.goalWeight = goalWeight;
//
// 		user.height = height;
//
// 		user.dateOfBirth = parsedDateOfBirth;
//
// 		user.age = getAge(user.dateOfBirth);
//
// 		await user.save();
//
// 		return response.status(200).json({ success: true, user });
// 	} catch (error) {
// 		next(error);
// 	}
// };

exports.updateSettings = async (request, response, next) => {
	const { user } = request;
	const { currentWeight, goalWeight, height, dateOfBirth } = request.body;

	try {
		// NEW OBJECTIVE
		if (goalWeight !== user.goalWeight) {
			const objective = {
				initialWeight: currentWeight,
				dateInitial: new Date(),
				goalWeight,
			}
			// FIRST OBJECTIVE
			if (!user.objectives?.length) {
				user.objectives = [objective];
			} else {
				// SOME NEW OBJECTIVE
				user.objectives.push(objective);
			}
		} else if (currentWeight !== user.currentWeight) { 	// NEW STAT
			// LATEST OBJECTIVE ATTAINED
			if (currentWeight === goalWeight && user.objectives.length) {
				user.objectives[user.objectives.length - 1].dateAchieved = new Date();
			}
		}

		const weightStat = {
			date: new Date(),
			value: currentWeight
		};

		// Add a new weight stat whenever the weight fluctuates
		if (!currentWeight !== user.currentWeight) {
			user.weightStats.push(weightStat);
		}

		user.currentWeight = currentWeight || user.currentWeight;
		user.goalWeight = goalWeight || user.goalWeight;
		user.height = height;
		const parsedDateOfBirth = moment(dateOfBirth || user.dateOfBirth).startOf('day').toDate();
		user.dateOfBirth = parsedDateOfBirth;
		user.age = getAge(user.dateOfBirth);

		await user.save();

		return response.status(200).json({ success: true, user });
	} catch (error) {
		next(error);
	}
};

exports.updatePhoto = async (request, response, next) => {
	const { user } = request;
	const { picUrl } = request.body;

	try {
		user.picUrl = picUrl;
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

exports.getUserWeightStats =  async (request, response, next) => {
	const { user } = request;
	const { startDate, endDate } = request.body;

	try {
		const startParts = startDate.split('-');
		const endParts = endDate.split('-');
		const startMonth = parseInt(startParts[0]) - 1;
		const startYear = parseInt(startParts[1]);
		const endMonth = parseInt(endParts[0]) - 1;
		const endYear = parseInt(endParts[1]);

		const startDateObj = new Date(startYear, startMonth);
		const endDateObj = new Date(endYear, endMonth);

		const weightStats = user.weightStats.filter((stat) => {
			const statDate = new Date(stat.date);
			return statDate >= startDateObj && statDate <= endDateObj;
		});

		return response.status(200).json({ success: true, weightStats });
	} catch (error) {
		next(error);
	}
};

exports.getAppointments = async (request, response, next) => {
	const { user } = request;

	try {
		const appointments = await Appointment.find({ clients: { $in: [user._id] } })
			.populate({
				path: 'session',
				populate: { path: 'exercises._id' },
			})
			.populate({
				path: 'clients',
				select: 'firstName lastName',
			})
			.exec();

		return response.status(200).json({ success: true, appointments });
	} catch (error) {
		return next(error);
	}
};