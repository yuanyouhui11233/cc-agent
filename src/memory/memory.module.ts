import { Module } from '@nestjs/common';
import { BufferMemoryService } from './buffer-memory/buffer-memory.service';

@Module({
  providers: [BufferMemoryService]
})
export class MemoryModule {}
