const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!isValid(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
const axios = require('axios');

axios.get('http://localhost:5000/')
    .then(response => {
        console.log('Book List:', response.data);
    })
    .catch(error => {
        console.error('Error fetching book list:', error);
    });
// Get the book list available in the shop
public_users.get('/', (req, res) => {
    return res.status(200).json(books);
});

// Get book details based on ISBN
const axios = require('axios');
const isbn = '1'; 
axios.get(`http://localhost:5000/isbn/${isbn}`)
    .then(response => {
        console.log('Book Details:', response.data);
    })
    .catch(error => {
        if (error.response) {          
            console.error('Error fetching book:', error.response.data.message);
        } else {        
            console.error('Error:', error.message);
        }
    });
public_users.get('/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    
    if (books[isbn]) {
        return res.status(200).json(books[isbn]);
    } else {
        return res.status(404).json({ message: "Book not found with the provided ISBN." });
    }
});

// Get book details based on author
const axios = require('axios');

const fetchBooksByAuthor = async (author) => {
    try {
        const response = await axios.get(`http://localhost:5000/author/${author}`);
        console.log('Books by Author:', response.data);
    } catch (error) {
        if (error.response) {
          
            console.error('Error fetching books:', error.response.data.message);
        } else {
          
            console.error('Error:', error.message);
        }
    }
};
public_users.get('/author/:author', (req, res) => {
    console.log(`Author search for: ${req.params.author}`);
    const author = req.params.author.toLowerCase();
    const filteredBooks = Object.values(books).filter((book) => book.author.toLowerCase() === author);

    if (filteredBooks.length > 0) {
        return res.status(200).json(filteredBooks);
    } else {
        return res.status(404).json({ message: "No books found for the specified author." });
    }
});

// Get all books based on title
const axios = require('axios');
const fetchBooksByTitle = async (title) => {
    try {
        const response = await axios.get(`http://localhost:5000/title/${title}`);
        console.log('Books with Title:', response.data);
    } catch (error) {
        if (error.response) {
            console.error('Error fetching books:', error.response.data.message);
        } else {            
            console.error('Error:', error.message);
        }
    }
};
public_users.get('/title/:title', (req, res) => {
    const title = req.params.title;
    const filteredBooks = Object.values(books).filter(book => book.title === title);

    if (filteredBooks.length > 0) {
        return res.status(200).json(filteredBooks);
    } else {
        return res.status(404).json({ message: "No books found with the specified title." });
    }
});

// Get book review by ISBN
public_users.get('/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    } else {
        return res.status(404).json({ message: "No reviews found for the specified ISBN." });
    }
});

module.exports.general = public_users;
