import { Controller, Get, Post, Delete, Body, Param, Patch, Req } from '@nestjs/common';
import { FacultyService } from '../services/faculty.service';
import { Faculty } from '../entities/faculty.entity';
import { CreateFacultyDto } from '../dtos/create-faculty.dto';
import { UpdateFacultyDto } from '../dtos/update-faculty.dto';
import { ApiOperation } from '@nestjs/swagger';
import { CurrentUserToken } from 'src/common/auth/decorators/current-user.decorator';
import { UserPayload } from 'src/common/auth/interfaces';

@Controller('faculties')
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a faculty' })
  async create(@Body() createFacultyDto: CreateFacultyDto): Promise<Faculty> {
    return await this.facultyService.create(createFacultyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all faculties' })
  async findAll(@CurrentUserToken() token: UserPayload): Promise<Faculty[]> {
    console.log('Current User ID:', token.userId);
    console.log('Current User Role Name:', token.rolName);
    return await this.facultyService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a faculty by id' })
  async findOne(@Param('id') id: string): Promise<Faculty | null> {
    return await this.facultyService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a faculty by id' })
  async update(@Param('id') id: string, @Body() updateFacultyDto: UpdateFacultyDto): Promise<Faculty | null> {
    return await this.facultyService.update(id, updateFacultyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a faculty by id' })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.facultyService.remove(id);
  }
}
