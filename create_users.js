const fs = require('fs');
const { Client } = require('pg');
const crypto = require('crypto');
const { createTables } = require('./create_tables');

const sql_credentials = JSON.parse(fs.readFileSync('./sql_credentials.json', 'utf8'))

const pgConnection = new Client({
  user: sql_credentials.user,
  host: sql_credentials.host,
  database: sql_credentials.database,
  password: sql_credentials.password,
  port: sql_credentials.port,
})

// inserts all users from users.json
async function insertUsers(){
  try{
    const users = JSON.parse(fs.readFileSync('./users.json', 'utf8'))

    const insertUserQuery = `
      INSERT INTO "USER" (fullName, username, email, userPassword, profilePhoto)
      VALUES ($1, $2, $3, $4, $5);
    `

    var usersInserted = 0

    for(const user of users){
      const imageBytes = fs.readFileSync(user.imagePath)
      const hashedPassword = saltAndHash(user.userPassword, user.username)
      await pgConnection.query(insertUserQuery,[user.fullName, user.username, user.email, hashedPassword, imageBytes])
      usersInserted ++
    }

    console.log('inserted ' + usersInserted + ' users')
  } catch(e){
    console.error(e)
  }
}

// inserts a singular user with given data
async function insertUser(fullName, username, email, userPassword, imagePath){
  try{
    const insertUserQuery = `
      INSERT INTO "USER" (fullName, username, email, userPassword, profilePhoto)
      VALUES ($1, $2, $3, $4, $5);
    `
      const hashedPassword = saltAndHash(userPassword, username)

      const imageBytes = fs.readFileSync(imagePath)
      await pgConnection.query(insertUserQuery,[fullName, username, email, hashedPassword, imageBytes])

    console.log('inserted 1 user')
  } catch(e){
    console.error(e)
  }
}

// Returns the sha256 hash of a string (toHash + salt)
function saltAndHash(toHash, salt){
  const hashable = toHash + salt
  const hash = crypto.createHash('sha256')
  hash.update(hashable)
  return hash.digest('hex')
}

async function main() {
  await pgConnection.connect()

  await createTables(pgConnection);

  await insertUsers()
  await insertUser("User Four", "user4", "user4@example.com", "123456789", "./images/default.png")

  await pgConnection.end()
}

main()
