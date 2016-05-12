const express = require('express');
const router = express.Router();
const knex = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.get('/me', function (req, res, next) {
  // get authorization header
  // 'Bearer sdkjsdafjklsdfjer2qe12' or nothing
  if (req.headers.authorization) {
    // parse with string logic
     const token = req.headers.authorization.split(' ')[1];
     // decode token
     const payload = jwt.verify(token, process.env.JWT_SECRET);

     // find user that matches that id
     knex('users').where({id: payload.id}).first()
      .then(function (user) {
       if (user) {
         // return the user object
         res.json({id: user.id, name: user.name})
       } else {
         res.status(403).json({
           error: "Invalid ID"
         })
       }
     })
   } else {
  res.status(403).json({
    error: "WHERE IS YOUR MOTHERFUCKING TOKEN??"
  })
}
})

router.post('/signup', function(req, res, next) {
  const errors = []

  // check that email, name, password are all there
  if (!req.body.email || !req.body.email.trim()) errors.push("Email can't be blank");
  if (!req.body.name || !req.body.name.trim()) errors.push("Name can't be blank");
  if (!req.body.password || !req.body.password.trim()) errors.push("Password can't be blank");

  //  if not, return an error
  if (errors.length) {
    res.status(422).json({
      errors: errors
    })
  } else {
    // check to see if the email already exists in the db
    knex('users')
    .whereRaw('lower(email) = ?', req.body.email.toLowerCase())
    .count()
    .first()
    .then(function (result) {
      if(result.count === "0") {
        //  hash password
        const saltRounds = 4
        const passwordHash = bcrypt.hashSync(req.body.password, saltRounds);

        //  knex insert stuff from req.body and password_hash
        knex('users')
          .insert({
            email: req.body.email,
            name: req.body.name,
            password_hash: passwordHash
          })
          .returning("*")
          .then(function (users) {
            //  send back id, email, name, token
            const user = users[0];
            // create token
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
            res.json({
              id: user.id,
              name: user.name,
              email: user.email,
              token: token
            })
          })
      } else {
        //  if email exists, return an error
        res.status(422).json({
          errors: ['Email is already in the database!']
        })
      }
    })
  }
});

module.exports = router;
