// auth.service.spec.ts
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/lib/prisma';
import * as request from 'supertest';

const GLOBAL_TIMEOUT = 10_000;

describe('Application (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let server: any;

  const userProps = {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'password123',
    accessToken: '',
  };

  const budgetProps = {
    id: '',
    amount: 50_000,
    name: 'Budget 1',
    goal: 'Achieve something',
    startDate: new Date(),
    endDate: new Date(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    await app.init();
    server = app.getHttpServer();

    prisma = app.get(PrismaService);

    await prisma.cleanDatabase();
  }, GLOBAL_TIMEOUT);

  afterAll(async () => {
    await app.close();
    await prisma.cleanDatabase();
  }, GLOBAL_TIMEOUT);

  describe('Authentication', () => {
    describe('/auth/register (POST)', () => {
      it(
        'should register a new user',
        async () => {
          const response = await request(server)
            .post('/auth/register')
            .send(userProps)
            .expect(201);

          const user = await prisma.users.findUnique({
            where: { email: response.body.result.email },
          });

          expect(user).toBeDefined();

          expect(response.body).toHaveProperty('result');
          expect(response.body.result).toHaveProperty('name', 'Test User');
          expect(response.body.result).toHaveProperty(
            'email',
            'testuser@example.com',
          );
        },
        GLOBAL_TIMEOUT,
      );

      it(
        'should respond with a bad request error',
        async () => {
          const { name, email } = userProps;

          const response = await request(server)
            .post('/auth/register')
            .send({ name, email })
            .expect(400);

          expect(response.body).toHaveProperty('error', 'Bad Request');
        },
        GLOBAL_TIMEOUT,
      );

      it(
        'should respond with a forbidden error',
        async () => {
          const response = await request(server)
            .post('/auth/register')
            .send(userProps)
            .expect(403);

          expect(response.body).toHaveProperty('error', 'Forbidden');
        },
        GLOBAL_TIMEOUT,
      );
    });

    describe('/auth/login (POST)', () => {
      it(
        'should return necessary auth credentials',
        async () => {
          const { email, password } = userProps;

          const response = await request(server)
            .post('/auth/login')
            .send({ email, password })
            .expect(200);

          userProps.accessToken = response.body.result.access_token;

          expect(response.body).toHaveProperty('result');
          expect(response.body.result).toHaveProperty('access_token');
          expect(response.body.result).toHaveProperty('sub');
          expect(response.body.result).toHaveProperty('email', userProps.email);
          expect(response.body.result).toHaveProperty('name', userProps.name);
        },
        GLOBAL_TIMEOUT,
      );

      it(
        'should respond with an unauthorized error',
        async () => {
          const { email } = userProps;

          const response = await request(server)
            .post('/auth/login')
            .send({ email, password: 'password112' })
            .expect(401);

          expect(response.body).toHaveProperty('error', 'Unauthorized');
        },
        GLOBAL_TIMEOUT,
      );

      it(
        'should respond with an bad request error',
        async () => {
          const { email } = userProps;

          const response = await request(server)
            .post('/auth/login')
            .send({ email })
            .expect(400);

          expect(response.body).toHaveProperty('error', 'Bad Request');
        },
        GLOBAL_TIMEOUT,
      );
    });

    describe('/auth/verify/:token (GET)', () => {
      it(
        'should respond with an unauthorized error',
        async () => {
          const wrongVerificationToken =
            'aoksdoakd10d9znz129-192i1jsada-zaokdasodk';

          const response = await request(server)
            .get(`/auth/verify/${wrongVerificationToken}`)
            .expect(401);

          expect(response.body).toHaveProperty('error', 'Unauthorized');
        },
        GLOBAL_TIMEOUT,
      );
    });

    describe('/auth/profile (PATCH)', () => {
      let verificationToken: string;

      it(
        "should update current user's name",
        async () => {
          const newName = 'User Test';

          const response = await request(server)
            .patch('/auth/profile')
            .set('Authorization', `Bearer ${userProps.accessToken}`)
            .send({ name: newName })
            .expect(200);

          verificationToken = response.body.result.verification_token as string;
          userProps.name = newName;

          expect(response.body).toHaveProperty('result');
          expect(response.body.result).toHaveProperty('name', newName);
          expect(response.body.result).toHaveProperty('email');
          expect(response.body.result).toHaveProperty('verification_token');
          expect(response.body.result).toHaveProperty('is_verified');
        },
        GLOBAL_TIMEOUT,
      );

      it(
        "should update current user's email and respond with a new verification token",
        async () => {
          const newEmail = 'usertest@gmail.com';

          const response = await request(server)
            .patch('/auth/profile')
            .set('Authorization', `Bearer ${userProps.accessToken}`)
            .send({ email: newEmail })
            .expect(200);

          userProps.email = newEmail;
          userProps.accessToken = response.body.result.access_token;

          expect(response.body).toHaveProperty('result');
          expect(response.body.result).toHaveProperty('verification_token');
          // Ensure that the new verification token is not the same as the previous one
          expect(response.body.result.verification_token).not.toBe(
            verificationToken,
          );
        },
        GLOBAL_TIMEOUT,
      );

      it(
        'should respond with an unauthorized error',
        async () => {
          const newEmail = 'usertest@gmail.com';

          const response = await request(server)
            .patch('/auth/profile')
            .send({ email: newEmail })
            .expect(401);

          expect(response.body).toHaveProperty('error', 'Unauthorized');
        },
        GLOBAL_TIMEOUT,
      );
    });
  });

  describe('User Profile', () => {
    describe('/profile (GET)', () => {
      it(
        "should respond with current user's profile",
        async () => {
          const response = await request(server)
            .get('/profile')
            .set('Authorization', `Bearer ${userProps.accessToken}`)
            .expect(200);

          expect(response.body).toHaveProperty('result');
          expect(response.body.result).toHaveProperty('name', userProps.name);
          expect(response.body.result).toHaveProperty('email', userProps.email);
        },
        GLOBAL_TIMEOUT,
      );

      it(
        'should respond with an unauthorized error',
        async () => {
          const response = await request(server).get('/profile').expect(401);

          expect(response.body).toHaveProperty('error', 'Unauthorized');
        },
        GLOBAL_TIMEOUT,
      );
    });
  });

  describe('Budget', () => {
    describe('/budgets (POST)', () => {
      it(
        'should create a new budget',
        async () => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...createBudgetDto } = budgetProps;

          const response = await request(server)
            .post('/budgets')
            .set('Authorization', `Bearer ${userProps.accessToken}`)
            .send({
              amount: createBudgetDto.amount,
              name: createBudgetDto.name,
              goal: createBudgetDto.goal,
              start_date: createBudgetDto.startDate.toISOString(),
              end_date: createBudgetDto.endDate.toISOString(),
            })
            .expect(201);

          budgetProps.id = response.body.result.id;

          expect(response.body).toHaveProperty('result');
          expect(response.body.result).toHaveProperty(
            'amount',
            createBudgetDto.amount,
          );
          expect(response.body.result).toHaveProperty(
            'name',
            createBudgetDto.name,
          );
          expect(response.body.result).toHaveProperty(
            'goal',
            createBudgetDto.goal,
          );
        },
        GLOBAL_TIMEOUT,
      );

      it(
        'should respond with an unauthorized error',
        async () => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...createBudgetDto } = budgetProps;

          const response = await request(server)
            .post('/budgets')
            .send({
              amount: createBudgetDto.amount,
              name: createBudgetDto.name,
              goal: createBudgetDto.goal,
              start_date: createBudgetDto.startDate.toISOString(),
              end_date: createBudgetDto.endDate.toISOString(),
            })
            .expect(401);

          expect(response.body).toHaveProperty('error', 'Unauthorized');
        },
        GLOBAL_TIMEOUT,
      );

      it(
        'should respond with a bad request error',
        async () => {
          // Exclude the amount property from createDtoProps
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, amount, ...createBudgetDto } = budgetProps;

          const response = await request(server)
            .post('/budgets')
            .set('Authorization', `Bearer ${userProps.accessToken}`)
            .send({
              name: createBudgetDto.name,
              goal: createBudgetDto.goal,
              start_date: createBudgetDto.startDate.toISOString(),
              end_date: createBudgetDto.endDate.toISOString(),
            })
            .expect(400);

          expect(response.body).toHaveProperty('error', 'Bad Request');
        },
        GLOBAL_TIMEOUT,
      );
    });

    describe('/budgets (GET)', () => {
      it(
        'should respond with a list of budgets',
        async () => {
          const response = await request(server)
            .get('/budgets')
            .set('Authorization', `Bearer ${userProps.accessToken}`)
            .expect(200);

          expect(response.body).toHaveProperty('result');
          expect(response.body.result).toHaveLength(1);
        },
        GLOBAL_TIMEOUT,
      );

      it(
        'should respond with an unauthorized error',
        async () => {
          const response = await request(server).get('/budgets').expect(401);

          expect(response.body).toHaveProperty('error', 'Unauthorized');
        },
        GLOBAL_TIMEOUT,
      );
    });

    describe('/budgets/:id (PUT)', () => {
      it(
        "should update a budget's name",
        async () => {
          const newName = 'Updated Budget 1';

          const response = await request(server)
            .put(`/budgets/${budgetProps.id}`)
            .set('Authorization', `Bearer ${userProps.accessToken}`)
            .send({ name: newName })
            .expect(200);

          budgetProps.name = newName;

          expect(response.body).toHaveProperty('result');
          expect(response.body.result).toHaveProperty('name', newName);
        },
        GLOBAL_TIMEOUT,
      );
    });
  });
});
