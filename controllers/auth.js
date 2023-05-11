require('dotenv').config({path: "./config/.env"});
const Client = require('../schemas/Client');
const Trainer = require('../schemas/Trainer');
const Admin = require('../schemas/Admin');

const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');

const grantRolesToUser = require('../utils/auth');

// TODO: refactor, reusability??
exports.registerClient = async (request, response, next) => {
    // response.send('Register route')
    const {username, lastName, firstName, email, password} = request.body;

    try {
        const client = await Client.create({
            username, lastName, firstName, email, password
        })

        sendToken(client, 201, response);
    } catch (error) {
      next(error);
    }
};

exports.registerTrainer = async (request, response, next) => {
    const { firstName, lastName, email, dateOfBirth, gender, phone, password } = request.body;

    try {
        const trainer = await Trainer.create({
            firstName, lastName, email, password, dateOfBirth, gender, phone,
        })

        sendToken(trainer, 201, response);
    } catch (error) {
        next(error);
    }
};

exports.registerAdmin = async (request, response, next) => {
    const {email, password} = request.body;

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

const login = async (request, response, next, model) => {
    const { email, password } = request.body;

    // good practice to check on BE side as well
    if(!email || !password) {
        return next(new ErrorResponse("Please provide an email and password"), 400);
    }

    try {
        const user = await model.findOne({email}).select("+password");

        // model.find({}, function (err, users) {
        //     if (err) {
        //         console.error(err);
        //     } else {
        //         console.log(users);
        //     }
        // });

        if(!user) {
            return next(new ErrorResponse("Invalid credentials"), 401);
        }

        const isVerified = await user.checkPassword(password);

        if(!isVerified) {
            return next(new ErrorResponse("Invalid password"), 404);
        }

        sendToken(user, 200, response);

    } catch (error) {
        next(error);
    }
};

exports.clientLogin = async (request, response, next) => {
    await login(request, response, next, Client);
};

exports.trainerLogin = async (request, response, next) => {
    await login(request, response, next, Trainer);
};

exports.adminLogin = async (request, response, next) => {
    await login(request, response, next, Admin);
};

const forgotPassword = async (request, response, next, model) => {
    const { email } = request.body;

    try{
        const user = await model.findOne({ email });

        if (!user) {
            return next(new ErrorResponse("Unable to find email"), 404);
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
                subject: "Looks like you forgot your password",
                text: message,
            });

            response.status(200).json({success: true, data: "Yeehaaw! Email successfully sent"});
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPassworExpored = undefined;

            await user.save();
            return next(new ErrorResponse("Cannot send email, God knows why", 500));
        }

    } catch (error) {
        next(error);
    }

};

exports.clientForgotPassword = async (request, response, next) => {
    await forgotPassword(request, response, next, Client);
};

exports.trainerForgotPassword = async (request, response, next) => {
    await forgotPassword(request, response, next, Trainer);
};

exports.adminForgotPassword = async (request, response, next) => {
    await forgotPassword(request, response, next, Admin);
};

const resetPassword = async (request, response, next, model) => {
    const ResetPwdToken = crypto.createHash("sha256").update(request.params.resetToken).digest('hex');
    try {
        const usr = await model.findOne({
            resetPasswordToken: ResetPwdToken,
            // query in db
            resetPasswordExpire: { $gt: Date.now()}
        });

        if(!usr) {
          return next(new ErrorResponse("OoOps! Invalid reset token", 400))
        }

        usr.password = request.body.password;
        // we don't want the client to keep same token again
        usr.resetPasswordToken = undefined;
        usr.resetPasswordExpire = undefined;

        await usr.save();

        response.status(201).json({
            success: true,
            data: "Password reset successful"

        })
    } catch (e) {
        next(e);
    }
};

exports.clientResetPassword = async (request, response, next) => {
    await resetPassword(request, response, next, Client);
};

exports.trainerResetPassword = async (request, response, next) => {
    await resetPassword(request, response, next, Trainer);
};

exports.adminResetPassword = async (request, response, next) => {
    await resetPassword(request, response, next, Admin);
};

const sendToken = (user, statusCode, response) => {
    const accessToken = user.getSignedToken();
    response.status(statusCode).json({success: true, accessToken, user})
}