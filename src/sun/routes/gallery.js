const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Gallery = require('../models/gallery.model');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const verifyToken = require('./utils')
const config = require('../config');
const formatError = require('../utils/logValidationErrors');
const unlinkFiles = require('../utils/unlinkFilesOnError');
const imagemin = require('imagemin');
//const imageminJpegtran = require('imagemin-jpegtran');
//const imageminPngquant = require('imagemin-pngquant');


const storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, './gallery-images');
  },
  filename: function(req, file, cb){
    let ext = file.originalname.split('.').pop();
    cb(null, crypto.randomBytes(10).toString('hex') + '.' + ext);
  }
})

const upload = multer({ storage });
                        
router.post('/gallery', verifyToken, upload.single('image'), (req, res) => {
  jwt.verify(req.token, config.secret, (err, authData) => {
    if(err) {
      res.sendStatus(401)
      return
    }
    const galleryData = { description, imageAlt, imageTitle } = req.body;
    const image = req.file.path;
    const galleryPost = new Gallery({                        
      description,
      image,
      imageAlt,
      imageTitle
    })

  galleryPost.save()
    .then(galleryPost => {
      if(!galleryPost || galleryPost.length === 0){
        return res.status(500);
      }
      res.status(200).send(galleryPost);
    })
    .catch( err => {
      const errorMessages = formatError(err);
        if(errorMessages.length){
          unlinkFiles([[image]]);
          res.send(500 ,{
            message: errorMessages.join(',')
          })
          
        } else {
          res.status(500).json({
            message: 'Ошибка сервера'
          })
        }
    })
  })
})

router.put('/gallery/:_id', verifyToken, upload.single('image'), (req, res) => {
  jwt.verify(req.token, config.secret, (err, authData) => {
    if(err) {
      res.sendStatus(401)
      return
    }
  const editData = req.file ? { 
    ...req.body,
    image: req.file.path
  } : req.body;
  Gallery.findById(req.params._id, (err, oldPost) => {
    if(!oldPost){
      res.status(404).json({
        message: 'Ошибка: Запись не найдена.'
      })
      return
    }
    Gallery.findByIdAndUpdate(req.params._id, editData, { new: true }, (err, galleryPost) => {
      if(err){
        if(err.code == 11000){
          res.status(500).json({
            message: 'Ошибка: были найдены не уникальные поля'
          })
          return
        }
         res.status(500).send(err.errmsg);
      }
      else {
        if(req.file && fs.existsSync(oldPost.image)){
          fs.unlinkSync(oldPost.image)
        }
        res.status(200).send(galleryPost)
      }
    })
  })
})
})

router.delete('/gallery/:_id', verifyToken, (req, res) => {
  jwt.verify(req.token, config.secret, (err, authData) => {
    if(err) {
      res.sendStatus(401)
      return
    }
  Gallery.findByIdAndDelete(req.params._id, (err, galleryPost) => {
    if(!galleryPost){
      res.status(404).json({
        message: 'Ошибка: Запись не найдена.'
      })
      return
    }
    if(err) {
      res.status(500).send(err.msg)
      return
    }
    if(fs.existsSync(galleryPost.image)){
    fs.unlinkSync(galleryPost.image);
    }
    res.status(200).send(galleryPost);
  })
})
})

router.get('/gallery', (req, res) => {
  Gallery.find({}, (err, gallery) => {
    res.send(gallery)
  })
})

module.exports = router;
