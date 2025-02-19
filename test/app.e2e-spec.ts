import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('/points', () => {
    const testTransactions = [
      {
        payer: 'SHOPIFY',
        points: 300,
        timestamp: '2024-06-30T10:00:00Z',
      },
      {
        payer: 'AMAZON',
        points: 200,
        timestamp: '2024-06-30T11:00:00Z',
      },
    ];

    it('should handle complete points workflow', async () => {
      await request(app.getHttpServer())
        .post('/api/points/transactions')
        .send(testTransactions)
        .expect(201);

      const initialBalance = await request(app.getHttpServer())
        .get('/api/points/balances')
        .expect(200);

      expect(initialBalance.body).toEqual({
        SHOPIFY: 300,
        AMAZON: 200,
      });

      const spendResponse = await request(app.getHttpServer())
        .post('/api/points/spend')
        .send({ points: 100 })
        .expect(200);

      expect(Array.isArray(spendResponse.body)).toBeTruthy();

      const finalBalance = await request(app.getHttpServer())
        .get('/api/points/balances')
        .expect(200);

      const totalRemaining = Object.values(finalBalance.body).reduce(
        (sum: number, points: number) => sum + points,
        0,
      );
      expect(totalRemaining).toBe(400);
    });

    it('should handle insufficient points error', async () => {
      await request(app.getHttpServer())
        .post('/api/points/spend')
        .send({ points: 1000 })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe('Not enough points available');
        });
    });
  });
});
