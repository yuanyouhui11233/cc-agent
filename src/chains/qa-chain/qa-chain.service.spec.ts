import { Test, TestingModule } from '@nestjs/testing';
import { QaChainService } from './qa-chain.service';

describe('QaChainService', () => {
  let service: QaChainService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QaChainService],
    }).compile();

    service = module.get<QaChainService>(QaChainService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
