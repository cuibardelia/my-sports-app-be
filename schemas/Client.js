require('dotenv').config({path: './config/.env'});

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('./User');

const ClientSchema= new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: [true, 'Please add a username']
    },
    resetPasswordToken: String,
    resetPasswordExp: Date,
    currentWeight: Number,
    goalWeight: Number,
    weightStats: [{
        date: Date,
        value: Number,
    }],
    objectives: [{
        initialWeight: Number,
        dateInitial: Date,
        goalWeight: Number,
        dateAchieved: Date,
    }],
    height: Number,
    favoriteTrainers:  [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trainer',
    }],
});

ClientSchema.add(User.schema);

// pre-saving and post-saving via mongoose
// no arrow function -> use of this
ClientSchema.pre('save', async function(next) {
    // first we make sure we don;t hash an already hashed pass
    if(!this.isModified('password')) {
        next();
    }

    // generate a salt, the higher the number, the more secure
    const salt = await bcrypt.genSalt(10);
    // save the new hashed password, then save the document
    this.password = await bcrypt.hash(this.password, salt);
    this.userType = 'client';

    next();
});

ClientSchema.methods.checkPassword = async function(pwd) {
    return await bcrypt.compare(pwd, this.password);
};

ClientSchema.methods.getSignedToken = function() {
    // fun fact, generated secret via 'cypto' with randomBytes
    return jwt.sign({id: this._id}, process.env.JWT_CLIENT_SECRET, {
        expiresIn: '1d'
    });
};

ClientSchema.methods.getResetPassToken = function() {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    // makes sure it expires in 30 minutes;
    this.resetPasswordExpire = Date.now() + 30 * (60 * 1000);

   return resetToken;
};

const Client = mongoose.model('Client', ClientSchema);

module.exports = Client;