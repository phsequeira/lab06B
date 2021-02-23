const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); 

const authRoutes = createAuthRoutes();


app.use('/auth', authRoutes);


app.use('/api', ensureAuth);

app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/routes', async(req, res) => {
  try {
    const data = await client.query('SELECT routes.id, routes.location_id, routes.route_name, routes.route_rating, routes.is_toprope, routes.owner_id FROM routes  JOIN locations ON routes.location_id = locations.id');
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/locations', async(req, res) => {
  try {
    const data = await client.query('SELECT * FROM locations');
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/routes/:id', async(req, res) => {
  try {
    const id = req.params.id;
    const data = await client.query('SELECT routes.id, routes.location_id, routes.route_name, routes.route_rating, routes.is_toprope, routes.owner_id  FROM routes JOIN locations ON routes.location_id = locations.id where routes.id=$1', [id]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

  app.post('/routes', async(req, res) => {
    try {
      const data = await client.query(`
        insert into routes (location_id, route_name, route_rating, is_toprope, owner_id) 
        values ($1, $2, $3, $4, $5)
        returning *
        `, 
      [
        req.body.location_id, 
        req.body.route_name, 
        req.body.route_rating, 
        req.body.is_toprope,
        1
      ]);
      
      res.json(data.rows[0]);
    } catch(e) {
      
      res.status(500).json({ error: e.message });
    }
  });

  app.put('/routes/:id', async(req, res) => {
    const id = req.params.id;
  
    try {
      const data = await client.query(`
        UPDATE routes
        SET location_id = $1, route_name = $2, route_rating = $3, is_toprope = $4
        WHERE id=$5
        returning *;
      `,
      
      [
        req.body.location_id, 
        req.body.route_name, 
        req.body.route_rating, 
        req.body.is_toprope,
        id,
      ]);
      
      res.json(data.rows[0]);
    } catch(e) {
      
      res.status(500).json({ error: e.message });
    }
  });

app.delete('/routes/:id', async(req, res) => {
    try {
      const id = req.params.id;
      const data = await client.query('delete from routes where id=$1 returning *', [id]);
      
      res.json(data.rows[0]);
    } catch(e) {
      
      res.status(500).json({ error: e.message });
    }
  });

app.use(require('./middleware/error'));

module.exports = app;
