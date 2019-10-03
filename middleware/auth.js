// send Json web token back to authenticate and access protected routes by creating our own custom middleware.

const jwt = require('jsonwebtoken');
const config = require('config');

// middleware function has access to the 'request' and 'response' object and 'next' the callback which it has to run once we're done so it moves on to the next piece of middleware
module.exports = function(req, res, next) {
  // Get token from header => When we send a request to a protected route we need to send the token within a header.
  const token = req.header('x-auth-token');

  //check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));

    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'token is not valid' });
  }
};
