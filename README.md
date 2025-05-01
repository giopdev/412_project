# 412_project
cool project, really cool


<b>usage:</b>
```Bash
npm install
touch sql_credentials
# <write credentials to file> ...

# import some data
node create_users.js
node create_food.js

# Start the server
node server.js
```

<h3>Your credentials should be stored in a file as such</h3>

<b>sql_credentials.json</b>
```JSON
{
    "user": "username",
    "database": "db_name",
    "password": "pass",
    "host": "localhost",
    "port": 5432
}
```
