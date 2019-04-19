const express = require("express");
const db = require("./../firebase_modules/engine").firestore;
const { check, validationResult } = require("express-validator/check");
const admin = require("./../firebase_modules/engine").admin;
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
  if (req.query.type) {
    return db
      .collection("events")
      .where("type", "==", req.query.type)
      .get()
      .then(results => {
        const events = [];

        results.forEach(result => {
          const ret = result.data();
          ret.id = result.id;
          events.push(ret);
        });

        return events;
      })
      .then(events => res.status(200).json(events))
      .catch(err => res.status(422).json({ msg: err.message }));
  }

  db.collection("events")
    .get()
    .then(results => {
      const events = [];

      results.forEach(result => {
        const ret = result.data();
        ret.id = result.id;
        events.push(ret);
      });

      return events;
    })
    .then(events => res.status(200).json(events))
    .catch(err => res.status(422).json({ msg: err.message }));
});

router.get("/:id", (req, res) => {
  db.collection("events")
    .doc(req.params.id)
    .get()
    .then(event => {
      if (!event.exists)
        return res.status(404).json({ msg: "Event not found." });

      const ret = event.data();
      ret.id = event.id;
      return res.status(200).json(ret);
    })
    .catch(err => res.status(422).json({ msg: err.message }));
});

router.post(
  "/",
  [
    check("name", "You must provide an event name.")
      .exists()
      .not()
      .isEmpty(),
    check(
      "description",
      "You must provide an event description (also empty)."
    ).exists(),
    check("date", "Incorrect date.")
      .exists()
      .isISO8601(),
    check("place", "Incorrect place.")
      .exists()
      .isLatLong(),
    check("type", "You must provide an event type.")
      .exists()
      .not()
      .isEmpty(),
    check("maxPartecipants", "Incorrect number of partecipants.")
      .exists()
      .isInt()
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json(errors.array({ onlyFirstError: true }));

    const [lat, long] = req.body.place.split(",");

    const event = {
      owner: req.uid,
      name: req.body.name,
      description: req.body.description,
      date: Date(req.body.date),
      place: {
        lat: lat,
        long: long
      },
      maxPartecipants: req.body.maxPartecipants,
      type: req.body.type,
      subcribedUsers: []
    };

    db.collection("events")
      .add(event)
      .then(e => {
        db.collection("users")
          .doc(req.uid)
          .update({
            createdEvents: admin.firestore.FieldValue.arrayUnion(e.id)
          })
          .then(() => {
            event.id = e.id;
            res.status(200).json(event);
          });
      })
      .catch(err => res.status(422).json({ msg: err.message }));
  }
);

router.put(
  "/:id",
  [
    check("name", "You must provide a not empty name.")
      .not()
      .isEmpty()
      .optional(),
    check(
      "maxPartecipants",
      "Max number of partecipants must be a valid number"
    )
      .not()
      .isEmpty()
      .isInt({ min: 1 })
      .optional(),
    check("type", "You must provide a not empty type.")
      .not()
      .isEmpty()
      .optional(),
    check("date", "Incorrect date.")
      .isISO8601()
      .optional(),
    check("place", "Incorrect place.")
      .isLatLong()
      .optional()
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json(errors.array({ onlyFirstError: true }));

    db.collection("events")
      .doc(req.params.id)
      .get()
      .then(result => {
        if (!result.exists)
          return res.status(404).json({ msg: "Event not found." });
        if (result.data().owner !== req.uid)
          return res.status(401).json({ msg: "Unauthorized." });
      })
      .then(() => {
        let newEvent = {};

        if (req.body.name !== undefined) newEvent.name = req.body.name;
        if (req.body.description !== undefined)
          newEvent.description = req.body.description;
        if (req.body.date !== undefined) newEvent.date = Date(req.body.date);
        if (req.body.place !== undefined) newEvent.place = req.body.place;
        if (req.body.maxPartecipants !== undefined)
          newEvent.maxPartecipants = req.body.maxPartecipants;
        if (req.body.type !== undefined) newEvent.type = req.body.type;

        if (Object.keys(newEvent).length === 0)
          return res
            .status(400)
            .json({ msg: "At least one field must be updated." });

        db.collection("events")
          .doc(req.params.id)
          .update(newEvent)
          .then(() => res.status(200).json(newEvent));
      })
      .catch(err => res.status(422).json({ msg: err.message }));
  }
);

module.exports = router;
