import { Injectable } from '@nestjs/common';
import { EthGasStationService } from '../eth-gas-station/eth-gas-station.service';
import { ProviderService } from '../provider/provider.service';
import { WalletService } from '../wallet/wallet.service';
import { Transaction } from 'web3';
import { SweepTokensDto } from './dto/sweep-tokens.dto';

@Injectable()
export class SweepService {
  constructor(
    private gasPriceProvider: EthGasStationService,
    private walletService: WalletService,
    private providerService: ProviderService,
  ) {}

  async sweepTokens(sweepTokensDto: SweepTokensDto) {
    const gasPrice = await this.gasPriceProvider.getGasPrice();
    const gasPriceFromNetwork = await this.providerService.getGasPrice();

    for (const depositAddr of sweepTokensDto.depositAddresses) {
      await this.sweepEth(
        depositAddr,
        sweepTokensDto.destinationAddress,
        gasPrice,
        gasPriceFromNetwork,
      );

      await this.sweepERC20Tokens(
        depositAddr,
        sweepTokensDto.erc20Addresses,
        sweepTokensDto.destinationAddress,
        gasPrice,
        gasPriceFromNetwork,
      );
    }
  }

  private async sweepEth(
    depositAddr: string,
    destinationAddress: string,
    gasPrice: bigint,
    gasPriceFromNetwork: bigint,
  ) {
    try {
      const balance = await this.providerService.getBalance(depositAddr);

      if (balance > 0n) {
        const effectiveGasPrice = this.decideGasPrice(
          gasPrice,
          gasPriceFromNetwork,
        );

        const maxGasAmount = BigInt(21000);
        const estimatedTransactionFee = maxGasAmount * effectiveGasPrice;

        const nonce =
          await this.providerService.provider.eth.getTransactionCount(
            depositAddr,
            'pending',
          );

        const txParams: Transaction = {
          nonce,
          from: depositAddr,
          to: destinationAddress,
          gasPrice: effectiveGasPrice.toString(),
          value: (balance - estimatedTransactionFee).toString(),
        };

        const gasEstimate =
          await this.providerService.provider.eth.estimateGas(txParams);
        const totalFee = gasEstimate * effectiveGasPrice;

        txParams.value = (balance - totalFee).toString();
        txParams.gas = gasEstimate.toString();

        if (BigInt(txParams.value) > 0n) {
          await this.signAndSend(txParams);
        }
      }
    } catch (error) {
      console.error('Error in sweepEth: ', error);
    }
  }

  private async sweepERC20Tokens(
    depositAddr: string,
    erc20Addresses: string[],
    destinationAddress: string,
    gasPrice: bigint,
    gasPriceFromNetwork: bigint,
  ) {
    let currentNonce =
      await this.providerService.provider.eth.getTransactionCount(depositAddr);

    for (const tokenAddr of erc20Addresses) {
      try {
        const tokenContract = this.providerService.getTokenContract(tokenAddr);
        const tokenBalance = await (tokenContract.methods as any)
          ['balanceOf'](depositAddr)
          .call();

        if (tokenBalance > 0) {
          const data = (tokenContract.methods as any)
            ['transfer'](destinationAddress, tokenBalance)
            .encodeABI();

          const txParams: Transaction = {
            from: depositAddr,
            to: tokenAddr,
            data: data,
            nonce: currentNonce,
            gasPrice: this.decideGasPrice(gasPrice, gasPriceFromNetwork),
          };

          const gas =
            await this.providerService.provider.eth.estimateGas(txParams);
          txParams.gas = gas;

          await this.signAndSend(txParams);
          currentNonce++;
        }
      } catch (error) {
        console.error(
          `Error in sweepERC20Tokens for token ${tokenAddr}: `,
          error,
        );
      }
    }
  }

  private async signAndSend(txParams: Transaction) {
    try {
      let retryCount = 3;

      while (retryCount > 0) {
        try {
          const signedTx =
            await this.walletService.wallet.signTransaction(txParams);

          await this.providerService.provider.eth.sendSignedTransaction(
            signedTx.rawTransaction,
          );
          break;
        } catch (error) {
          if (error.message.includes('nonce too low')) {
            txParams.nonce = BigInt(txParams.nonce) + 1n;
            retryCount--;
          } else {
            throw error;
          }
        }
      }
    } catch (error) {
      console.error('Error in signAndSend: ', error);
    }
  }

  private decideGasPrice(
    gasPrice: bigint,
    gasPriceFromNetwork: bigint,
  ): bigint {
    return gasPrice > gasPriceFromNetwork ? gasPrice : gasPriceFromNetwork;
  }
}
