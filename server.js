'use strict';
// Requires //
const express = require('express');
const cors_setup = require('./controllers/cors_setup');
const dbConnection = require('./mongodb/dbConnection');
const bodyParser = require('body-parser');
const expressFileUpload = require('express-fileupload');

const registrationRouter = require('./controllers/registrationRouter');
const authModule = require('./controllers/authModule');
const companiesGetter = require('./controllers/companiesGetter');
const customersRouter = require('./controllers/customersRouter');
const invoicesRouter = require('./controllers/invoicesRouter');

// connect to node
const server = express();
const PORT = process.env.PORT || 3005;

// connect mongodb via mongoose
dbConnection.connect();

// log any request
server.use((req, res, next) => {
    // traffic statistics and analytics go here - for now just log them requests
    console.log('requested url is', req.url);
    next();
})

// CORS definition middelware
server.use(cors_setup);

// parsers middleware
server.use(bodyParser.urlencoded({ extended: false }))
server.use(bodyParser.json())
server.use(expressFileUpload());

// Routing
server.use("/register", registrationRouter);
server.use("/login", authModule.login);
server.use("/api", authModule.verifyLogin);
server.use("/api/companies", companiesGetter);
server.use("/api/customers", customersRouter);
server.use("/api/invoices", invoicesRouter);

//Port listening
server.listen(PORT, () => {
    console.log(`Server listening on port : ${PORT}`);
});