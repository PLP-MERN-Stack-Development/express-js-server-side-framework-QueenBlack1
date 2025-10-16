const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  // Skip authentication for GET requests (optional)
  if (req.method === 'GET') {
    return next();
  }
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please provide a valid Bearer token.'
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  // Simple token validation (in real app, use JWT or similar)
  if (token !== process.env.API_TOKEN || !process.env.API_TOKEN) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
  
  next();
};

module.exports = authMiddleware;