'use strict';
const CompanyModel = require('../mongodb/schemaAndModel').CompanyModel;
const companiesRouter = require('express').Router()

// get all companies
companiesRouter.get('/', (req, res, next) => {
    let userId = req.query.loggedInUser;
    let skipValue = parseInt(req.query.skip);

    CompanyModel.find({}, null, { skip: skipValue, limit: 15, sort: { $natural: 1 } })
        .select(["CompanyName", "CompanyNumber", "Country", "Address", "About", "LogoURL", "Customers"])
        .lean()
        .then(allCompanies => {
            for (let i = 0; i < allCompanies.length; i++) {
                // if this is my company (if user' id == company's id) mark it is my company
                if (allCompanies[i]._id.toString() == userId) {
                    allCompanies[i].IsMyCompany = true;
                    continue;
                }
                // if logged in user (his company rather) is a customer of this company - mark it down as service provider
                for (let k = 0; k < allCompanies[i].Customers.length; k++) {
                    if (allCompanies[i].Customers[k].toString() == userId) {
                        allCompanies[i].ImACustomer = true;
                    }
                }
            }
            res.status(200).send(allCompanies);
        })
        .catch(err => {
            res.status(500).send(err);
        })
})

companiesRouter.get('/myServiceProviders/:loggedInUser', (req, res, next) => {
    let userId = req.params.loggedInUser;
    let skipValue = parseInt(req.query.skip);
    CompanyModel.find({ Customers: userId }, null, { skip: skipValue })
        .select(["CompanyName", "CompanyNumber", "Country", "Address", "About", "LogoURL", "Customers"])
        .lean()
        .then(companies => {
            let batch = [] //max 15;
            for (let i = 0; i < companies.length; i++) {
                if (batch.length >= 15) {
                    break;
                }
                companies[i].ImACustomer = true
                batch.push(companies[i])
            }
            res.status(200).send(batch);
        })
        .catch(err => {
            res.status(500).send(err);
        })
})


module.exports = companiesRouter;

// module.exports = (req, res, next) => {
//     let userId = req.query.loggedInUser;
//     CompanyModel.find({})
//         .select(["CompanyName", "CompanyNumber", "Country", "Address", "About", "LogoURL", "Customers"])
//         .lean()
//         .then(allCompanies => {
//             for (let i = 0; i < allCompanies.length; i++) {
//                 // if this is my company (if user' id == company's id) mark it is my company
//                 if (allCompanies[i]._id.toString() == userId) {
//                     allCompanies[i].IsMyCompany = true;
//                     continue;
//                 }
//                 // if logged in user (his company rather) is a customer of this company - mark it down as service provider
//                 for (let k = 0; k < allCompanies[i].Customers.length; k++) {
//                     if (allCompanies[i].Customers[k].toString() == userId) {
//                         allCompanies[i].ImACustomer = true;
//                     }
//                 }
//             }
//             res.status(200).send(allCompanies);
//         })
//         .catch(err => {
//             res.status(500).send(err);
//         })
// }