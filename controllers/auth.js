require('dotenv').config({path: './config/.env'});
const Client = require('../schemas/Client');
const Trainer = require('../schemas/Trainer');
const Admin = require('../schemas/Admin');

const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');
const grantRolesToUser = require('../utils/auth');
const { getModel } = require('../utils/common');


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

        if (userType === 'client') {
            user = await Client.create({
                username,
                lastName,
                firstName,
                email,
                password
            });
        } else if (userType === 'trainer') {
            user = await Trainer.create({
                firstName,
                lastName,
                email,
                password,
                dateOfBirth,
                gender,
                phone
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
            return next(new ErrorResponse('Invalid credentials'), 401);
        }

        const isVerified = await user.checkPassword(password);

        if(!isVerified) {
            return next(new ErrorResponse('Invalid password'), 404);
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