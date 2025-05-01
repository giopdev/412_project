const express = require('express');
const path = require('path');
const fs = require('fs');
const { Client } = require('pg');
const crypto = require('crypto');

const sql_credentials = JSON.parse(fs.readFileSync('./sql_credentials.json', 'utf8'))

const pgConnection = new Client({
  user: sql_credentials.user,
  host: sql_credentials.host,
  database: sql_credentials.database,
  password: sql_credentials.password,
  port: sql_credentials.port,
})

const app = express();
const PORT = 3000;

// Landing Page Path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public' , 'landingPage.html'));
});

// Register Page Path
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Login Page Path
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.listen(PORT);
console.log('Running on localhost:3000')
