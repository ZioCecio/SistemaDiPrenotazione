const functions = require("firebase-functions");
const morgan = require("morgan");

const express = require("express");
const bodyParser = require("body-parser");

const authRoute = require("./Routes/authRoute");
const usersRoute = require("./Routes/usersRoute");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/", authRoute);
app.use("/users", usersRoute);

/*
app.listen(process.env.PORT, () =>
  console.log(`In ascolto sulla porta ${process.env.PORT}`)
);
*/

exports.app = functions.https.onRequest(app);
