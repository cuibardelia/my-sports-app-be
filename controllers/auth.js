require('dotenv').config({path: "./config/.env"});

const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');

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
    const {firstName, lastName, email, dateOfBirth, gender, phone, password} = request.body;

    try {
        const trainer = await Trainer.create({
            firstName, lastName, email, password, dateOfBirth, gender, phone,
        })

        sendToken(trainer, 201, response);
    } catch (error) {
        next(error);
    }
};

exports.login = async (request, response, next) => {
    const {email, password} = request.body;

    // good practice to check on BE side as well
    if(!email || !password) {
        return next(new ErrorResponse("Please provide an email and password"), 400);
    }

    try {
        const client = await Client.findOne({email}).select("+password");
        // const trainer = await Trainer.findOne({email}).select("+password");
        // console.log('THISSS', Client);

        Client.find({}, function (err, clients) {
            if (err) {
                console.error(err);
            } else {
                console.log(clients);
            }
        });

        if(!client) {
            return next(new ErrorResponse("Invalid credentials"), 401);
        }

        const isVerified = await client.checkPassword(password);

        if(!isVerified) {
            return next(new ErrorResponse("Invalid password"), 404);
        }

        sendToken(client, 200, response);


    } catch (error) {
        next(error);
    }

};

exports.forgotPassword = async (request, response, next) => {
    const { email } = request.body;

    try{
        const client = await Client.findOne({ email });

        if (!client) {
            return next(new ErrorResponse("Unable to find email"), 404);
        }

        const resetToken = client.getResetPassToken();
        // save the reset pass token field to the db
        await client.save();
        const resetUrl = `${process.env.RESET_PW_CLIENT_URL}/${resetToken}`;
        const message = `
            <h1> You have requested a new password </h1>
            <p> Here's your link to reset your password </p>
            <a href=${resetUrl} clicktracking='off'>${resetUrl}</a>
        `

        try {
            await sendEmail({
                to: client.email,
                subject: "Looks like you forgot your password",
                text: message,
            });

            response.status(200).json({success: true, data: "Yeehaaw! Email successfully sent"});
        } catch (error) {
            client.resetPasswordToken = undefined;
            client.resetPassworExpored = undefined;

            await client.save();
            return next(new ErrorResponse("Cannot send email, God knows why", 500));
        }

    } catch (error) {
        next(error);
    }

};

exports.resetPassword = async (request, response, next) => {
    const ResetPwdToken = crypto.createHash("sha256").update(request.params.resetToken).digest('hex');
    try {
        const usr = await Client.findOne({
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

const sendToken = (user, statusCode, response) => {
    const accessToken = user.getSignedToken();
    response.status(statusCode).json({success: true, accessToken, user})
}