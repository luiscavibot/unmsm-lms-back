import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { BlockService } from '../services/block.service';
import { Block } from '../entities/block.entity';
import { CreateBlockDto } from '../dtos/create-block.dto';
import { UpdateBlockDto } from '../dtos/update-block.dto';

@Controller('blocks')
export class BlockController {
  constructor(private readonly blockService: BlockService) {}

  @Get()
  async findAll(
    @Query('courseOfferingId') courseOfferingId?: string,
  ): Promise<Block[]> {
    if (courseOfferingId) {
      return this.blockService.findByCourseOfferingId(courseOfferingId);
    }
    return this.blockService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Block> {
    return this.blockService.findById(id);
  }

  @Post()
  async create(@Body() createBlockDto: CreateBlockDto): Promise<Block> {
    return this.blockService.create(createBlockDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBlockDto: UpdateBlockDto,
  ): Promise<Block> {
    return this.blockService.update(id, updateBlockDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.blockService.delete(id);
  }
}