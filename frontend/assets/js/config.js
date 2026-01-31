// ============================================
// API Configuration
// ============================================
// Change this URL when deploying to production

const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000'
    : 'https://your-backend-url.onrender.com';

export default API_BASE_URL;
