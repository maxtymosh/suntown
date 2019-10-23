const express = require('express');
const router = express.Router();
const verifyToken = require('./utils');
const User = require('../models/user.model')
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../config');

 router.post('/register', (req, res) => {
   console.log(req.body)
   const user = new User({ username : req.body.username, password : req.body.password});
   user.save()
   .then(user => res.status(200).send(user))
     .catch(err => res.json(err))
})

router.get('/checkToken', verifyToken, (req, res) => {
  jwt.verify(req.token, config.secret, (err, authData) => {
    if(err) {
      res.sendStatus(401)
      return
    } else {
      res.sendStatus(200)
      return
    }
  })
})

router.post('/login', (req, res) => {
  User.findOne({ username: req.body.username }, (err, user) => {
    if(err) {
      res.sendStatus(500);
      return
    }
    if(!user) {
      res.status(404).json({ message: 'Ошибка: пользователь не найден' });
      return
    }
    user.comparePassword(req.body.password, (err, isMatch) => {
      if(err) {
        res.sendStatus(500)
        return
      }
      if(!isMatch) {
        res.status(404).json({ message: 'Ошибка: неправильный пароль' })
        return
      }
      if(isMatch){
        jwt.sign({ user }, config.secret, { expiresIn: '86400s' }, (err, token) => {
          if(err) {
            res.status(500);
            return
          }
          const { password, ...userData } = user.toObject();
          res.status(200).send({...userData, token});
        })
      }
    })
  })
})

module.exports = router;
