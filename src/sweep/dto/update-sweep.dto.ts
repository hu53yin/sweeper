import { PartialType } from '@nestjs/mapped-types';
import { CreateSweepDto } from './create-sweep.dto';

export class UpdateSweepDto extends PartialType(CreateSweepDto) {}
