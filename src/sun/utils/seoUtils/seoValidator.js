'use strict';

const SeoModel = require('../../models/seo.model');

const hasEmptyFields = seo => {
  if (seo.title === '' ||
      seo.description === '' ||
      seo.url === '')
    return {
      success: false,
      status: 400,
      message: 'Ошибка: Название(title), описание(description) и URL не должны быть пустыми.'
    };
  return {
    success: true
  };
}

const isNonUnique = (seo, seoId, allSeo) => {
  for (let el of allSeo) {
    if (el.title === seo.title && el.id !== seoId) {
      return {
        success: false,
        status: 400,
        message: 'Ошибка: Название(title) должно быть уникальным.'
      }
    }
    if (el.description === seo.description && el.id !== seoId) {
      return {
        success: false,
        status: 400,
        message: 'Ошибка: Описание(description) должно быть уникальным.'
      }
    }
    if (el.url === seo.url && el.id !== seoId) {
      return {
        success: false,
        status: 400,
        message: 'Ошибка: URL должен быть уникальным.'
      }
    }
  }
  return {
    success: true
  }
}

const validateSeo = (seo, seoId) => {
  return new Promise((resolve, reject) => {
    let hasEmptyFieldsResult = hasEmptyFields(seo);
    if (!hasEmptyFieldsResult.success)
      resolve(hasEmptyFieldsResult);
    SeoModel.find({}, (err, allSeo) => {
      if (err)
        reject(err);
      if (!allSeo) {
        resolve({
          success: false,
          status: 404,
          message: 'Ошибка: Страницы не найдены.'
        });
      }
      resolve(isNonUnique(seo, seoId, allSeo));
    });
  });
}

module.exports = validateSeo;