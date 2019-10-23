const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Article = require('../models/news.model');
const Seo = require('../models/seo.model');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const verifyToken = require('./utils');
const { sendNews } = require('../utils/subscriptionUtils/subscriptionHandler');
const formatError = require('../utils/logValidationErrors');
const filePath = '../src/sun/news-images';
const imageDecoder = require('../utils/imageUtils/imageDecoder');


const storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, './news-images');
  },
  filename: function(req, file, cb){
    let ext = file.originalname.split('.').pop();
    cb(null, crypto.randomBytes(10).toString('hex') + '.' + ext);
  }
})

const upload = multer({ storage, limits: { fieldSize: 25 * 1024 * 1024 } });

router.post('/new-article', verifyToken, upload.fields([]), (req, res) => {
  jwt.verify(req.token, config.secret, (err, authData) => {
    if(err){
      res.status(401).json({
        message: 'Ошибка: пользователь не авторизирован'
      });
      return
    }

  
  const { title, description, date, content, url } = req.body;
  // const mainImage = req.file.path;
  let mainImage = req.body.mainImage;
console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAA');
  mainImage = imageDecoder(filePath, mainImage);
  console.log(   title,
    description,
    mainImage,
    date,
    content,
    url)
  const article = new Article({
    title,
    titleRu: '',
    description,
    descriptionRu: '',
    mainImage,
    date,
    content,
    contentRu: '',
    url
  })

  const seo = new Seo({
    url: 'post/'+url,
    title : '1',
    description : '1',
    pageType : '1',
    keywords : '1',
	  descriptionRu: '1',
	  keywordsRu: '1',
	  titleRu: '1'
  })

  article.save()
    .then(article => {
      if(!article || article.length === 0){
        return res.status(500);
      }
      seo.save()
      // sendNews(article.toObject())
      res.status(200).send(article);
    })
    .catch( err => {
      console.log(err)
      const errorMessages = formatError(err);
      if(errorMessages.length){
        // fs.unlinkSync(article.mainImage)
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

router.put('/article/:_id',verifyToken,  upload.fields([]), (req, res) => {
  jwt.verify(req.token, config.secret, (err, authData) => {
    if(err){
       res.sendStatus(401)
       return
      }
  const editData = {
    ...req.body
  };
  Article.findById(req.params._id, (err, oldPost) => {
    if(oldPost){
    const rawImage = req.body.mainImage;
    if(rawImage){
      editData['mainImage'] = imageDecoder(filePath, rawImage, oldPost.src);
    }
    Article.findByIdAndUpdate(req.params._id, editData, { new: true }, (err, article) => {
      if(err){
        if(err.code == 11000){
          res.status(500).json({
            message: 'Ошибка: были найдены не уникальные поля'
          })
          return
        }
         res.status(500).send(err.errmsg);
	 return
      }
      else {
      
        // if(req.body.mainImage) editData['mainImage'] = JSON.parse(req.body.mainImage);
        // if(!oldPost.hasRu){
        //   const { titleRu: title, descriptionRu: description, mainImage: imageUrl, url } = article.toObject(); 
        //   const requiredFields = {
        //     title,
        //     description,
        //     imageUrl,
        //     url
        //   };
        //   sendNews(requiredFields);
        // }

        Seo.findOneAndUpdate({url: 'post/'+oldPost.url}, {url: 'post/'+article.url}, (err, post) => {
          if(err){
            res.status(500).json({
              message: 'Ошибка сервера'
            })
            return
          }
          else if(!post){
            res.status(500).json({
              message: 'Ошибка: сео для поста не найдено'
            })
            return
          }
        })
        res.status(200).send(article)
      }
    })
  } else {
    throw new Error('No such article')
  }
  })
})
})

router.delete('/article/:_id', verifyToken, (req, res) => {
  jwt.verify(req.token, config.secret, (err, authData) => {
    if(err) {
      res.sendStatus(401)
      return
    }
  Article.findByIdAndDelete(req.params._id, (err, article) => {
    if(err) res.status(500).send(err.msg)
    // if(req.file && fs.existsSync(article.mainImage)){
    //   fs.unlinkSync(article.mainImage);
    // }
    Seo.findOneAndDelete({ url: 'post/'+article.url }, (err, post) => {
      if(err){
        console.log(err)
      }if(!post){
        console.log('not found')
      }else {
        console.log(post)
      }
      
    })
    res.status(200).send(article);
  })
})
})

router.get('/articles', (req, res) => {
  Article.find({}, (err, article) => {
    res.send(article)
  })
})

module.exports = router;
