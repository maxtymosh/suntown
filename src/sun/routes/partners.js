const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Partner = require('../models/partners.model');
const SeoModel = require('../models/seo.model');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const verifyToken = require('./utils');
const formatError = require('../utils/logValidationErrors');
const unlinkFiles = require('../utils/unlinkFilesOnError');
const imageDecoder = require('../utils/imageUtils/imageDecoder');
const filePath = 'partners-media';

const storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, './partners-media');
  },
  filename: function(req, file, cb){
    let ext = file.originalname.split('.').pop();
    cb(null, crypto.randomBytes(10).toString('hex') + '.' + ext);
  }
})

const upload = multer({ storage, limits: { fieldSize: 25 * 1024 * 1024 } });

router.post('/partners', verifyToken,
            upload.fields([
            {
              name: 'video'
            }]),
             (req, res) => {
  jwt.verify(req.token, config.secret, (err, authData) => {
    if(err) {
      res.sendStatus(401)
      return
    }
    
    const partnerData = { company, description, url, videoName } = req.body;

    // const src = crypto.randomBytes(10).toString('hex');
    // const imageObject = JSON.parse(req.body.mainImage);
    // const rawBinaryJson = imageObject;
    // const rawBinary = rawBinaryJson.src.replace(/^data:image\/\w+;base64,/, "");
    // const buffer = Buffer.from(rawBinary, 'base64')
    // fs.writeFile('./partners-media/'+src, buffer, (err, result) => {
    //   if(err) throw new Error(err);
    // })

    const mainImage = imageDecoder(filePath, req.body.mainImage);
    // {...imageObject, src: 'http://localhost:3000/partners-media/'+src};

    const additionalImages = req.body.additionalImages.map(image => imageDecoder(filePath, image))

    // for(let image of req.body.additionalImages){
    //   additionalImages.push(({...imageObject, src: 'http://localhost:3000/partners-media/'+src}))
    // }

    // console.log(additionalImages)
    
    // for(let image of req.body.additionalImages){
    //   additionalImages.push(JSON.parse(image))
    // }

    // const mainImage = JSON.parse(req.body.mainImage);
    let video;
    if(req.files.video){
      video = req.files.video[0].path;
    } else {
      video = null
    }

    const partner = new Partner({
      company,
      videoName,
      description,
      url,
      additionalImages,
      mainImage,
      video: video ? video : null
    })

    // const seo = new SeoModel({
    //   url: url,
    //   title : '1',
    //   description : '1',
    //   pageType : '11',
    //   keywords : '1'
    // }).save()

    // seo.
    //   .catch(err => {
    //     console.log(err)
    //   })

    partner.save()
      .then(partner => {
        if(!partner || partner.length === 0){
          return res.status(500);
        }
        res.status(200).send(partner);
      })
      .catch( err => {
        const errorMessages = formatError(err);
        if(errorMessages.length){
          unlinkFiles([additionalImages, [mainImage], [video]]);
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

router.put('/partners/:_id', verifyToken, upload.fields([]), (req, res) => {
  jwt.verify(req.token, config.secret, (err, authData) => {
    if(err) {
      res.sendStatus(401)
      return
    }

    Partner.findById(req.params._id, (err, oldPartner) => {
      if(oldPartner){
        let editData = {
          ...req.body
        }

        const rawImage = req.body.mainImage;
        const rawAdditional = req.body.additionalImages;

        console.log(oldPartner.src)

        if(rawImage){
          editData['mainImage'] = imageDecoder(filePath, rawImage, oldPartner.src);
        }
        if(rawAdditional){
          editData['additionalImages'] = req.body.additionalImages.map(image => imageDecoder(filePath, image, oldPartner.src ))
        }

        Partner.findByIdAndUpdate(req.params._id, editData, { new: true }, (err, partner) => {
          if(!partner){
            res.status(404).json({
              "message": "Ошибка: партнер не найден"
            })
          }
          res.status(200).send(partner)
        })
      }
    })
  })
})

router.delete('/partners/:_id', verifyToken, (req, res) => {
  jwt.verify(req.token, config.secret, (err, authData) => {
    if(err) {
      res.sendStatus(401)
      return
    }
  Partner.findByIdAndDelete(req.params._id, (err, partner) => {
    if(err) {
      res.status(500).send(err.msg)
      return
    }
    if(!partner){
      res.status(404).json({
        "message": "Ошибка: партнер не найден"
      })
      return
    }
    // const partnerObj = partner.toObject();
    // unlinkFiles([partnerObj.additionalImages, [partnerObj.mainImage], [partnerObj.video]]);
    res.status(200).send(partner);
  })
})
})

router.get('/partners', (req, res) => {
  Partner.find({}, (err, partners) => {
    res.send(partners)
  })
})

module.exports = router;
