import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { FacultyService } from './faculty.service';
import { Faculty } from './entities/faculty.entity';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';

@Controller('faculties')
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @Get()
  async getAllFaculties(): Promise<Faculty[]> {
    return await this.facultyService.findAll();
  }

  @Post()
  async createFaculty(@Body() createFacultyDto: CreateFacultyDto): Promise<Faculty> {
    return await this.facultyService.create(createFacultyDto);
  }

  @Put(':id')
  async updateFaculty(
    @Param('id') id: number,
    @Body() updateFacultyDto: UpdateFacultyDto,
  ): Promise<Faculty> {
    return await this.facultyService.update(id, updateFacultyDto);
  }
}
