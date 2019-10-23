'use strict';

const fs = require('fs');

const logFailure = (email, articleTitle, err) => {
  let timestamp = new Date().toString();
  let logDir = 'newsletter-logs';
  if (!fs.existsSync(logDir))
    fs.mkdirSync(logDir);
  let content = (
    `Ошибка отправки:
    E-mail: ${email};
    Название новости: ${articleTitle};
    Время: ${timestamp};
    Ошибка:
    ${err}\n\n`
  );
  
  fs.writeFile(
    `${logDir}/Ошибки-${articleTitle}.txt`,
    content,
    { 
      encoding: 'utf8', 
      flag: 'a+' 
    },
    err => {
      if (err)
        console.log(err);
    }
  );
};

module.exports = {
  logFailure
};
