const express = require("express");
const admin = require("./../firebase_modules/engine").admin;
const db = require("./../firebase_modules/engine").firestore;
const { check, validationResult } = require("express-validator/check");

const router = express.Router();

router.get("/", (req, res) => {
  db.collection("users")
    .get()
    .then(results => {
      const users = [];
      results.forEach(doc => {
        let user = doc.data();
        admin
          .auth()
          .getUser(doc.id)
          .then(u => {
            user.email = u.email;
            users.push(user);
          });
      });

      res.json(users);
    });
});

module.exports = router;
