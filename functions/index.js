const functions = require("firebase-functions");

const express = require("express");
const bodyParser = require("body-parser");

const authRoutes = require("./Routes/authRoute");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/", authRoutes);

app.get("/", (req, res) => {
  res.send("BELLA DA CLOUD");
});

app.listen(3000, () => console.log("In ascolto sulla porta 3000"));

//exports.app = functions.https.onRequest(app);
