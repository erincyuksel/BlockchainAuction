import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../helper-functions";
import { networkConfig, developmentChains } from "../helper-hardhat-config";
import { ethers } from "hardhat";

const deployObscurityTokenContract: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
) {
    // @ts-ignore
    const { getNamedAccounts, deployments, network } = hre;
    const { deploy, log } = deployments;
    const { deployer, seller, buyer } = await getNamedAccounts();

    log("----------------------------------------------------");
    log("Deploying Auction Contract and waiting for confirmations...");

    const obscurityTokenContract = await deploy("ObscurityToken", {
        from: deployer,
        args: [],
        log: true,
        // we need to wait if on a live network so we can verify properly
        waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
    });

    log(`Obscurity Token Contract at ${obscurityTokenContract.address}`);

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(obscurityTokenContract.address, []);
    }

    log(`Delegating to ${deployer}`);
    let obscurityToken = await ethers.getContractAt(
        "ObscurityToken",
        obscurityTokenContract.address
    );
    await obscurityToken.transfer(seller, ethers.utils.parseUnits("20000", 18));
    await obscurityToken.transfer(buyer, ethers.utils.parseUnits("20000", 18));
    await delegate(obscurityTokenContract.address, deployer);
    await delegate(obscurityTokenContract.address, seller);
    await delegate(obscurityTokenContract.address, buyer);
    log("Delegated!");
};

const delegate = async (obscurityTokenAddress: string, delegatedAccount: string) => {
    const obscurityToken = await ethers.getContractAt("ObscurityToken", obscurityTokenAddress);
    const transactionResponse = await obscurityToken
        .connect(await ethers.getSigner(delegatedAccount))
        .delegate(delegatedAccount);
    await transactionResponse.wait(1);
    console.log(`Checkpoints: ${await obscurityToken.numCheckpoints(delegatedAccount)}`);
};

export default deployObscurityTokenContract;
deployObscurityTokenContract.tags = ["all", "obscurityTokenContract"];
