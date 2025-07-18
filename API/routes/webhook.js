const express = require('express');
const axios = require('axios');
const UserToken = require('../models/UserToken');
const { refreshAccessToken } = require('./auth');
const router = express.Router();

// Model for storing webhook events (optional)
const mongoose = require('mongoose');

const webhookEventSchema = new mongoose.Schema({
  topic: String,
  user_id: String,
  resource: String,
  application_id: String,
  attempts: Number,
  sent: Date,
  received: Date,
  processed: { type: Boolean, default: false },
  data: mongoose.Schema.Types.Mixed,
  error: String
}, {
  timestamps: true
});

const WebhookEvent = mongoose.model('WebhookEvent', webhookEventSchema);

// Webhook endpoint for MercadoLibre notifications
router.post('/meli', async (req, res) => {
  try {
    const { topic, user_id, resource, application_id, attempts, sent } = req.body;

    console.log('Webhook received:', {
      topic,
      user_id,
      resource,
      application_id,
      attempts,
      sent
    });

    // Validate required fields
    if (!topic || !user_id || !resource) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['topic', 'user_id', 'resource']
      });
    }

    // Save webhook event to database
    const webhookEvent = new WebhookEvent({
      topic,
      user_id: user_id.toString(),
      resource,
      application_id,
      attempts,
      sent: sent ? new Date(sent) : null,
      received: new Date()
    });

    await webhookEvent.save();

    // Get user's access token
    const userToken = await UserToken.findOne({ user_id: user_id.toString() });

    if (!userToken) {
      console.log(`No token found for user ${user_id}`);
      webhookEvent.error = 'User token not found';
      webhookEvent.processed = false;
      await webhookEvent.save();
      
      return res.status(200).json({
        message: 'Webhook received but user not authenticated'
      });
    }

    let access_token = userToken.access_token;

    // Fetch resource data using the access token
    try {
      const resourceResponse = await axios.get(resource, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });

      // Store the fetched data
      webhookEvent.data = resourceResponse.data;
      webhookEvent.processed = true;
      await webhookEvent.save();

      // Process different types of notifications
      await processNotification(topic, user_id, resourceResponse.data);

      console.log(`Webhook processed successfully for user ${user_id}, topic: ${topic}`);

    } catch (error) {
      // If token is expired, try to refresh it
      if (error.response?.status === 401) {
        console.log(`Token expired for user ${user_id}, attempting refresh...`);
        
        try {
          access_token = await refreshAccessToken(user_id);
          
          // Retry with new token
          const resourceResponse = await axios.get(resource, {
            headers: {
              'Authorization': `Bearer ${access_token}`
            }
          });

          webhookEvent.data = resourceResponse.data;
          webhookEvent.processed = true;
          await webhookEvent.save();

          await processNotification(topic, user_id, resourceResponse.data);

          console.log(`Webhook processed successfully after token refresh for user ${user_id}`);

        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError.message);
          webhookEvent.error = `Token refresh failed: ${refreshError.message}`;
          webhookEvent.processed = false;
          await webhookEvent.save();
        }
      } else {
        console.error('Error fetching resource:', error.response?.data || error.message);
        webhookEvent.error = error.response?.data || error.message;
        webhookEvent.processed = false;
        await webhookEvent.save();
      }
    }

    // Always respond with 200 to acknowledge receipt
    res.status(200).json({
      message: 'Webhook received and processed'
    });

  } catch (error) {
    console.error('Webhook processing error:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Function to process different types of notifications
async function processNotification(topic, user_id, data) {
  console.log(`Processing ${topic} notification for user ${user_id}`);

  switch (topic) {
    case 'orders_v2':
      console.log('New order received:', {
        order_id: data.id,
        status: data.status,
        total_amount: data.total_amount,
        buyer: data.buyer?.id
      });
      // Add your order processing logic here
      break;

    case 'items':
      console.log('Item updated:', {
        item_id: data.id,
        title: data.title,
        status: data.status,
        available_quantity: data.available_quantity
      });
      // Add your item processing logic here
      break;

    case 'questions':
      console.log('New question received:', {
        question_id: data.id,
        text: data.text,
        item_id: data.item_id,
        from: data.from?.id
      });
      // Add your question processing logic here
      break;

    case 'claims':
      console.log('New claim received:', {
        claim_id: data.id,
        type: data.type,
        stage: data.stage,
        order_id: data.order_id
      });
      // Add your claim processing logic here
      break;

    default:
      console.log(`Unhandled topic: ${topic}`, data);
  }
}

// Route to get webhook events for a user
router.get('/events/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    const events = await WebhookEvent.find({ user_id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await WebhookEvent.countDocuments({ user_id });

    res.json({
      events,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > (parseInt(skip) + parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching webhook events:', error.message);
    res.status(500).json({
      error: 'Failed to fetch webhook events',
      details: error.message
    });
  }
});

module.exports = router;