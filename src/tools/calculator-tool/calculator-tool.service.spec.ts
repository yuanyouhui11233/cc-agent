import { Test, TestingModule } from '@nestjs/testing';
import { CalculatorToolService } from './calculator-tool.service';

describe('CalculatorToolService', () => {
  let service: CalculatorToolService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CalculatorToolService],
    }).compile();

    service = module.get<CalculatorToolService>(CalculatorToolService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
