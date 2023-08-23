import { ApiProperty } from '@nestjs/swagger';

export class SweepTokensDto {
  @ApiProperty({
    isArray: true,
    uniqueItems: true,
    type: [String],
    required: true,
    description: 'Deposit addresses',
    minLength: 1,
    maxLength: 50,
  })
  public depositAddresses: string[];

  @ApiProperty({
    isArray: true,
    uniqueItems: true,
    type: [String],
    required: true,
    description: 'ERC20 addresses',
    minLength: 1,
    maxLength: 50,
  })
  public erc20Addresses: string[];

  @ApiProperty({
    required: true,
    type: 'string',
    description: 'Destination address',
  })
  public destinationAddress: string;
}
