const request = require('supertest');
const app = require('../app');

describe('LocPay API flow', () => {
  let receiverId;
  let operationId;

  test('create receiver', async () => {
    const res = await request(app)
      .post('/receivers')
      .send({ name: 'Test Receiver', balance: 0 })
      .set('Accept', 'application/json');

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('name', 'Test Receiver');
    expect(res.body).toHaveProperty('balance');
    receiverId = res.body.id;
  });

  test('create operation', async () => {
    const res = await request(app)
      .post('/operations')
      .send({ receiver_id: receiverId, gross_value: 50000 })
      .set('Accept', 'application/json');

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('gross_value', 50000);
    expect(res.body).toHaveProperty('fee');
    expect(res.body).toHaveProperty('net_value');
    expect(res.body).toHaveProperty('status', 'pending');
    operationId = res.body.id;
  });

  test('confirm operation', async () => {
    const res = await request(app)
      .post(`/operations/${operationId}/confirm`)
      .send();

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('operation');
    expect(res.body.operation).toHaveProperty('status', 'confirmed');
    expect(res.body).toHaveProperty('receiver');
    expect(res.body.receiver).toHaveProperty('id', receiverId);
    expect(res.body.receiver).toHaveProperty('balance');
  });

  test('get receiver with history', async () => {
    const res = await request(app).get(`/receivers/${receiverId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('receiver');
    expect(res.body).toHaveProperty('operations');
    expect(Array.isArray(res.body.operations)).toBe(true);
    expect(res.body.operations.length).toBeGreaterThanOrEqual(1);
  });
});
