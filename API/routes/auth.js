const express = require('express');
const axios = require('axios');
const UserToken = require('../models/UserToken');
const router = express.Router();

// MercadoLibre OAuth URLs
const MELI_AUTH_URL = 'https://auth.mercadolibre.com.ar/authorization';
const MELI_TOKEN_URL = 'https://api.mercadolibre.com/oauth/token';
const MELI_USER_URL = 'https://api.mercadolibre.com/users/me';

// Route to initiate OAuth flow
router.get('/meli', (req, res) => {
  const scopes = 'read_items,write_items,read_orders,read_users,read_shipping';
  const authUrl = `${MELI_AUTH_URL}?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&scope=${scopes}`;

  res.redirect(authUrl);
});

// OAuth callback route
router.get('/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Authorization code not provided' });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(MELI_TOKEN_URL, {
      grant_type: 'authorization_code',
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code: code,
      redirect_uri: process.env.REDIRECT_URI
    });

    const {
      access_token,
      refresh_token,
      scope,
      expires_in
    } = tokenResponse.data;

    // Get user information
    const userResponse = await axios.get(MELI_USER_URL, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    const user_id = userResponse.data.id.toString();

    // Save or update token in database
    await UserToken.findOneAndUpdate(
      { user_id },
      {
        user_id,
        access_token,
        refresh_token,
        scope,
        expires_in,
        updated_at: new Date()
      },
      { upsert: true, new: true }
    );

    console.log(`Token saved for user: ${user_id}`);

    // Redirect to success page
    res.redirect(`${process.env.FRONTEND_URL}/success?user_id=${user_id}`);

  } catch (error) {
    console.error('OAuth callback error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to complete OAuth flow',
      details: error.response?.data || error.message
    });
  }
});

// Function to refresh access token
const refreshAccessToken = async (user_id) => {
  try {
    const userToken = await UserToken.findOne({ user_id });
    
    if (!userToken) {
      throw new Error('User token not found');
    }

    const response = await axios.post(MELI_TOKEN_URL, {
      grant_type: 'refresh_token',
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      refresh_token: userToken.refresh_token
    });

    const {
      access_token,
      refresh_token,
      scope,
      expires_in
    } = response.data;

    // Update token in database
    await UserToken.findOneAndUpdate(
      { user_id },
      {
        access_token,
        refresh_token,
        scope,
        expires_in,
        updated_at: new Date()
      }
    );

    return access_token;
  } catch (error) {
    console.error('Token refresh error:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = { router, refreshAccessToken };