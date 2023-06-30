require('dotenv').config({path: './config/.env'});
const Client = require('../schemas/Client');
const Trainer = require('../schemas/Trainer');
const Admin = require('../schemas/Admin');

const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');
const grantRolesToUser = require('../utils/auth');
const { getModel, getAge } = require('../utils/common');

exports.registerAdmin = async (request, response, next) => {
    const { email, password } = request.body;

    try {
        const admin = await Admin.create({
            email, password
        })

        await grantRolesToUser(email, password);
        sendToken(admin, 201, response);
    } catch (error) {
        next(error);
    }
};

exports.register = async (request, response, next) => {
    const { userType } = request.params;
    const {
        firstName,
        lastName,
        email,
        password,
        dateOfBirth,
        gender,
        phone,
        username
    } = request.body;

    try {
        let user;
        const commonFields = { lastName, firstName, email, password, gender, phone };

        if (userType === 'client') {
            user = await Client.create({
                username,
            ...commonFields
            });
        } else if (userType === 'trainer') {
           const age = getAge(dateOfBirth);
            user = await Trainer.create({
            ...commonFields,
                dateOfBirth,
                age,
            });
        } else {
            return response.status(400).json({ error: 'Invalid user type.' });
        }

        sendToken(user, 201, response);
    } catch (error) {
        next(error);
    }
};

exports.login = async (request, response, next) => {
    const { email, password } = request.body;
    const userType = request.header('X-User-Type');
    const model = getModel(userType);

    // it's good practice to check on BE side as well
    if(!email || !password) {
        return next(new ErrorResponse('Please provide an email and password'), 400);
    }

    try {
        const user = await model.findOne({email}).select('+password');

        // model.find({}, function (err, users) {
        //     if (err) {
        //         console.error(err);
        //     } else {
        //         console.log(users);
        //     }
        // });

        if(!user) {
            return next(new ErrorResponse(`This email is not registered yet.`), 401);
        }

        const isVerified = await user.checkPassword(password);

        if(!isVerified) {
            return next(new ErrorResponse('Invalid password. Please retry.'), 404);
        }

        sendToken(user, 200, response);

    } catch (error) {
        next(error);
    }
};

exports.forgotPassword = async (request, response, next) => {
    const { email } = request.body;
    const userType = request.header('X-User-Type');
    const model = getModel(userType);

    try{
        const user = await model.findOne({ email });

        if (!user) {
            return next(new ErrorResponse('Unable to find email'), 404);
        }

        const resetToken = user.getResetPassToken();
        // save the reset pass token field to the db
        await user.save();
        const resetUrl = `${process.env.RESET_PW_CLIENT_URL}/${resetToken}`;
        const message = `
            <h1> You have requested a new password </h1>
            <p> Here's your link to reset your password </p>
            <a href=${resetUrl} clicktracking='off'>${resetUrl}</a>
        `

        try {
            await sendEmail({
                to: user.email,
                subject: 'Looks like you forgot your password',
                text: message,
            });

            response.status(200).json({success: true, data: 'Yeehaaw! Email successfully sent'});
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPassworExpored = undefined;

            await user.save();
            return next(new ErrorResponse('Cannot send email, God knows why', 500));
        }

    } catch (error) {
        next(error);
    }

};

exports.resetPassword = async (request, response, next) => {
    const userType = request.header('X-User-Type');
    const model = getModel(userType);

    const ResetPwdToken = crypto.createHash('sha256').update(request.params.resetToken).digest('hex');
    try {
        const usr = await model.findOne({
            resetPasswordToken: ResetPwdToken,
            // query in db
            resetPasswordExpire: { $gt: Date.now()}
        });

        if(!usr) {
          return next(new ErrorResponse('OoOps! Invalid reset token', 400))
        }

        usr.password = request.body.password;
        // we don't want the client to keep same token again
        usr.resetPasswordToken = undefined;
        usr.resetPasswordExpire = undefined;

        await usr.save();

        response.status(201).json({
            success: true,
            data: 'Password reset successful'
        })
    } catch (e) {
        next(e);
    }
};

const sendToken = (user, statusCode, response) => {
    const accessToken = user.getSignedToken();
    response.status(statusCode).json({success: true, accessToken, user})
}

