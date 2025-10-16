const loggingMiddleware = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  
  // Log request body for POST and PUT requests
  if (['POST', 'PUT'].includes(req.method)) {
    console.log('Request Body:', req.body);
  }
  
  next();
};

module.exports = loggingMiddleware;