const userService = require('./user.service');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

async function getMe(req, res, next) {
  try {
    const user = await userService.getMe(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function signup(req, res, next) {
  try {
    const { email, password, role } = req.body;
    const existing = await userService.findByEmail(email);
    if (existing) return res.status(409).json({ error: 'User already exists.' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await userService.createUser({ email, password: hashed, role });
    res.status(201).json({ message: 'User created', user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await userService.findByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials.' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials.' });
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMe, signup, login }; 