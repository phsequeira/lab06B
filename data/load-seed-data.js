const client = require('../lib/client');
// import our seed data:
const routes = require('./routes.js');
const usersData = require('./users.js');
const locationsData = require('./locations.js');
const { getEmoji } = require('../lib/emoji.js');
//const { getLocationId } = require('./dataUtils.js');

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

    const responses = await Promise.all(
      locationsData.map(location => {
        return client.query(`
                      INSERT INTO locations (place)
                      VALUES ($1)
                      RETURNING *;
                  `,
        [location.place]);
      })
    );
      
    const user = users[0].rows[0];

    const locations = responses[0].rows[0];


    await Promise.all(
      routes.map(route => {
        
        //const locationId = getLocationId(route, locations);

        //console.log(locationId);

        return client.query(`
                    INSERT INTO routes (location_id, route_name, route_rating, is_toprope, owner_id)
                    VALUES ($1, $2, $3, $4, $5);
                `,
        [
          locations.id, 
          route.route_name, 
          route.route_rating, 
          route.is_toprope, 
          user.id
        ]);
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
