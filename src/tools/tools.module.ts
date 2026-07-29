import { Module } from '@nestjs/common';
import { SearchToolService } from './search-tool/search-tool.service';
import { CalculatorToolService } from './calculator-tool/calculator-tool.service';

@Module({
  providers: [SearchToolService, CalculatorToolService]
})
export class ToolsModule {}
