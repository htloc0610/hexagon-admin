const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcrypt");
const userService = require("../apps/users/user.service");
const userController = require("../apps/users/user.controller");

module.exports = function (passport) {
  passport.use(
    new LocalStrategy({ usernameField: "username" }, (username, password, done) => {
        userService.getUserByUsername(username)
          .then((user) => {
            if (!user) {
              return done(null, false, {
                message: "Username and password is not matched!",
              });
            }
            bcrypt.compare(password, user.password, (err, isMatch) => {
              if (err) {
                return done(err);
              }
  
              if (isMatch) {
                if (!user.isVerify) {
                  return done(null, false, { message: "Please active your account with registed email!" });
                }
                return done(null, user, { message: "Login successfully" });
              } else {
                return done(null, false, {
                  message: "Username and password is not matched!",
                });
              }
            });
          })
          .catch((err) => done(err));
      }
    )
  );
  

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;

          // Tìm kiếm người dùng
          let user;
          try {
            user = await userService.getUserByEmail(email);
          } catch (err) {}

          //   Nếu không thấy thì tạo mới
          if (!user) {
            const newUser = {
              username: email,
              email: email,
              password: null,
              isVerify: true,
              firstName: profile.name.givenName,
              lastName: profile.name.familyName,
              url: profile.photos[0].value,
              //   Lỗi hiển thị hình
              //   url:
              //     profile.photos[0].value ||
              //     "https://www.pngall.com/wp-content/uploads/5/User-Profile-PNG-Image.png",
            };

            const createdUser = await userService.createUserEmail({
              ...newUser,
              password: "",
            });
            return done(null, createdUser);
          }
          // Return user
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser(function (user, done) {
    process.nextTick(function () {
        return done(null, {
            id: user.id,
            username: user.username,
            picture: user.url,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
        });
    });
});

  // passport.deserializeUser((id, done) => {
  //     userController.getUserById(id, (err, user) => {
  //         done(err, user);
  //     })
  // });

  passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
      return cb(null, user);
    });
  });
};
