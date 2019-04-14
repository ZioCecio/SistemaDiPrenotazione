const express = require("express");
const firebase = require("./../firebase_modules/engine").firebase;
const admin = require("./../firebase_modules/engine").admin;
const db = require("./../firebase_modules/engine").firestore;

const router = express.Router();

router.post("/signup", (req, res) => {
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

router.post("/signin", (req, res) => {
  firebase
    .auth()
    .signInWithEmailAndPassword(req.body.email, req.body.password)
    .then(user => {
      user.user.getIdToken(true).then(id => {
        res.send(id);
      });
    })
    .catch(error => res.send(error));
});

router.get("/users/:id", (req, res) => {
  //console.log(req.get("token"));
  db.collection("users")
    .doc(req.params.id)
    .get()
    .then(user => {
      console.log(user.data());
      res.json(user.data());
    });
});

module.exports = router;
