import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ProductEventsService } from './product-events.service.js';
import { CreateProductEventDto } from './dto/create-product-event.dto.js';
import { UpdateProductEventDto } from './dto/update-product-event.dto.js';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/enums/user-role.enum.js';

@Controller('product-events')
export class ProductEventsController {
  constructor(private readonly productEventsService: ProductEventsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() createProductEventDto: CreateProductEventDto) {
    return this.productEventsService.create(createProductEventDto);
  }

  @Get()
  findAll() {
    return this.productEventsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productEventsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateProductEventDto: UpdateProductEventDto,
  ) {
    return this.productEventsService.update(id, updateProductEventDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.productEventsService.remove(id);
  }
}
