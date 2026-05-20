const { registerUser, loginUser } = require("../services/authService");

const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "name, email, and password are required" });
    if (password.length < 6)
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });

    const result = await registerUser(name, email, password, phone);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "email and password are required" });

    const result = await loginUser(email, password);
    return res.json(result);
  } catch (err) {
    return res.status(401).json({ success: false, message: err.message });
  }
};

module.exports = { register, login };
