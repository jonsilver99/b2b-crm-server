'use strict';

let ilegalChars = new RegExp(/[|&;$%@"'<>(){}+,]/g);
let maxLength = {
    CompanyName: 35,
    CompanyNumber: 20,
    Username: 35,
    Password: 35,
    Address: 35,
    Country: 45,
    About: 35,
    SuppliedBy: 35,
    SuppliedTo: 35,
    ServiceGiven: 200,
    Price: 12
}

let requiredFields = ["CompanyName", "CompanyNumber", "Country", "Username", "Password", "SuppliedBy", "SuppliedTo", "Price"]

class InputValidator {

    static processData(data) {

        let errors = {}

        for (let fieldName in data) {
            let validationStatus = this.isValid(fieldName, data[fieldName])
            if (validationStatus !== 'valid') {
                errors[fieldName] = validationStatus
            }
        }

        return (Object.keys(errors).length === 0 && errors.constructor === Object) ? 'all data is valid' : errors;
    }

    static isValid(fieldName, fieldValue) {
        let fieldErrors = [];

        if (requiredFields.includes(fieldName)) {
            if (this.hasNoValue(fieldValue)) {
                fieldErrors.push('No input given');
            }
        }

        if (this.ilegalValue(fieldValue)) {
            fieldErrors.push('Input contains ilegal chars');
        }

        if (this.invalidLength(fieldValue, maxLength[fieldName])) {
            fieldErrors.push('input is too long ');
        }

        return (fieldErrors.length > 0) ? fieldErrors : 'valid';
    }


    static hasNoValue(input) {
        return (input == null || input == '') ? true : false;
    }

    static ilegalValue(input) {
        return (ilegalChars.test(input)) ? true : false;
    }

    static invalidLength(input, maxLengthAllowed) {
        return (input.length > maxLengthAllowed) ? true : false;
    }

    static sanitizeValue(input, replaceValue) {
        return input.replace(ilegal, replaceValue);
    }

    static assertFileIsImage(file) {
        if (!file.mimetype.includes('image', 0)) {
            throw new Error('Unsupported image format')
        }
    }

}

module.exports = InputValidator; 