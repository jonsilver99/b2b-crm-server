'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema

const CompanySchema = new Schema({
    Username: { type: String, required: true },
    Password: { type: String, required: true },
    CompanyName: { type: String, required: true },
    CompanyNumber: { type: Number, required: true },
    Country: { type: String, required: true },
    Address: { type: String, default: " - NA - " },
    About: { type: String, default: " - NA - " },
    LogoURL: { type: String, default: "" },
    Customers: [{ type: Schema.Types.ObjectId, ref: 'companymodel' }],
    Invoices: [{ type: Schema.Types.ObjectId, ref: 'invoicemodel' }]
});

const InvoiceSchema = new Schema({
    SuppliedBy: {
        CompanyId: { type: Schema.Types.ObjectId, ref: 'companymodel' },
        CompanyName: String
    },
    SuppliedTo: {
        CompanyId: { type: Schema.Types.ObjectId, ref: 'companymodel' },
        CompanyName: String
    },
    ServiceGiven: { type: String, default: "- N.A -" },
    Date: { type: Date, default: Date.now },
    Discount: { type: Number, min: 0, max: 90, default: 0 },
    Price: { type: Number, min: 1, required: true },
    PaymentType: { type: String, enum: ['cash', 'credit', 'check', 'N.A', ''] },
    Status: { type: String, enum: ['Paid', 'Not-paid'], default: "Not-paid" }
});

InvoiceSchema.pre('save', function (next) {
    // resolve payment type field
    if (this.PaymentType === "") {
        this.PaymentType = 'N.A';
    }

    // resolve price after discount
    this.Discount = this.Discount / 100
    this.Price = this.Price - this.Price * this.Discount;

    // re-assure date value
    if (!this.Date) {
        this.Date = Date.now();
    }
    next();
})

// Models 
module.exports = {
    CompanyModel: mongoose.model('companymodel', CompanySchema),
    InvoiceModel: mongoose.model('invoicemodel', InvoiceSchema)
}