import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PaymentsService } from './payments.service.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { QueryPaymentDto } from './dto/query-payment.dto.js';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { UserRole } from '../users/enums/user-role.enum.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(@Req() req: any, @Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(req.user.id, createPaymentDto);
  }

  @Get()
  findAllByUser(@Req() req: any, @Query() query: QueryPaymentDto) {
    return this.paymentsService.findAllByUser(req.user.id, query);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsService.findOne(id, req.user.id);
  }

  // Admin: Confirm (manual payment)
  @Patch(':id/confirm')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  confirm(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsService.confirm(id);
  }

  @Patch(':id/fail')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  fail(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsService.fail(id);
  }
}
