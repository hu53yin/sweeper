import {
  Controller,
  Post,
  Body,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SweepService } from './sweep.service';
import { SweepTokensDto } from './dto/sweep-tokens.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('sweep')
export class SweepController {
  constructor(private readonly sweepService: SweepService) {}

  @Post()
  @ApiOperation({
    summary: 'Sweep Transactions',
    description: 'Sweep Transactions',
  })
  @ApiResponse({
    status: 200,
    description: 'Sweep completed',
    type: String,
  })
  @ApiResponse({
    status: 503,
    description: 'Server Error',
    type: HttpException,
  })
  async sweepTokens(@Body() sweepTokensDto: SweepTokensDto) {
    try {
      return this.sweepService.sweepTokens(sweepTokensDto);
    } catch (error) {
      console.error(error.message, 'HTTP');

      throw new InternalServerErrorException({
        message: error.message,
        code: 'SWEEP_ERROR',
      });
    }
  }
}
