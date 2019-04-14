const functions = require("firebase-functions");
const morgan = require("morgan");
const admin = require("./firebase_modules/engine").admin;

const express = require("express");
const bodyParser = require("body-parser");
const { check, validationResult } = require("express-validator/check");

const authRoute = require("./Routes/authRoute");
const usersRoute = require("./Routes/usersRoute");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));

/*
app.use(
  [
    check("token", "You must provide a token to access resources")
      .exists()
      .not()
      .isEmpty()
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json(errors.array());

    admin
      .auth()
      .verifyIdToken(req.get("token"))
      .then(decodedToken => {
        req.uid = decodedToken.uid;
        next();
      })
      .catch(error => {
        res.status(401).send(error.message);
      });
  }
);
*/

app.use("/", authRoute);
app.use("/users", usersRoute);

app.listen(process.env.PORT, () =>
  console.log(`In ascolto sulla porta ${process.env.PORT}`)
);

//exports.app = functions.https.onRequest(app);
