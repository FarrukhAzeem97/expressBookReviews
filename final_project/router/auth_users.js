const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
 // Filter the users array for any user with the same username
 let userswithsamename = users.filter((user) => {
    return user.username === username;
});
// Return true if any user with the same username is found, otherwise false
if (userswithsamename.length > 0) {
    return true;
} else {
    return false;
}
}

const authenticatedUser = (username,password)=>{ 
  // Filter the users array for any user with the same username and password
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
});
// Return true if any valid user is found, otherwise false
if (validusers.length > 0) {
    return true;
} else {
    return false;
}
}

//only registered users can login
// Only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    
    // Check if username or password is missing
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: username
        }, 'access', { expiresIn: 60 * 60 }); // Expires in 1 hour

        // Store access token and username in session
        req.session.authorization = {
            accessToken, 
            username
        };

        // Return success message along with the token
        return res.status(200).json({
            message: "User successfully logged in",
            token: accessToken
        });
    } else {
        return res.status(401).json({ message: "Invalid login. Check username and password." });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, 'secret_key');
    const username = decoded.username;

    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Add or update the review
    books[isbn].reviews = books[isbn].reviews || {};
    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: "Review added/updated successfully" });
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
});
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        // Verify the JWT token
        const decoded = jwt.verify(token, 'access'); // Use the same secret used during token generation
        const username = decoded.data;

        // Check if the book exists
        if (!books[isbn]) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Check if the review exists for the user
        if (books[isbn].reviews && books[isbn].reviews[username]) {
            // Delete the review
            delete books[isbn].reviews[username];
            return res.status(200).json({ message: "Review deleted successfully" });
        } else {
            return res.status(404).json({ message: "No review found for the specified user" });
        }
    } catch (error) {
        return res.status(403).json({ message: "Invalid token" });
    }
});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
