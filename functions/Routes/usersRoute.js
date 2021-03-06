const express = require("express");
const admin = require("./../firebase_modules/engine").admin;
const db = require("./../firebase_modules/engine").firestore;
const { check } = require("express-validator/check");
const auth = require("./../firebase_modules/engine").authenticate;

const router = express.Router();

router.use(
  [
    check("token", "You must provide a token to access resources.")
      .exists()
      .not()
      .isEmpty()
  ],
  auth
);

router.get("/", (req, res) => {
  if (req.query.email) {
    return db
      .collection("users")
      .where("email", "==", req.query.email)
      .get()
      .then(users => {
        if (users.docs.length === 0)
          return res.status(404).json({ msg: "User not found." });

        const ret = users.docs[0].data();
        if (req.uid !== ret.id) delete ret.subscribedEvents;

        return res.status(200).json(ret);
      })
      .catch(err => res.status(422).json({ msg: err.message }));
  }

  db.collection("users")
    .get()
    .then(results => {
      let users = [];

      results.forEach(user => users.push(user.data()));

      return users;
    })
    .then(users => res.status(200).json(users))
    .catch(err => res.status(422).json({ msg: err.message }));
});

router.get("/:id", (req, res) => {
  db.collection("users")
    .doc(req.params.id)
    .get()
    .then(user => {
      if (!user.exists) return res.status(404).json({ msg: "User not found." });

      const ret = user.data();
      if (req.uid !== req.params.id) delete ret.subscribedEvents;

      res.status(200).json(ret);
    })
    .catch(err => res.status(422).json({ msg: err.message }));
});

router.put("/:id", (req, res) => {
  if (req.uid !== req.params.id)
    return res.status(401).json({ msg: "Unauthorized." });

  let newUser = {};
  if (req.body.name !== undefined) newUser.name = req.body.name;
  if (req.body.surname !== undefined) newUser.surname = req.body.surname;

  if (Object.keys(newUser).length === 0)
    return res.status(400).json({ msg: "At least one field must be updated." });

  db.collection("users")
    .doc(req.params.id)
    .update(newUser)
    .then(() => res.status(200).json(newUser))
    .catch(err => res.status(422).json({ msg: err.message }));
});

router.delete("/:id", (req, res) => {
  if (req.uid !== req.params.id)
    return res.status(401).json({ msg: "Unauthorized." });

  admin
    .auth()
    .deleteUser(req.params.id)
    .then(() => {
      db.collection("users")
        .doc(req.params.id)
        .delete()
        .then(() => res.status(200).json({ id: req.uid }));

      db.collection("events")
        .where("owner", "==", req.params.id)
        .get()
        .then(results => {
          results.forEach(event => {
            db.collection("events")
              .doc(event.id)
              .delete();
          });
        });
    })
    .catch(err => res.status(422).json({ msg: err.message }));
});

module.exports = router;
