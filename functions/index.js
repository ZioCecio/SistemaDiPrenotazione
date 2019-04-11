const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
const functions = require("firebase-functions");

const express = require("express");
const bodyParser = require("body-parser");

const app = express();
require("dotenv").config();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.databaseURL //  "https://<PROJECT_ID>.firebaseio.com"
});

const db = admin.firestore();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("BELLA DA CLOUD");
});

app.get("/users/:id", (req, res) => {});

app.post("/signup", (req, res) => {
  admin
    .auth()
    .createUser({
      email: req.body.email,
      password: req.body.password
    })
    .then(user => {
      const data = {
        name: req.body.name,
        surname: req.body.surname
      };

      db.collection("users")
        .doc(user.uid)
        .set(data);
    })
    .catch(err => console.log(err.message));

  res.send("AAA");
});

app.listen(3000, () => console.log("In ascolto sulla porta 3000"));

//exports.app = functions.https.onRequest(app);
