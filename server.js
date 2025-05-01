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

app.use(express.urlencoded({extended: true}));

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

/*
* register endpoint, takes in name, user, email, and password
*/
app.post('/register', async (req, res) => {
  const { register_fullname, register_email, register_username, register_password } = req.body;

  // basic validation
  if (!register_fullname || !register_email || !register_username || !register_password) {
    return res.status(400).send('All fields are required.');
  }

  // hash the password
  const hashedPassword = saltAndHash(register_password, register_username);

  // pick a default photo path (defualt.png for now)
  const defaultPhoto = '/images/default.png';

  // insert into USER table
  const insertSQL = `
    INSERT INTO "USER" 
      (fullName, username, email, userPassword, profilePhoto)
    VALUES
      ($1,$2,$3,$4,$5)
    RETURNING userid;
  `;
  const values = [register_fullname, register_username, register_email, hashedPassword, defaultPhoto];

  try {
    const result = await pgConnection.query(insertSQL, values);
    console.log('New user id=', result.rows[0].userid);
    // either redirect to login or send success
    return res.redirect('/login');
  } catch (err) {
    console.error('Registration error:', err);
    // unique violation on username/email?
    if (err.code === '23505') {
      return res.status(409).send('That username or email is already taken.');
    }
    return res.status(500).send('Internal server error.');
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



