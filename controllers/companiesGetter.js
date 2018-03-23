'use strict';
const CompanyModel = require('../mongodb/schemaAndModel').CompanyModel;
module.exports = (req, res, next) => {
    let userId = req.query.loggedInUser;
    CompanyModel.find({})
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
}