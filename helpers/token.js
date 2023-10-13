const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
  const secret = "hellothisisoneplacestudio";
  try {
    const token = jwt.sign(payload, secret, { expiresIn: '1d' });
    return token;
  } catch (error) {
    console.log(error)
  }
}

const verifyToken = (token) => {
  const secret = "hellothisisoneplacestudio";
  try {
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  generateToken,
  verifyToken,
};
