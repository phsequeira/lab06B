require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });
    test('returns all routes', async() => {

      const expectation = [
        {
            "id": 1,
            "location_id": 1,
            "route_name": "5 Gallon Bucket",
            "route_rating": "5.8",
            "is_toprope": false,
            "owner_id": 1
        },
        {
            "id": 2,
            "location_id": 1,
            "route_name": "Spiderman",
            "route_rating": "5.7",
            "is_toprope": false,
            "owner_id": 1
        },
        {
            "id": 3,
            "location_id": 1,
            "route_name": "Rope De Dope",
            "route_rating": "5.8",
            "is_toprope": true,
            "owner_id": 1
        },
        {
            "id": 4,
            "location_id": 1,
            "route_name": "Moby Dick",
            "route_rating": "5.1",
            "is_toprope": false,
            "owner_id": 1
        },
        {
            "id": 5,
            "location_id": 1,
            "route_name": "The North Face",
            "route_rating": "5.11",
            "is_toprope": false,
            "owner_id": 1
        },
        {
            "id": 6,
            "location_id": 1,
            "route_name": "The Nutcracker Suite (aka Nutcracker)",
            "route_rating": "5.8",
            "is_toprope": false,
            "owner_id": 1
        }
    ];

      const data = await fakeRequest(app)
        .get('/routes')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('returns a single route with the matching id', async() => {

      const expectation = {
        "id": 6,
        "location_id": 1,
        "route_name": "The Nutcracker Suite (aka Nutcracker)",
        "route_rating": "5.8",
        "is_toprope": false,
        "owner_id": 1
    };

      const data = await fakeRequest(app)
        .get('/routes/6')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);

    });

    test('creates a new route ', async() => {
      
      const newRoute = {
        location_id: 3,
        route_name: 'up and at-em' ,
        route_rating: '5.10',
        is_toprope: true,
      };

      const expectedRoute = {
        ...newRoute,
        id: 7,
        owner_id: 1,
      };

      const data = await fakeRequest(app)
        .post('/routes')
        .send(newRoute)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectedRoute);

      
      const allRoutes = await fakeRequest(app)
        .get('/routes')
        .expect('Content-Type', /json/)
        .expect(200);

      const upAndAtem = allRoutes.body.find(route => route.route_name === 'up and at-em');

      expect(upAndAtem).toEqual(expectedRoute);
    });

    test('updates a route', async() => {
      const newRoute = {
        location_id: 3,
        route_name: 'up and at-em' ,
        route_rating: '5.10',
        is_toprope: true,
      };

      const expectedRoute = {
        ...newRoute,
        owner_id: 1,
        id: 1
      };
      

      await fakeRequest(app)
        .put('/routes/1')
        .send(newRoute)
        .expect('Content-Type', /json/)
        .expect(200);

      const updatedRoute = await fakeRequest(app)
        .get('/routes/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(updatedRoute.body).toEqual(expectedRoute);
    });

    test('deletes a route from routes with the id', async() => {
      const expectation = {
        'id': 7,
        'location_id': 3,
        'route_name': 'up and at-em' ,
        'route_rating': '5.10',
        'is_toprope': true,
        'owner_id': 1
      };

      const data = await fakeRequest(app)
        .delete('/routes/7')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);

      const nothing = await fakeRequest(app)
        .get('/routes/7')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(nothing.body).toEqual('');
    });
  });
});
    