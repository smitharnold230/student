const request = require('supertest');
const app = require('../app');

describe('health', () => {
  it('returns 404 for unknown route (placeholder)', async () => {
    const res = await request(app).get('/__unknown__');
    expect(res.status).toBe(404);
    expect(res.body.ok).toBe(false);
  });
});
