/** @type import('hardhat/config').HardhatUserConfig */
import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy";
import "hardhat-gas-reporter";
import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            allowUnlimitedContractSize: true,
            initialBaseFeePerGas: 0,
        },
        localhost: {
            chainId: 31337,
            allowUnlimitedContractSize: true,
            initialBaseFeePerGas: 0,
        },
    },
    solidity: {
        version: "0.8.19",
        settings: {
            viaIR: true,
            optimizer: {
                enabled: true,
                runs: 300,
            },
        },
    },
    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
            1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
        },
        seller: {
            default: 1,
            1: 1,
        },
        buyer: {
            default: 2,
            1: 2,
        },
    },
    mocha: {
        timeout: 200000, // 200 seconds max for running tests
    },
};

export default config;
