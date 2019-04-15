const express = require("express");
const admin = require("./../firebase_modules/engine").admin;
const db = require("./../firebase_modules/engine").firestore;
const { check, validationResult } = require("express-validator/check");
const auth = require("./../firebase_modules/engine").authenticate;

const router = express.Router();

router.use(
  [
    check("token", "You must provide a token to access resources")
      .exists()
      .not()
      .isEmpty()
  ],
  auth
);

router.get("/", (req, res) => {
  db.collection("users")
    .get()
    .then(results => {
      let users = [];

      results.forEach(user => users.push(user.data()));

      return users;
    })
    .then(users => res.status(200).json(users));
});

router.get("/:id", (req, res) => {
  db.collection("users")
    .doc(req.params.id)
    .get()
    .then(user => {
      if (!user.exists) return res.status(404).json({ msg: "User not found" });
      res.status(200).json(user.data());
    })
    .catch(err => res.status(422).json({ msg: err.message }));
});

module.exports = router;
