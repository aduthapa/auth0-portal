# auth0-portal
# Auth0 Application Portal

A centralized portal for viewing and accessing all applications linked with SSO in Auth0.

## Features

- **Single Sign-On**: Authenticate once and access all your applications
- **User Profile Dashboard**: View your profile information and connected accounts
- **Application Directory**: Browse and launch all applications you're authorized to access
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Prerequisites

- Node.js 14+ and npm
- Auth0 account with admin access
- Auth0 applications configured with SSO

## Setup Instructions

### 1. Auth0 Configuration

1. **Create a Regular Web Application**:
   - Log in to your Auth0 Dashboard
   - Go to Applications > Create Application
   - Select "Regular Web Application"
   - Name it "Auth0 Portal" or similar

2. **Configure Application Settings**:
   - Add Allowed Callback URLs: `http://localhost:3000/callback` (for development) and your production URL
   - Add Allowed Logout URLs: `http://localhost:3000` (for development) and your production URL
   - Add Allowed Web Origins: Same as above
   - Save changes

3. **Create a Machine-to-Machine Application for Management API**:
   - Go to Applications > Create Application
   - Select "Machine to Machine Application"
   - Select "Auth0 Management API" as the API
   - Grant the following permissions:
     - `read:users`
     - `read:user_idp_tokens`
     - `read:clients`
     - `read:connections`
     - `read:resource_servers`

### 2. Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/auth0-portal.git
   cd auth0-portal
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment variables**:
   ```bash
   cp .env.example .env
   ```

4. **Edit the `.env` file** with your Auth0 credentials:
   ```
   AUTH0_SECRET='a-long-randomly-generated-string'
   AUTH0_BASE_URL='http://localhost:3000'
   AUTH0_CLIENT_ID='your-auth0-client-id' # From the web application
   AUTH0_CLIENT_SECRET='your-auth0-client-secret' # From the web application
   AUTH0_ISSUER_BASE_URL='https://your-auth0-domain'
   AUTH0_MGMT_CLIENT_ID='your-auth0-management-api-client-id' # From the M2M application
   AUTH0_MGMT_CLIENT_SECRET='your-auth0-management-api-client-secret' # From the M2M application
   PORT=3000
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

6. **Access the application**:
   Open your browser and navigate to `http://localhost:3000`

### 3. Deployment to DigitalOcean App Platform

1. **Push your code to a GitHub repository**

2. **Create a new App on DigitalOcean**:
   - Go to Digital Ocean Dashboard > Apps > Create App
   - Connect to your GitHub repository
   - Configure as a Web Service
   - Use Auto-detect for build settings
   - Add all Environment Variables from your `.env` file
     - Make sure to update `AUTH0_BASE_URL` to your production URL
   - Deploy the app

3. **Update Auth0 Configuration**:
   - Add your DigitalOcean app URL to Allowed Callback URLs, Logout URLs, and Web Origins in your Auth0 Application settings

## Application Structure

```
auth0-portal/                   # Root directory
├── package.json                # Node.js package configuration
├── .env.example                # Environment variables template
├── server.js                   # Main Express server
├── Dockerfile                  # Docker configuration for container deployment
├── .dockerignore               # Files to exclude from Docker container
└── public/                     # Static files directory
    ├── index.html              # Landing page
    ├── profile.html            # User profile and applications page
    ├── styles.css              # CSS styles for the application
    └── default-app-logo.png    # Default logo for applications without one
```

## Customization

### Theming

To change the visual appearance of the portal, edit the `public/styles.css` file. The application uses Bootstrap 5, so you can leverage Bootstrap classes for styling.

### Adding Features

- **Custom Application Categories**: Modify the `getApplications` function in `server.js` to add categorization
- **Additional User Information**: Extend the user profile in `profile.html` to display more Auth0 user metadata
- **Application Search**: Add a search functionality to filter applications by name or category

## Security Considerations

- This application uses secure authentication with Auth0
- Environment variables are used for sensitive information
- HTTPS is enforced in production
- The Management API token is only used server-side
- Minimal permissions are requested from the Management API

## Troubleshooting

### Application doesn't load
- Check if your Auth0 credentials are correct
- Verify the allowed callback URLs and origins in Auth0 settings

### Cannot see applications
- Ensure your user has access to applications in Auth0
- Check if the Management API has the required permissions
- Look at server logs for potential API errors

### Authentication errors
- Check Auth0 logs for authentication issues
- Verify that your Auth0 domain and client IDs are correct

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues or questions, please open an issue on the GitHub repository.

---

Built with Express.js, Auth0, and Bootstrap 5.
