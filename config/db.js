const mongoose = require('mongoose');
const ClientSchema = require('../schemas/Client')
const TrainerSchema = require('../schemas/Trainer')

const connectDBs = async () => {
    // TODO: check if options ok
    const clientConnection = mongoose.createConnection(process.env.MONGO_CLIENTS, { useNewUrlParser: true, useUnifiedTopology: true });
    clientConnection.on('error', console.error.bind(console, 'Connection error:'));
    clientConnection.once('open', function() {
        console.log('Connected to clients');
    });
   const Client = clientConnection.model('Client', ClientSchema);

// Create a connection to the second database
    const trainerConnection = mongoose.createConnection(process.env.MONGO_TRAINERS, { useNewUrlParser: true, useUnifiedTopology: true })
    trainerConnection.on('error', console.error.bind(console, 'Connection error:'));
    trainerConnection.once('open', function() {
        console.log('Connected to trainers');
    });
    const Trainer = trainerConnection.model('Trainer', TrainerSchema);

    return { Client, Trainer };
};

module.exports = connectDBs;
