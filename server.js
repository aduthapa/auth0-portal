require('dotenv').config();
const express = require('express');
const { auth, requiresAuth } = require('express-openid-connect');
const session = require('express-session');
const axios = require('axios');
const path = require('path');

const app = express();

// Session configuration
app.use(session({
  secret: process.env.AUTH0_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Auth0 configuration
const authConfig = {
  authRequired: false,
  auth0Logout: true,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  secret: process.env.AUTH0_SECRET,
  routes: {
    login: '/login',
    logout: '/logout',
    callback: '/callback'
  }
};

app.use(auth(authConfig));
app.use(express.static(path.join(__dirname, 'public')));

// Helper to get Management API token
async function getManagementApiToken() {
  try {
    const response = await axios.post(`${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`, {
      client_id: process.env.AUTH0_MGMT_CLIENT_ID,
      client_secret: process.env.AUTH0_MGMT_CLIENT_SECRET,
      audience: `${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/`,
      grant_type: 'client_credentials'
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting management API token:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Get user's authorized applications
async function getUserAuthorizedApps(userId, token) {
  try {
    const response = await axios.get(`${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/users/${userId}/permissions`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting user permissions:', error.response ? error.response.data : error.message);
    return [];
  }
}

// Get all applications
async function getApplications(token) {
  try {
    const response = await axios.get(`${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/clients`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting applications:', error.response ? error.response.data : error.message);
    return [];
  }
}

// Get user's SSO connections
async function getUserConnections(userId, token) {
  try {
    const response = await axios.get(`${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/users/${userId}/identities`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting user identities:', error.response ? error.response.data : error.message);
    return [];
  }
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/profile', requiresAuth(), async (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.get('/api/user', requiresAuth(), (req, res) => {
  res.json(req.oidc.user);
});

app.get('/api/user-apps', requiresAuth(), async (req, res) => {
  try {
    const token = await getManagementApiToken();
    const userId = req.oidc.user.sub;
    
    // Get all applications
    const allApps = await getApplications(token);
    
    // Get user's authorized applications
    const userPermissions = await getUserAuthorizedApps(userId, token);
    
    // Get user's connections/identities
    const userConnections = await getUserConnections(userId, token);
    
    // Filter applications that are relevant to the user
    // This is a simplification, as the actual logic may need to be more complex
    // depending on how your Auth0 setup is configured
    const authorizedApps = allApps.filter(app => {
      // Exclude Auth0 management applications
      if (app.name.includes('Auth0 Management') || app.name.includes('All Applications')) {
        return false;
      }
      
      // Include if the app is marked as global
      if (app.global) {
        return true;
      }
      
      // Include if the user has explicit permissions for this app
      return userPermissions.some(p => p.resource_server_identifier === app.client_id);
    });
    
    res.json({
      applications: authorizedApps.map(app => ({
        id: app.client_id,
        name: app.name,
        description: app.description,
        logo_uri: app.logo_uri,
        app_type: app.app_type,
        callback_url: Array.isArray(app.callbacks) ? app.callbacks[0] : null
      })),
      connections: userConnections
    });
  } catch (error) {
    console.error('Error fetching user apps:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
