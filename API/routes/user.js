const express = require('express');
const axios = require('axios');
const UserToken = require('../models/UserToken');
const { refreshAccessToken } = require('./auth');
const router = express.Router();

const MELI_USER_URL = 'https://api.mercadolibre.com/users/me';

// Get user data by user_id
router.get('/me/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    // Find user token in database
    const userToken = await UserToken.findOne({ user_id });

    if (!userToken) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'No authentication token found for this user'
      });
    }

    let access_token = userToken.access_token;

    // Try to get user data with current token
    try {
      const userResponse = await axios.get(MELI_USER_URL, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });

      res.json({
        success: true,
        user: userResponse.data,
        token_info: {
          scope: userToken.scope,
          updated_at: userToken.updated_at
        }
      });

    } catch (error) {
      // If token is expired, try to refresh it
      if (error.response?.status === 401) {
        console.log(`Token expired for user ${user_id}, attempting refresh...`);
        
        try {
          access_token = await refreshAccessToken(user_id);
          
          // Retry with new token
          const userResponse = await axios.get(MELI_USER_URL, {
            headers: {
              'Authorization': `Bearer ${access_token}`
            }
          });

          res.json({
            success: true,
            user: userResponse.data,
            token_info: {
              scope: userToken.scope,
              updated_at: new Date(),
              refreshed: true
            }
          });

        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError.message);
          res.status(401).json({
            error: 'Authentication failed',
            message: 'Token expired and refresh failed. Please re-authenticate.',
            details: refreshError.message
          });
        }
      } else {
        throw error;
      }
    }

  } catch (error) {
    console.error('Error getting user data:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to get user data',
      details: error.response?.data || error.message
    });
  }
});

module.exports = router;