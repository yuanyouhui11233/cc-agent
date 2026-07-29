import { Module } from '@nestjs/common';
import { QaChainService } from './qa-chain/qa-chain.service';

@Module({
  providers: [QaChainService]
})
export class ChainsModule {}
