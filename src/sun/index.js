const path = require('path');
const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use('/',express.static(path.join(__dirname,'./')));
//app.use(express.static('.well-known/acme-challenge'))
app.listen(3001, () => console.log('listening'))
