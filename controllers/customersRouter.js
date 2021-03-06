'use strict';
const customersRouter = require('express').Router()
const CompanyModel = require('../mongodb/schemaAndModel').CompanyModel;
const InvoiceModel = require('../mongodb/schemaAndModel').InvoiceModel;

// Become a new customer of one of the other registered companies
customersRouter.post('/', (req, res, next) => {
    const companyId = req.body.companyId;
    const newCustomerId = req.body.newCustomerId;
    if (!companyId || !newCustomerId) {
        res.status(404).end("No data found");
    } else {
        CompanyModel.findByIdAndUpdate(companyId, { "$addToSet": { Customers: newCustomerId } }, { new: true })
            .select(["CompanyName", "CompanyNumber", "Country", "Address", "About", "LogoURL", "Customers"])
            .lean()
            .then(updatedCompany => {
                let result = { successMsg: null, updatedCompany: null }
                // validate that new customer is indeed registered
                let newCustomerList = updatedCompany.Customers;
                for (let i = 0; i < newCustomerList.length; i++) {
                    if (newCustomerList[i].toString() == newCustomerId) {
                        updatedCompany.ImACustomer = true;
                        result.successMsg = 'Customer sign-up succeeded';
                        result.updatedCompany = updatedCompany;
                    }
                }
                return result
            })
            .then(result => {
                if (result.successMsg == 'Customer sign-up succeeded') {
                    res.status(200).send(result)
                } else {
                    throw { error: 'Exception : Customer sign-up not validated' };
                }
            })
            .catch(err => {
                res.status(500).end(err);
            })
    }
})

// Get all customers to display as list on dom
customersRouter.get('/allmycustomers/:userId', (req, res, next) => {

    let userId = req.params.userId;
    let skipValue = parseInt(req.query.skip);

    CompanyModel.findById(userId)
        .select('Customers')
        .lean()
        .populate({
            path: "Customers",
            select: ["CompanyName", "CompanyNumber", "Country", "Address", "About", "LogoURL"],
            options: { skip: skipValue, limit: 15, sort: { $natural: 1 } }
        })
        .then(costumers => {
            console.log(costumers);
            res.status(200).send(costumers);
        })
        .catch(err => {
            res.status(500).send(err);
        })
})

// Get a specific customer, ALONG with the invoices issued to him by userId - and ONLY by userId
customersRouter.get('/oneofmycustomers/:userId/:customerId', (req, res, next) => {

    let userId = req.params.userId
    let customerId = req.params.customerId

    CompanyModel.findById(req.params.customerId)
        .populate({
            path: "Invoices",
            match: { 'SuppliedBy.CompanyId': req.params.userId }
        })
        .select(["CompanyName", "CompanyNumber", "Country", "Address", "About", "LogoURL", "Invoices"])
        .then(costumer => {
            res.status(200).send(costumer);
        })
        .catch(err => {
            res.status(500).send(err);
        })
})

module.exports = customersRouter;