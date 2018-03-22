const jwt = require('jsonwebtoken');
const fs = require('fs');
const inputValidator = require('../handlers/inputValidator');
const CompanyModel = require('../mongodb/schemaAndModel').CompanyModel;

let jwtSecret = (() => {
    if (process.env.JWT_SECRET) {
        console.log('retrieved secret from env-vars ;)');
        return process.env.JWT_SECRET;
    } else if (fs.existsSync('env/dev_vars.js')) {
        return require('../env/dev_vars').JWT_SECRET;
    } else {
        return null;
    }
})();

const authModule = {

    login: async (req, res, next) => {
        const user = req.body.user
        if (!user) {
            res.status(404).end("No login data sent");
        } else {
            try {
                let validation = inputValidator.processData(user);
                if (validation != "all data is valid") {
                    return res.status(400).send({ invalidInput: validation });
                }
                let matchedUser = await authModule.findExistingUser(user);
                const authToken = jwt.sign(matchedUser, jwtSecret);
                res.setHeader("Authorization", authToken)
                // delete username and password keys from matched user, then responsd with a full login status
                delete matchedUser.Username
                delete matchedUser.Password
                let loginStatus = {
                    isLoggedIn: true,
                    jwtToken: authToken,
                    loggedInUser: matchedUser
                }
                return res.status(200).json(loginStatus);
            }
            catch (err) {
                console.log(err);
                return res.status(401).send(err.message);
            }
        }
    },

    verifyLogin: function (req, res, next) {
        let authToken = req.headers.authorization;
        if (authToken == null && authToken == '') {
            res.status(401).send("No authentication token given");
        } else {
            authModule.validateAndDecodeToken(authToken)
                .then(decoded_data => {
                    return authModule.findExistingUser(decoded_data)
                })
                .then(result => {
                    if (!result.validUser) {
                        return res.status(401).send(result.msg);
                    } else {
                        if (req.path == '/') {
                            // no further route - return ok (verified)
                            res.status(200).send('ok')
                        } else {
                            // further route found, handle further route
                            return next();
                        }
                    }
                })
                .catch((err) => {
                    return res.status(500).send(err);
                })
        }
    },

    findExistingUser: function (user) {
        return CompanyModel.findOne({ Username: user.Username, Password: user.Password })
            .select(['_id', 'Username', 'Password', 'CompanyName', 'CompanyNumber', 'Country', 'Address', 'About', 'LogoURL'])
            .then(foundCompany => {
                if (!foundCompany || foundCompany.length < 1) {
                    throw new Error("No User/Company registration under those credentials");
                }
                foundCompany._doc.validUser = true;
                return foundCompany._doc
            })
            .catch(err => {
                throw err;
            })
    },

    validateAndDecodeToken: function (token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, jwtSecret, function (err, decodedToken) {
                if (err) {
                    console.log(err)
                    return reject({ msg: "Token validation process failed", errData: err });
                }
                return resolve(decodedToken);
            });
        })
    }
}

module.exports = authModule;