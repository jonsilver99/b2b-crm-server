const AWS = require('../external-services/aws-service');
const registrationRouter = require('express').Router()
const inputValidator = require('../handlers/inputValidator');
const CompanyModel = require('../mongodb/schemaAndModel').CompanyModel;

// async form validator
registrationRouter.get('/validateFieldValue', (req, res, next) => {
    let query = {};
    let fieldName = req.query.fieldName;
    let fieldValue = req.query.fieldValue;
    if (isNaN(fieldValue)) {
        let regex = new RegExp("^" + fieldValue + "$", 'gi')
        query[fieldName] = regex;
    } else {
        query[fieldName] = parseInt(fieldValue);
    }
    CompanyModel.find(query)
        .then(alreadyExists => {
            if (alreadyExists.length > 0) {
                return res.status(200).send('Already Exists');
            } else {
                return res.status(200).send('Unique');
            }
        })
        .catch(err => {
            return res.status(500).send(err);
        })
})

// register new company
registrationRouter.post('/', async (req, res) => {
    const companyData = req.body;
    const companyLogo = (req.files && req.files.CompanyLogo) ? req.files.CompanyLogo : false;

    if (!companyData) {
        res.status(404).end("No registration data sent");
    }
    else {
        let validation = inputValidator.processData(companyData);
        if (validation != "all data is valid") {
            return res.status(400).send({ invalidInput: validation });
        }
        if (companyLogo) {
            try {
                // assert file is an image
                inputValidator.assertFileIsImage(companyLogo);
                //save company logo to s3, get back a url to the saved image and add that url to companydata
                let logoURL = await AWS.uploadFileToS3Bucket(companyLogo);
                companyData.LogoURL = logoURL;
            }
            catch (err) {
                // if logo upload failed
                console.log(err);
                return res.status(500).send(err.message);
            }
        }
        let newCompany = new CompanyModel(companyData)
        newCompany.save()
            .then((savedCompany) => {
                res.status(200).send({ success: true, msg: `Company: ${savedCompany.CompanyName} registered succesfuly` });
            })
            .catch(err => {
                res.status(400).send(JSON.stringify(err));
            })
    }
})

module.exports = registrationRouter;