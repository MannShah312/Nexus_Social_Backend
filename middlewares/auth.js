const passport = require("passport");

// Middleware to authenticate users
const authenticateUser = passport.authenticate("jwt", { session: false });

module.exports = { authenticateUser };