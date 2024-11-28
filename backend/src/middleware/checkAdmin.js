const jwt = require("jsonwebtoken");

const isAdmin = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];

  console.log("Authorization Header:", authHeader);  // Should log "Bearer <token>"
  console.log("Token:", token);  // Should log "<token>"
  
  if (!token)
    return res.status(500).json({
      success: false,
      message: "User is not login !!!",
    });

  try {
    const decoded = jwt.verify(token, process.env.PASSJWT);
    if (decoded.RoleID !== "admin")
      return res.status(400).json({
        success: false,
        message: "You need Admin role !!!",
      });

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Token not found !!!",
      error,
    });
  }
};

module.exports = isAdmin;
