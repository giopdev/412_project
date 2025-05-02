const fs = require('fs');


async function createTables(client) {
    try{
        const sql = fs.readFileSync('create_tables.sql', 'utf8');
        await client.query(sql);

        console.log('Successfully created tables')
    } catch(e){
        console.error(e)
    }
}

module.exports = { createTables };