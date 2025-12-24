import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Headers, Query } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation, ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { SliderService } from './slider.service';
import { CreateSliderDto } from './dto/create-slider.dto';
import { UpdateSliderDto } from './dto/update-slider.dto';
import { JwtAuthGuard } from '../_common/guards/jwt-auth.guard';
import { Roles } from '../_common/decorators/roles.decorator';
import { RolesGuard } from '../_common/guards/roles.guard';

@ApiTags('Slider')
@Controller('slider')
export class SliderController {
  constructor(private readonly sliderService: SliderService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create slider' })
  @ApiBody({ type: CreateSliderDto })
  @ApiResponse({ status: 201, description: 'Slider created' })
  create(@Body() dto: CreateSliderDto) {
    return this.sliderService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sliders' })
  @ApiQuery({ name: 'allLanguages', required: false, type: Boolean, description: 'Admin üçün bütün dillər' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiResponse({ status: 200, description: 'List of sliders' })
  findAll(
    @Query('allLanguages') allLanguages?: boolean,
    @Query('isActive') isActive?: string,
    @Headers('accept-language') acceptLanguage?: string
  ) {
    if (allLanguages) {
      return this.sliderService.findAllForAdmin();
    }
    const isActiveBool = isActive !== undefined ? isActive === 'true' : undefined;
    return this.sliderService.findAll(acceptLanguage, isActiveBool);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get slider by id' })
  @ApiQuery({ name: 'allLanguages', required: false, type: Boolean, description: 'Admin üçün bütün dillər' })
  @ApiResponse({ status: 200, description: 'Slider detail' })
  findOne(
    @Param('id') id: number,
    @Query('allLanguages') allLanguages?: boolean,
    @Headers('accept-language') acceptLanguage?: string
  ) {
    if (allLanguages) {
      return this.sliderService.findOneForAdmin(id);
    }
    return this.sliderService.findOne(id, acceptLanguage);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update slider' })
  @ApiBody({ type: UpdateSliderDto })
  @ApiResponse({ status: 200, description: 'Slider updated' })
  update(@Param('id') id: number, @Body() dto: UpdateSliderDto) {
    if (typeof dto.title === 'string') dto.title = JSON.parse(dto.title);
    if (typeof dto.subtitle === 'string') dto.subtitle = JSON.parse(dto.subtitle);
    return this.sliderService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete slider' })
  @ApiResponse({ status: 200, description: 'Slider deleted' })
  remove(@Param('id') id: number) {
    return this.sliderService.remove(id);
  }
}

