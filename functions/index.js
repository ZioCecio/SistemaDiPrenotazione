const functions = require("firebase-functions");
const morgan = require("morgan");
const express = require("express");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");

const authRoute = require("./Routes/authRoute");
const usersRoute = require("./Routes/usersRoute");
const eventsRoute = require("./Routes/eventsRoute");

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  messagge: "Too many requests, please try again later."
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(limiter);

app.use("/", authRoute);
app.use("/users", usersRoute);
app.use("/events", eventsRoute);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.all("*", (req, res) => {
  res.status(501).json({ msg: "Method not implemented." });
});

/*
app.listen(process.env.PORT, () =>
  console.log(`In ascolto sulla porta ${process.env.PORT}`)
);
*/

exports.app = functions.https.onRequest(app);
