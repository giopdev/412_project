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

app.use(express.urlencoded({ extended: true }));

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


// Meals Page Path
app.get('/meals', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'meals.html'));
});

// Meals Logger Page Path
app.get('/logmeals', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'logmeals.html'));
});

// GET request for current session user's meallog in db
app.get('/api/meallog', async (req, res) => {
  // Return error if no userid in session
  if (!req.session.userid) {
    return res.status(403).json({ error: 'GET log without userid' });
  }

  try {
    /*
    * Send back session user's meal log
    */
    const query = `
    SELECT r.recipename, r.totalcalories, r.totalprotein, r.totalcarbs, r.totalfat, r.servingsize, ml.loggedtime, ml.loggeddate::date AS datesaved
    FROM meallog ml JOIN recipe r
    ON r.recipeid = ml.recipeid
    WHERE ml.userId = $1
    ORDER BY ml.loggedtime DESC`;

    const result = await pgConnection.query(query, [req.session.userid]);
    return res.json(result.rows);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// GET full name
app.get('/api/fullname', async (req, res) => {
  // Return error if no userid in session
  if (!req.session.userid) {
    return res.status(403).json({ error: 'GET fullname without userid' });
  }

  try {
    /*
    * Send back session user's full name
    */
    const query = `
    SELECT fullname FROM "USER" WHERE userId=$1`;

    const queryResult = await pgConnection.query(query, [req.session.userid]);
    return res.json(queryResult.rows[0].fullname);
  } catch (e) {
    console.log(e);
  }
})

// GET request for all recipes in db
app.get('/api/recipes', async (req, res) => {
  // Return error if no userid in session
  if (!req.session.userid) {
    return res.status(403).json({ error: 'GET recipes without userid' });
  }

  try {
    /*
    * Send back session user's meal log
    */
    const query = `
    SELECT * FROM recipe`;

    const queryResult = await pgConnection.query(query);
    return res.json(queryResult.rows);
  } catch (e) {
    console.log(e);
  }
});

// GET the list of recipeids the current user has favorited
app.get('/api/favorite', async (req, res) => {
    const userid = req.session.userid;
    if (!userid) {
        return res.status(401).json({error: 'Not logged in.'});
    }
    try {
        const result = await pgConnection.query(
            `SELECT recipeid
         FROM favorites
        WHERE userid = $1
     ORDER BY datesaved DESC`,
            [userid]
        );
        res.json(result.rows.map(r => r.recipeid));
    } catch (err) {
        console.error('Fetch favorites error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Clear session cookie --> logout
app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Session destruction error:', err);
      return res.status(500).json({ error: 'Logout failed.' });
    }
    //res.clearCookie('connect.sid'); // Name may vary if you set a custom session name
    res.json({ success: true });
  });
});

// DELETE a favorite (unfavorite)
app.delete('/api/favorite', async (req, res) => {
    const userid = req.session.userid;
    if (!userid) {
        return res.status(401).json({error: 'Not logged in.'});
    }
    const {recipeid} = req.body;
    if (!recipeid) {
        return res.status(400).json({error: 'No recipeid provided.'});
    }
    try {
        await pgConnection.query(
            `DELETE FROM favorites
         WHERE userid = $1
           AND recipeid = $2`,
            [userid, recipeid]
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Unfavorite error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});


/*
 * logmeal endpoint, takes in a recipeid and logs it in the session user's meallog
 */
app.post('/api/logmeal', async (req, res) => {
  const { recipeid } = req.body;
  // Return error if no userid in session
  if (!req.session.userid) {
    return res.status(403).json({ error: 'POST meal without userid' });
  }

  if (!recipeid) {
    return res.status(400).json({ error: 'Please enter id!' });
  }

  try {
    // Check if recipeid exists in RECIPE table
    const checkQuery = 'SELECT * FROM RECIPE WHERE recipeid = $1';
    const checkResult = await pgConnection.query(checkQuery, [recipeid]);
    if (checkResult.rowCount == 0) {
      return res.status(404).json({ error: 'Enter a valid ID!' });
    }

    /*
    * Attempt the meal log using the entered recipeid
    */
    const query = 'INSERT INTO MEALLOG VALUES($1, $2, NOW(), CURRENT_DATE)';
    await pgConnection.query(query, [recipeid, req.session.userid]);
    return res.status(200).json({ success: true });

  } catch (e) {
    console.log(e);
  }
});

/*
 * favorite endpoint, takes in a userid, recipeid, and date saved based on machine
 */
app.post('/api/favorite', async (req, res) => {
    // must be logged in
    const userid = req.session.userid;
    if (!userid) {
        return res.status(401).json({error: 'POST meal without userid'});
    }

    // recipeid from body
    const { recipeid } = req.body;
    if (!recipeid) {
        return res.status(400).json({error: 'Please enter id!'});
    }

    try {
        // Check if recipeid exists in RECIPE table
        const checkQuery = 'SELECT * FROM RECIPE WHERE recipeid = $1';
        const checkResult = await pgConnection.query(checkQuery, [recipeid]);
        if (checkResult.rowCount == 0) {
            return res.status(404).json({ error: 'Enter a valid ID!' });
        }

        // insert into favorites
        await pgConnection.query(
            `INSERT INTO favorites (userid, recipeid, datesaved) VALUES ($1, $2, CURRENT_DATE)
            ON CONFLICT DO NOTHING`, // in case click twice
            [userid, recipeid]
        );
        return res.json({success: true});
    } catch (err) {
        console.error('Favorite error:', err);
        return res.status(500).json({error: 'Internal server error.'});
    }
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
  const defaultPhoto = fs.readFileSync('./images/default.png')

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

// GET the profile picture
app.get('/api/profile-photo-bytes', async (req, res) => {
  const userid = req.session.userid;
  if (!req.session.userid) return res.status(401).json({ error: "Not logged in" });
  
  try {
    const result = await pgConnection.query(
      'SELECT profilePhoto FROM "USER" WHERE userid = $1',
      [userid]
    );
    
    // convert byte array to png
    res.set('Content-Type', 'image/png');
    res.send(result.rows[0].profilephoto);
  } catch (err) {
    console.error('Photo fetch error:', err);
    res.status(500).end();
  }
});

// Clear session --> logout
app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed.' });
    }
    res.json({ success: true });
  });
});

main()



