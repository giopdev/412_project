const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const { Client } = require('pg');
const crypto = require('crypto');

/*
* Parse and set db credentials
*/
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

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());

// Session Object params
app.use(session({
  secret: 'session-key-very-secret',
  saveUninitialized: false,
  resave: false,
  cookie: {
    maxAge: 60000 * 60 * 24, // 24 hour session, cause people really love our website
  }
}));

// Returns the sha256 hash of a string (toHash + salt)
function saltAndHash(toHash, salt) {
  const hashable = toHash + salt
  const hash = crypto.createHash('sha256')
  hash.update(hashable)
  return hash.digest('hex')
}

// Landing Page Path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'landingPage.html'));
});

// Register Page Path
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Login Page Path
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});


/*
 * login endpoint, takes in a username and password and returns success for a login that exists in the db
 * + stores userid in a session object
 * else it returns an error
 */
app.post('/login', async (req, res) => {
  const { login_username, login_password } = req.body;

  if (!login_username || !login_password) {
    return res.status(400).json({ error: 'Please enter a username & password!' });
  }

  const hashedPassword = saltAndHash(login_password, login_username);

  try {
    /*
    * Attempt the login using the entered username and the salt+hashed pass
    */
    const query = 'SELECT userid FROM "USER" WHERE username = $1 AND userPassword = $2';
    const queryResult = await pgConnection.query(query, [login_username, hashedPassword]);

    if (queryResult.rows.length == 0) {
      return res.status(401).json({ error: 'Invalid username/password!' });
    } else {
      // Success, save the userId for the session
      req.session.userid = queryResult.rows[0].userid;
      return res.status(200).json({ success: true });
    }
  } catch (e) {
    console.log(e);
  }
});

// Landing Page Path
app.get('/account', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'account.html'));
});

async function main() {
  await pgConnection.connect();
  app.listen(PORT);
  console.log('Running on localhost:3000')

}

main()