exports.getObjectiveStats = async (request, response, next) => {
    try {
        const totalClients = await Client.countDocuments(); // Total number of clients
        const clientsWithObjective = await Client.countDocuments({ 'objectives.dateAchieved': { $exists: true } }); // Number of clients with achieved objectives

        const percentageAchieved = (clientsWithObjective / totalClients) * 100; // Percentage of clients with achieved objectives

        const objectives = await Client.aggregate([
            {
                $match: {
                    'objectives.dateAchieved': { $exists: true },
                },
            },
            {
                $project: {
                    timeToAchieve: {
                        $subtract: [
                            { $toDate: { $arrayElemAt: ['$objectives.dateAchieved', 0] } },
                            { $toDate: { $arrayElemAt: ['$objectives.dateInitial', 0] } },
                        ],
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    averageTimeToAchieve: { $avg: '$timeToAchieve' },
                },
            },
        ]);

        const averageTimeToAchieve = objectives.length > 0 ? objectives[0].averageTimeToAchieve : 0;


        return response.status(200).json({ success: true, stat:  { percentageAchieved,
            averageTimeToAchieve} });

    } catch (e) {
        next(e);
    }
};

exports.getAgeIntervals = async (request, response, next) => {
    try {
        const ageIntervals = await Client.aggregate([
            {
                $group: {
                    _id: null,
                    interval_18_30: {
                        $sum: {
                            $cond: [
                                { $and: [{ $gte: ['$age', 18] }, { $lt: ['$age', 30] }] },
                                1,
                                0
                            ]
                        }
                    },
                    interval_30_45: {
                        $sum: {
                            $cond: [
                                { $and: [{ $gte: ['$age', 30] }, { $lt: ['$age', 45] }] },
                                1,
                                0
                            ]
                        }
                    },
                    interval_45_60: {
                        $sum: {
                            $cond: [
                                { $and: [{ $gte: ['$age', 45] }, { $lt: ['$age', 60] }] },
                                1,
                                0
                            ]
                        }
                    },
                    interval_over_60: {
                        $sum: {
                            $cond: [
                                { $gte: ['$age', 60] },
                                1,
                                0
                            ]
                        }
                    },
                    total: { $sum: 1 }
                }
            },
            {
                $addFields: {
                    interval_18_30: {
                        $multiply: [{ $divide: ['$interval_18_30', '$total'] }, 100]
                    },
                    interval_30_45: {
                        $multiply: [{ $divide: ['$interval_30_45', '$total'] }, 100]
                    },
                    interval_45_60: {
                        $multiply: [{ $divide: ['$interval_45_60', '$total'] }, 100]
                    },
                    interval_over_60: {
                        $multiply: [{ $divide: ['$interval_over_60', '$total'] }, 100]
                    }
                }
            },
            {
                $addFields: {
                    interval_18_30: { $trunc: '$interval_18_30' },
                    interval_30_45: { $trunc: '$interval_30_45' },
                    interval_45_60: { $trunc: '$interval_45_60' },
                    interval_over_60: { $trunc: '$interval_over_60' }
                }
            },
            {
                $project: {
                    _id: 0,
                    interval_18_30: { $ifNull: ['$interval_18_30', 0] },
                    interval_30_45: { $ifNull: ['$interval_30_45', 0] },
                    interval_45_60: { $ifNull: ['$interval_45_60', 0] },
                    interval_over_60: { $ifNull: ['$interval_over_60', 0] }
                }
            }
        ]);

        const result = ageIntervals.length > 0 ? ageIntervals[0] : {
            interval_18_30: 0,
            interval_30_45: 0,
            interval_45_60: 0,
            interval_over_60: 0
        };

        return response.status(200).json({ success: true, ageIntervals: result });

    } catch (e) {
        next(e);
    }
};

exports.getTrainers = async (request, response, next) => {
    try {
        const users = await Trainer.find();

        if (users) {
            return response.status(200).json({success: true, users});
        } else {
            return response.status(404).json({ error: 'No such users yet' });
        }
    } catch (error) {
        next(error);
    }
};
exports.getExercises = async (request, response, next) => {
    try {
        const mostFavoriteExercises = await Client.aggregate([
            {
                $unwind: '$favoriteExercises',
            },
            {
                $group: {
                    _id: '$favoriteExercises',
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { count: -1 },
            },
            {
                $limit: 6,
            },
        ]);

        const exerciseIds = mostFavoriteExercises.map((exercise) => exercise._id);

        response.status(200).json({ success: true, exerciseIds });
    } catch (error) {
        next(error);
    }
};
