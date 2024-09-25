const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
app.use(express.json());

app.use("/customer", session({
  secret: "fingerprint_customer",
  resave: true,
  saveUninitialized: true
}));

// Middleware for authenticating routes starting with /customer/auth/*
app.use("/customer/auth/*", function auth(req, res, next) {
  // Get the token from headers or session
  const token = req.headers['authorization']?.split(' ')[1] || req.session.token;
  
  if (!token) {
    return res.status(403).send("Authentication token is missing");
  }

  // Verify JWT token
  jwt.verify(token, "your_secret_key", (err, user) => {
    if (err) {
      return res.status(403).send("Invalid token");
    }
    
    // If token is valid, attach the user info to the request
    req.user = user;
    next();
  });
});

const PORT = 5000;
app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
