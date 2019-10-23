'use strict';

const request = require('request');

const captchaExists = captcha => {
  if (
    captcha === undefined ||
    captcha === '' ||
    captcha === null
  ) {
    return false;
  }
  return true;
};

const verifyCaptcha = (captcha, remoteAddress, secretKey) => {
  return new Promise((resolve, reject) => {
    if (!captchaExists(captcha)) {
      resolve({
        success: false,
        errorType: 'captcha',
        message: 'Ошибка: Каптча не была выбрана.'
      });
    }

    const verifyUrl = `https://google.com/recaptcha/api/siteverify?` +
      `secret=${secretKey}&` +
      `response=${captcha}&` +
      `remoteip=${remoteAddress}`;

    request(verifyUrl, (err, response, body) => {
      if (err) {
        reject(err);
      }
      
      if (body.success !== undefined && !body.success) {
        resolve({
          success: false,
          errorType: 'captcha',
          message: 'Ошибка: Неудача подтверждения каптчи.'
        });
      }

      resolve({
        success: true,
        message: 'Каптча пройдена.'
      });
    });
  });
};

module.exports = verifyCaptcha;

