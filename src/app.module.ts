import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SweepModule } from './sweep/sweep.module';
import { WalletService } from './wallet/wallet.service';
import { EthGasStationService } from './eth-gas-station/eth-gas-station.service';
import { ProviderService } from './provider/provider.service';
import * as Joi from '@hapi/joi';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        PROVIDER_ALCHEMY_ETHEREUM_SEPOLIA: Joi.string().required(),
        ADMIN_WALLET_SEED: Joi.string().required(),
      }),
    }),
    SweepModule,
  ],
  controllers: [AppController],
  providers: [AppService, EthGasStationService, WalletService, ProviderService],
})
export class AppModule {}
