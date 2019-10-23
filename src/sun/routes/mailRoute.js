const express = require('express');
const router = express.Router();

const config = require('../config/mailConfig');

// Utils
const verifyCaptcha = require('../utils/mailUtils/captchaVerifier');
const mailSender = require('../utils/mailUtils/mailSender');
const subHandler = require('../utils/subscriptionUtils/subscriptionHandler');

// Mail configuration constants
const smtp = config.SMTPSERVER; // smtp-server name
const emailUser = config.EMAIL; // email-address used to send mail
const emailPass = config.EMAIL_PASS; // password

const secretKey = config.CAPTCHA_SECRET_KEY;

const transporterOptions = { 
  smtp, 
  emailUser,
  emailPass
};

const transporter = mailSender.getTransporter(transporterOptions);

// DEVELOPMENT ONLY
const testTransporter = mailSender.getTestTransporter();

// Production route
router.post('/send-form', (req, res) => {
  let subscriptionError;
  verifyCaptcha(req.body.captcha, req.connection.remoteAddress, secretKey)
    .then(verificationResult => {
      if (verificationResult.success) {
        if (req.body.isSubscribed)
          subHandler.subscribe(req.body.mailData.firstName, req.body.mailData.email)
            .then(result => {
              if (!result.success)
                subscriptionError = result.message;
            });
        return mailSender.sendMail(
          transporter, 
          mailSender.createFormOptions(
            'Форма зворотнього зв\'язку | Suntown Ukraine',
            emailUser,
            req.body.mailData
          )
        );
      }
      return res.json(verificationResult);
    })
    .then(sendResult => {
      if (subscriptionError)
        sendResult.subscriptionError = subscriptionError;
      return res.json(sendResult)
    })
    .catch(err => {
      console.log(err);
      return res.status(500).send('Что-то пошло не так во время отправки Вашего письма.');
    });
});

module.exports = router;
