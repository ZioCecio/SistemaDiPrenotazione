const firebase = require("firebase");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
const { validationResult } = require("express-validator/check");

require("dotenv").config();

firebase.initializeApp({
  apiKey: process.env.API_KEY,
  authDomanin: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.databaseURL
});

module.exports.firebase = firebase;

module.exports.admin = admin;

module.exports.firestore = admin.firestore();

module.exports.authenticate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json(errors.array({ onlyFirstError: true }));

  admin
    .auth()
    .verifyIdToken(req.get("token"))
    .then(decodedToken => {
      req.uid = decodedToken.uid;
      next();
    })
    .catch(err => {
      res.status(401).json({ msg: err.message });
    });
};
