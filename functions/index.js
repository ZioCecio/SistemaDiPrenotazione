const firebase = require("firebase");
const functions = require("firebase-functions");
const express = require("express");
const bodyParser = require("body-parser");

require("dotenv").config();

const app = express();

firebase.initializeApp({
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("BELLA DA CLOUD");
});

app.post("/signup", (req, res) => {
  firebase
    .auth()
    .createUserWithEmailAndPassword(req.body.email, req.body.password)
    .catch(err => {
      console.log(err);
    });

  res.send("POST RICEVUTO");
});

app.listen(3000, () => console.log("In ascolto sulla porta 3000"));

//exports.app = functions.https.onRequest(app);
