const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];
  
  console.log("Authorization Header:", authHeader);  // Should log "Bearer <token>"
  console.log("Token:", token);  // Should log "<token>"

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "User is not logged in!",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.PASSJWT);
    console.log("Decoded Token:", decoded);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.log(error);
    return res.status(403).json({
      success: false,
      message: "Invalid token!",
    });
  }
};

module.exports = verifyToken;
