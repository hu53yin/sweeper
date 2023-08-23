import { Injectable } from '@nestjs/common';
import { hdkey } from 'ethereumjs-wallet';
import * as bip39 from 'bip39';
import { Web3BaseWalletAccount } from 'web3';
import { ProviderService } from '../provider/provider.service';

@Injectable()
export class WalletService {
  wallet: Web3BaseWalletAccount;

  constructor(private providerService: ProviderService) {
    this.setupWeb3Wallet();
  }

  private setupWeb3Wallet() {
    const seed = process.env.ADMIN_WALLET_SEED;

    if (!seed || seed.length === 0) return;

    const seedBuffer = bip39.mnemonicToSeedSync(seed);
    const hdwallet = hdkey.fromMasterSeed(seedBuffer);
    const wallet_hdpath = "m/44'/60'/0'/0/0";
    const wallet = hdwallet.derivePath(wallet_hdpath).getWallet();
    const privateKey = '0x' + wallet.getPrivateKey().toString('hex');

    this.wallet =
      this.providerService.provider.eth.accounts.privateKeyToAccount(
        privateKey,
      );
  }
}
