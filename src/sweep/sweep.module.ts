import { Module } from '@nestjs/common';
import { SweepService } from './sweep.service';
import { SweepController } from './sweep.controller';
import { HttpModule } from '@nestjs/axios';
import { EthGasStationService } from '../eth-gas-station/eth-gas-station.service';
import { WalletService } from '../wallet/wallet.service';
import { ProviderService } from '../provider/provider.service';

@Module({
  controllers: [SweepController],
  imports: [HttpModule],
  providers: [
    SweepService,
    EthGasStationService,
    WalletService,
    ProviderService,
  ],
})
export class SweepModule {}
