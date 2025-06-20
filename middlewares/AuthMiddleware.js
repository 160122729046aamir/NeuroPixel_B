import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.headers;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized access is denied!" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedToken) {
      return res.status(400).json({ message: "Invalid token!" });
    }

    const user = await User.findById(decodedToken.id);

    if (!user) {
      return res.status(401).json({ message: "Invalid token: user doesn't exist!" });
    }

    req.user = user; // Attaching user to request object
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(500).json({ message: "Authentication failed.", error: error.message });
  }
};

export default userAuth;
