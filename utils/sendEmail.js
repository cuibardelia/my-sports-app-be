require('dotenv').config({path: './config/.env'});

const mailService = require('nodemailer');

const sendEmail = (options) => {
	 const transporter = mailService.createTransport({
		 service: process.env.EMAIL_SERVICE,
		 auth: {
			 user: process.env.EMAIL_SENDER,
			 pass: process.env.EMAIL_PW,
		}
	 });

	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: options.to,
		subject: options.subject,
		html: options.text
	}

	transporter.sendMail(mailOptions, function(error, info) {
		if (error) {
			console.log(error);
		} else {
			console.log(info);
		}
	})
};

module.exports = sendEmail;