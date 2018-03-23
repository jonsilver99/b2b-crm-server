'use strict';
const invoicesRouter = require('express').Router()
const CompanyModel = require('../mongodb/schemaAndModel').CompanyModel;
const InvoiceModel = require('../mongodb/schemaAndModel').InvoiceModel;
const inputValidator = require('../handlers/inputValidator');

// get all my invoices
invoicesRouter.get('/:userId', (req, res, next) => {
    if (!req.params.userId) {
        res.status(404).end("user id not found");
    } else {
        InvoiceModel.find({ 'SuppliedTo.CompanyId': req.params.userId })
            .then(myInvoices => {
                res.status(200).send(myInvoices);
            })
            .catch(err => {
                res.status(500).send(err);
            })
    }
});

// create new invoice
invoicesRouter.post('/', (req, res, next) => {
    const invoiceData = req.body;
    const customerId = invoiceData.SuppliedTo.CompanyId;
    if (!invoiceData) {
        res.status(404).end("No invoice data sent");
    } else {
        let validation = inputValidator.processData(invoiceData);
        if (validation != "all data is valid") {
            return res.status(400).send({ invalidInput: validation });
        }
        let newInvoice = new InvoiceModel(invoiceData)
        newInvoice.save()
            .then(savedInvoice => {
                return CompanyModel.findByIdAndUpdate(
                    customerId, { "$push": { Invoices: savedInvoice._id } }, { new: true }
                )
            })
            .then(updatedCustomer => {
                res.status(200).send({ successMsg: 'New Invoice Sent!' });
            })
            .catch(err => {
                res.status(500).send(err);
            })
    }
});

// update existing invoice (in this case we just redeem/pay the invoice - but sending more params in the
// body payload will update those params as well)
invoicesRouter.post('/:invoiceId', (req, res, next) => {
    const invoiceToUpdate = req.body._id;
    const updateData = req.body;

    InvoiceModel.findByIdAndUpdate(invoiceToUpdate, updateData, { new: true })
        .then(updatedInvoice => {
            res.status(200).send({ successMsg: 'Invoice Updated', updatedInvoice: updatedInvoice });
        })
        .catch(err => {
            res.status(500).send(err);
        })
});

module.exports = invoicesRouter;