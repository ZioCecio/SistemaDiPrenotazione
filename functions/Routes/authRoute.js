const express = require("express");
const firebase = require("./../firebase_modules/engine").firebase;
const admin = require("./../firebase_modules/engine").admin;
const db = require("./../firebase_modules/engine").firestore;

const { check, validationResult } = require("express-validator/check");

const router = express.Router();

router.post(
  "/signup",
  [
    check("email", "Incorrect email.")
      .exists()
      .isEmail(),
    check("password", "Incorrect password.")
      .exists()
      .isLength({ min: 6 }),
    check("name", "You must provide a name.")
      .exists()
      .not()
      .isEmpty(),
    check("surname", "You must provide a surname.")
      .exists()
      .not()
      .isEmpty()
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json(errors.array({ onlyFirstError: true }));

    admin
      .auth()
      .createUser({
        email: req.body.email,
        password: req.body.password
      })
      .then(user => {
        const data = {
          name: req.body.name,
          surname: req.body.surname,
          id: user.uid,
          email: req.body.email,
          subscribedEvents: [],
          createdEvents: []
        };

        db.collection("users")
          .doc(user.uid)
          .set(data)
          .then(() => {
            firebase
              .auth()
              .signInWithEmailAndPassword(req.body.email, req.body.password)
              .then(user => {
                user.user.getIdToken(true).then(id => {
                  data.token = id;
                  res.status(200).json(data);
                });
              });
          })
          .catch(err => res.status(422).json({ msg: err.message }));
      })
      .catch(err => res.status(422).json({ msg: err.message }));
  }
);

router.post(
  "/signin",
  [
    check("email", "Email must be a valid string.")
      .exists()
      .isEmail(),
    check("password", "You must provide a password.").exists()
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json(errors.array({ onlyFirstError: true }));

    firebase
      .auth()
      .signInWithEmailAndPassword(req.body.email, req.body.password)
      .then(user => {
        user.user.getIdToken(true).then(id => {
          res.status(200).json({ token: id, id: user.user.uid });
        });
      })
      .catch(err => res.status(422).json({ msg: err.message }));
  }
);

module.exports = router;
