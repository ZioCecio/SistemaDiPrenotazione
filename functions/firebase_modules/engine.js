const firebase = require("firebase");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

require("dotenv").config();

firebase.initializeApp({
  apiKey: process.env.API_KEY,
  authDomanin: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.databaseURL //  "https://<PROJECT_ID>.firebaseio.com"
});

module.exports.firebase = firebase;

module.exports.admin = admin;

module.exports.firestore = admin.firestore();
