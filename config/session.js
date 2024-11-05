const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const mongoose = require("mongoose");
const User = require("../models/User/userModel");
const sessionModel = mongoose.connection.collection("user-session");

const configSession = (app) => {
  app.use(
    session({
      secret: "keyboard cat",
      saveUninitialized: false,
      resave: false,
      proxy: true,
      cookie: {
        maxAge: 60 * 1000,
      },
      store: MongoStore.create({
        mongoUrl:
          "mongodb+srv://anhtupeo1234:bacdaibang1897@chuyendetn.eio4t.mongodb.net/?retryWrites=true&w=majority&appName=ChuyenDeTN",
        dbName: "test",
        collectionName: "user-session",
        autoRemove: "interval",
        touchAfter: 60,
        autoRemoveInterval: 1,
      }),
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser(function (user, done) {
    done(null, user.data);
  });

  passport.deserializeUser(async function (user, done) {
    try {
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};

module.exports = configSession;
