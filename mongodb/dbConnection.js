const mongoose = require('mongoose');

const mongooseConnection = {

    connect: () => {
        let dbPath = process.env.MONGODB_URI || "mongodb://localhost/CRM"
        mongoose.connect(dbPath);
        mongoose.connection.once('open', () => {
            console.log("mongodb connection established");
        }).on('error', (err) => {
            console.log("mongodb connection failed", err);
        })
    }
}

module.exports = mongooseConnection;
