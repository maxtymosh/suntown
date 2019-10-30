import "babel-polyfill"
const https = require('https');
const fs = require('fs');
const http = require('http');
const mongoose = require('mongoose');
import express from "express";
import { matchRoutes } from "react-router-config";
import Routes from "./client/Routes";
import renderer from "./helpers/renderer";
import createStore from "./helpers/createStore";
import Loadable from "react-loadable";
import compression from "compression";
const cors = require('cors');
const path = require('path');

const metaFormatter = require('./sun/utils/metaFormatter');

const config =require('./sun/config');
//const PORT = process.env.PORT || 4000;

const news = require('./sun/routes/news');
const gallery = require('./sun/routes/gallery');
const user = require('./sun/routes/user');
const partners = require('./sun/routes/partners');
const seoRoute = require('./sun/routes/seoRoute.js');
const mailRoute = require('./sun/routes/mailRoute');
const subscriptionRoute = require('./sun/routes/subscriptionRoute');

const app = express();

const server = config.server;
const database = config.database;
const username = config.username;
const pass = config.password;

// Resolve deprecation warnings
const mongoOptions = {
  useNewUrlParser: true,
  useCreateIndex: true
};

mongoose.connect(`mongodb://${username}:${pass}@${server}/${database}`, mongoOptions, err => { if(err) console.log(err); console.log('connected')});

// Necessary middleware
app.use(compression());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));

// Middleware for proper redirecting
app.use((req, res, next) => {
  console.log(`${new Date().toString()} => ${req.originalUrl}`);
  next();
});

// Static files
app.use('/', express.static('sitemap'));
app.use('/news-images', express.static('../src/sun/news-images'));
app.use('/gallery-images', express.static('../src/sun/gallery-images'));
app.use('/partners-media', express.static('../src/sun/partners-media'));
//app.use(express.static(path.join(__dirname, '.well-known/acme-challenge')));
// Routes
app.use('/api', seoRoute);
app.use('/api', news);
app.use('/api', gallery);
app.use('/api', user);
app.use('/api', partners);
app.use('/api', mailRoute);
app.use('/api', subscriptionRoute);

app.use(compression());
app.use(express.static("public"));
app.use("/static", express.static("./static"));
app.use("/product/", express.static("./static/media"));

app.get("*", (req, res) => {
    const store = createStore(req);

    const promises = matchRoutes(Routes, req.path)
        .map(({ route }) => {
            return route.loadData ? route.loadData(store, req.path) : null;
        })
        .map(promise => {
            if (promise) {
                return new Promise((resolve, reject) => {
                    promise.then(resolve).catch(resolve);
                });
            }
        });

    Promise.all(promises)
        .then(() => {
            try {
                const context = {};
                const content = renderer(req, store, context);

                if (context.url) {
                  res.redirect(301, context.url);
              }

              if (context.notFound) {
                  res.status(404);
              }

              res.send(content);
          } catch (err) {
              console.log(err);
          }
      })
      .catch(err => {
          console.log(err);
      });
});

Loadable.preloadAll().then(() => {
if(true) return app.listen(3000);
https.createServer({
 key: fs.readFileSync('../../../sslcert/domain-key.txt'),
 cert: fs.readFileSync('../../../sslcert/domain-crt.txt')
}, app)
.listen(3000, ()=> console.log('started'));

// app.listen(3000)


// Plain http-server to listen to unsecure requests and redirect them

http.createServer(app, function(req, res) {
res.writeHead(301, { "Location": "https://suntown-ukraine.com" + req.url });
res.end();
}).listen(3001);
  //app.listen(PORT, () => {
  //    console.log("Listening on port " + PORT);
 // });
});
