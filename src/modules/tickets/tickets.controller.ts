import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TicketsService } from './tickets.service.js';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../users/enums/user-role.enum.js';
import { ValidateTicketDto } from './dto/validate-ticket.dto.js';

@ApiTags('Tickets')
@ApiBearerAuth()
@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get('my')
  findMyTickets(@Req() req: any) {
    return this.ticketsService.findMyTickets(req.user.id);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.ticketsService.findOne(id, req.user.id);
  }

  @Post('validate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  validate(@Body() dto: ValidateTicketDto) {
    return this.ticketsService.validate(dto.code);
  }
}
