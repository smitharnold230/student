const User = require('../../db/User');
const Profile = require('../../db/Profile');

async function getMe(userId) {
  return User.findByPk(userId, {
    attributes: ['id', 'email', 'role']
  });
}

async function findByEmail(email) {
  return User.findOne({ where: { email } });
}

async function createUser({ email, password, role }) {
  const user = await User.create({ email, password, role });
  await Profile.create({
    userId: user.id,
    name: '',
    degree: '',
    class: '',
    status: '',
    transport: '',
    hostelInfo: '',
    batch: null,
  });
  return user;
}

module.exports = { getMe, findByEmail, createUser }; 