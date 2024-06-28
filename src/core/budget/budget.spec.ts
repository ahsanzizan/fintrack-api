import { Test, TestingModule } from '@nestjs/testing';

import { Budget } from './budget';

describe('Budget', () => {
  let provider: Budget;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Budget],
    }).compile();

    provider = module.get<Budget>(Budget);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
