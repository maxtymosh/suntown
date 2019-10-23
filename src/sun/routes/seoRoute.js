const express = require('express');
const router = express.Router();
const SeoModel = require('../models/seo.model');
const validateSeo = require('../utils/seoUtils/seoValidator');
const config = require('../config');
const jwt = require('jsonwebtoken');
const verifyToken = require('./utils');

router.get('/seo', (req, res) => {
  SeoModel.find({}, (err, meta) => {
    if (err)
      return res.status(500).send(err);
    if (!meta) {
      return res.status(404).json({
        message: 'Ошибка: Страницы не найдены.'
      });
    }
    return res.status(200).send(meta);
  });
});

router.get('/seo/:_id', (req, res) => {
  SeoModel.findById(req.params._id, (err, seo) => {
    if (err)
      return res.status(500).send(err);
    if (!seo) {
      return res.status(404).json({
        message: 'Ошибка: Страница с таким идентификатором отсутствует.',
        id: req.params._id
      });
    }
    return res.status(200).send(seo);
  });
});

router.get('/seo-url/:url', (req, res) => {
  const lang = req.query.lang === 'ru';
  console.log(req.query)
  SeoModel.findOne({ "url": req.params.url }, (err, seo) => {
    if (err)
      return res.status(500).send(err);
    if (!seo) {
      return res.status(404).json({
        message: 'Ошибка: Страница с таким URL отсутствует.',
        id: req.params.url
      });
    }
    const retSeo = {
      keywords: lang ? seo.keywordsRu : seo.keywords,
      description: lang ? seo.descriptionRu : seo.description,
      title: lang ? seo.titleRu : seo.title,
      _id: seo._id,
      pageType: seo.pageType
    }
    return res.status(200).send(retSeo);
  });
});

/*
router.get('/seo-url/:url', (req, res) => {
  SeoModel.findOne({ "url": req.params.url }, (err, seo) => {
    if (err)
      return res.status(500).send(err);
    if (!seo) {
      return res.status(404).json({
        message: 'Ошибка: Страница с таким URL отсутствует.',
        id: req.params.url
      });
    }
    return res.status(200).send(seo);
  });
});
*/
// get news article by url
router.get('/seo-url/post/:url', (req, res) => {
  SeoModel.findOne({ "url": 'post/' + req.params.url }, (err, seo) => {
    if (err)
      return res.status(500).send(err);
    if (!seo) {
      return res.status(404).json({
        message: 'Ошибка: Статья с таким URL отсутствует.',
        id: req.params.url
      });
    }
    return res.status(200).send(seo);
  });
});

// Protected route
/* router.post('/seo', (req, res) => {
  validateSeo(req.body, null)
    .then(result => {
      if (true) {
        const newSeo = new SeoModel(req.body);
        newSeo.save(err => {
          if (err)
            return res.status(500).send(err);
          else
            return res.status(200).send(newSeo);
        });
      } else {
        return res.status(result.status).json({
          message: result.message
        });
      }
    })
    .catch(err => res.status(500).send(err));
}); */

// Protected route
router.put('/seo/:_id', verifyToken, (req, res) => {
  jwt.verify(req.token, config.secret, (err, authData) => {
  if(err) {
    res.sendStatus(401)
    return
  }
  validateSeo(req.body, req.params._id)
    .then(result => {
      if (true) {
        SeoModel.findByIdAndUpdate(req.params._id, req.body, { new: true }, (err, seo) => {
          if (err)
            return res.status(500).send(err);
          if (!seo) {
            return res.status(404).json({
              message: 'Ошибка: Страница с таким идентификатором отсутствует.',
              id: req.params._id
            });
          }
          return res.status(200).send(seo);
        });
     } else {
       return res.status(result.status).json({
         message: result.message
       });
     }
    })
    .catch(err => res.status(500).send(err));
  })
});

// Protected route
/* router.delete('/seo/:_id', verifyToken, (req, res) => {
  SeoModel.findByIdAndDelete(req.params._id, (err, seo) => {
    if (err)
      return res.status(500).send(err);
    if (seo) {
      return res.status(200).json({
        message: 'SEO-данные страницы были успешно удалены.',
        id: seo._id,
        title: seo.title
      });
    }
    return res.status(404).json({
      message: 'Ошибка: Страница с таким идентификатором отсутствует.',
      id: req.params._id
    });
  });
}); */

module.exports = router;
