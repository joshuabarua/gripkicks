const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');


const betterAuthMiddleware = require('./middleware/better-auth');
const prisma = new PrismaClient();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return res.status(401).json({ message: error.message });
  }

  const { access_token, refresh_token } = data.session;
  res.status(200).json({ message: 'Login successful', access_token, refresh_token });
});

// Google Sign-In route
app.post('/login/google', async (req, res) => {
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });

  if (error) {
    return res.status(401).json({ message: error.message });
  }

  const { access_token, refresh_token } = data.session;
  res.status(200).json({ message: 'Google login successful', access_token, refresh_token });
});

// Session route
app.get('/session', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error) {
    return res.status(401).json({ message: error.message });
  }

  res.status(200).json({ message: 'Session valid', user: data.user });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use(betterAuthMiddleware);

// Get all users
app.get('/api/users', async (req, res) => {
  const { data, error } = await supabase.from('users').select('*');
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

// Get user by email
app.post('/get-user', async (req, res) => {
  const { email } = req.body;
  const { data, error } = await supabase.from('users').select('*').eq('email', email);

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  if (data.length === 0) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.status(200).json({ user: data[0] });
});


app.post('/recommend-shoes', betterAuthMiddleware, async (req, res) => {
  const { footShape, volume } = req.body;

  try {
    const shoes = await prisma.shoe.findMany({
      include: {
        comfortRankings: true,
      },
    });

    // Score and filter
    const recommended = shoes
      .map(shoe => {
        const scoreObj = shoe.comfortRankings.find(
          cr => cr.footShape === footShape && cr.volume === volume
        );
        return {
          ...shoe,
          comfortScore: scoreObj ? scoreObj.score : 3,
        };
      })
      .sort((a, b) => b.comfortScore - a.comfortScore);

    res.json(recommended);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
