const client = require('../lib/client');
// import our seed data:
const routes = require('./routes.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );
      
    const user = users[0].rows[0];

    await Promise.all(
      routes.map(route => {
        return client.query(`
                    INSERT INTO routes (location, route_name, route_rating, is_toprope, owner_id)
                    VALUES ($1, $2, $3, $4, $5);
                `,
        [route.location, route.route_name, route.route_rating, route.is_toprope, user.id]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
