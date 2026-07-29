import { Test, TestingModule } from '@nestjs/testing';
import { SearchToolService } from './search-tool.service';

describe('SearchToolService', () => {
  let service: SearchToolService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SearchToolService],
    }).compile();

    service = module.get<SearchToolService>(SearchToolService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
