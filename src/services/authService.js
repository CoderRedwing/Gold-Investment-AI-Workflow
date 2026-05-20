const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

const registerUser = async (name, email, password, phone) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Email already registered");

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, phone },
  });

  // Create wallet automatically on registration
  await prisma.goldWallet.create({ data: { userId: user.id } });

  const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return {
    success: true,
    message: "Registration successful",
    data: { userId: user.id, name: user.name, email: user.email, token },
  };
};

const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid email or password");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Invalid email or password");

  const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return {
    success: true,
    message: "Login successful",
    data: { userId: user.id, name: user.name, email: user.email, token },
  };
};

module.exports = { registerUser, loginUser };
