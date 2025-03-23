const fs = require('fs');
const { Client } = require('pg');

const pgConnection = new Client({
  user: '',
  host: 'localhost',
  database: '',
  password: '',
  port: 5432,
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
      await pgConnection.query(insertUserQuery,[user.fullName, user.username, user.email, user.userPassword, imageBytes])
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

      const imageBytes = fs.readFileSync(imagePath)
      await pgConnection.query(insertUserQuery,[fullName, username, email, userPassword, imageBytes])

    console.log('inserted 1 user')
  } catch(e){
    console.error(e)
  }
}

async function main() {
await pgConnection.connect()

await insertUsers()
await insertUser("User Four", "user4", "user4@example.com", "123456789", "./images/default.png")

await pgConnection.end()
}

main()
