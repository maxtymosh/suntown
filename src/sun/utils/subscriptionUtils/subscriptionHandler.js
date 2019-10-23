'use strict';

const crypto = require('crypto');

// Utils
const mailSender = require('../mailUtils/mailSender');

// DB Models
const SubscriberModel = require('../../models/subscriber.model');
const UnverifiedModel = require('../../models/unverified.model');

// Getting all verified subscribers from DB
const getActiveSubscribers = () => {
  return new Promise((resolve, reject) => {
    SubscriberModel.find({}, (err, subscribers) => {
      if (err)
        reject(err);
      subscribers = subscribers.filter(subscriber => subscriber.isVerified);
      if (!subscribers || subscribers === []) {
        reject({
          success: false,
          status: 404,
          message: 'Ошибка: Подписчики не найдены.'
        });
      }
      resolve(subscribers);
    });
  });
};

// Checking for existing subscribers with specified email
const subscriberExists = subMail => {
  return new Promise((resolve, reject) => {
    SubscriberModel.findOne({ email: subMail }, (err, subscriber) => {
      if (err)
        reject(err);
      if (subscriber && subscriber !== []) {
        reject({
          success: false,
          status: 400,
          message: 'Ошибка: Подписчик с такой почтой уже существует.'
        });
      }
      resolve();
    });
  });
};

const generateHash = data => {
  return crypto.createHash('sha256')
    .update(data.toString())
    .digest("hex");
}; 

// Generating token for the new unverified subscriber
const generateToken = subscriber => {
  let hashData = subscriber.email + Date.now().toString();
  let generatedToken = generateHash(hashData);
  return {
    subscriber,
    generatedToken
  };
};

// Adding new subscriber to DB
const saveSubscriber = (subName, subEmail) => {
  let hashData = subName + subEmail + Date.now().toString();
  return new Promise((resolve, reject) => {
    const newSubscriber = new SubscriberModel({
      name: subName,
      email: subEmail,
      unsubscribeKey: generateHash(hashData)
    });
  
    newSubscriber.save(err => {
      if (err)
        reject(err);
      resolve(newSubscriber);
    });
  });
};

// Adding a temporary document containing verification token
const saveUnverified = (subscriber, token) => {
  return new Promise((resolve, reject) => {
    const newUnverified = new UnverifiedModel({
      subscriberId: subscriber._id,
      verificationToken: token,
      createdAt: subscriber.deletionDate
    });

    newUnverified.save(err => {
      if (err)
        reject(err);
      resolve({
        subscriber,
        newUnverified
      });
    });
  });
};

// Send mail to verify the e-mail address or unsubscribe
const sendVerificationMail = (email, token, unsubscribeKey) => {
  const tranporter = mailSender.getDefaultTransporter();
  
  return mailSender.sendMail(
    tranporter,
    mailSender.createVerifyMailOptions(email, token, unsubscribeKey)
  );
};

// DEVELOPMENT ONLY
const sendVerificationMailDev = (token, unsubscribeKey) => {
  let testTranporter = mailSender.getTestTransporter();
  
  return mailSender.sendMail(
    testTranporter,
    mailSender.createVerifyDevOptions(token, unsubscribeKey)
  );
};

const handleError = err => {
  console.log(err);
  return err;
};

// Adding new subscriber pipeline
const subscribe = (name, email) => {
  return subscriberExists(email)
    .then(() => saveSubscriber(name, email))
    .then(subscriber => generateToken(subscriber))
    .then(result => saveUnverified(result.subscriber, result.generatedToken))
    .then(saveResult => sendVerificationMail(
      email,
      saveResult.newUnverified.verificationToken,
      saveResult.subscriber.unsubscribeKey,
    ))
    .then(() => {
      return {
        success: true,
        message: 'Почтовый адрес был добавлен в список рассылки как неподтвержденный.'
      };
    })
    .catch(err => handleError(err));
}

// Searching and getting unverified sub data by verification token
const getUnverifiedByToken = token => {
  return new Promise((resolve , reject) => {
    UnverifiedModel.findOne({ verificationToken: token }, (err, unverified) => {
      if (err)
        reject(err);
      if (unverified && unverified !== [])
        resolve(unverified);
      reject({
        message: 'Ваша почта уже подтверждена либо Вы не являетесь подписчиком.'
      });
    });
  });
};

// Change verified field of a subscriber to true
const activateSubscriber = id => {
  return new Promise((resolve, reject) => {
    SubscriberModel.findById(id, (err, subscriber) => {
      if (err)
        reject(err);
      if (subscriber) {
        subscriber.isVerified = true;
        subscriber.deletionDate = null;
        subscriber.save(err => {
          if (err)
            reject(err);
          resolve(id);
        });
      } else {
        reject({
          message: 'Ошибка: Подписчик по данному идентификатору не найден.'
        });
      }
    });
  });
};

const removeUnverified = subId => {
  return new Promise((resolve, reject) => {
    UnverifiedModel.deleteOne({ subscriberId: subId }, err => {
      if(err)
        reject(err);
      resolve(subId);
    });
  });
};

// Making subscriber active pipeline
const verifySubscriber = token => {
  return getUnverifiedByToken(token)
    .then(unverified => activateSubscriber(unverified.subscriberId))
    .then(subId => removeUnverified(subId))
    .then(() => {
      return {
        success: true,
        message: 'Ваш адрес успешно подтвержден.'
      };
    })
    .catch(err => handleError(err));
};

const removeSubscriber = subId => {
  return new Promise((resolve, reject) => {
    SubscriberModel.findByIdAndRemove(subId, (err, res) => {
      if (err) 
        reject(err);
      resolve();
    });
  });
};

const findSubscriberByUnsubKey = unsubKey => {
  return new Promise((resolve, reject) => {
    SubscriberModel.findOne({ unsubscribeKey: unsubKey }, (err, subscriber) => {
      if (err)
        reject(err);
      if (!subscriber || subscriber === []) {
        reject({
          message: 'Ошибка: Возникла проблема с отпиской от рассылки (несуществующий подписчик).'
        });
      }
      resolve(subscriber);
    });
  });
};

// Unsubscription pipeline
const unsubscribe = unsubKey => {
  return findSubscriberByUnsubKey(unsubKey)
    .then(subscriber => removeUnverified(subscriber._id))
    .then(subId => removeSubscriber(subId))
    .then(() => {
      return {
        success: true,
        message: 'Вы успешно отменили подписку.'
      };
    })
    .catch(err => handleError(err));
};

// Newsletter sending to all active subscribers
const sendNews = article => {
  getActiveSubscribers()
    .then(subscribers => mailSender.sendNewsletter(
      mailSender.getDefaultTransporter(),
      subscribers,
      article
    ))
    .then(result => console.log(result))
    .catch(err => console.log(err));
};

const subHandler = {
  getActiveSubscribers,
  subscribe,
  verifySubscriber,
  unsubscribe,
  sendNews
};

module.exports = subHandler;

