import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../helper-functions";
import { networkConfig, developmentChains } from "../helper-hardhat-config";
import { ethers } from "hardhat";

const deployAuctionContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    // @ts-ignore
    const { getNamedAccounts, deployments, network } = hre;
    const { deploy, log, get } = deployments;
    const { deployer } = await getNamedAccounts();

    log("----------------------------------------------------");
    log("Deploying Auction Contract and waiting for confirmations...");

    const ObscurityToken = await get("ObscurityToken");
    const auctionContract = await deploy("Auction", {
        from: deployer,
        args: [ObscurityToken.address],
        log: true,
        // we need to wait if on a live network so we can verify properly
        waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
    });

    log(`Auction Contract at ${auctionContract.address}`);

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(auctionContract.address, []);
    }

    // we now transfer ownership to timelock, so onlyOwner functions get triggered only by the community : )
    const auction = await ethers.getContract("Auction");
    const timeLock = await ethers.getContract("TimeLock");
    const transferTx = await auction.transferOwnership(timeLock.address);
    await transferTx.wait(1);
};

export default deployAuctionContract;
deployAuctionContract.tags = ["all", "auctionContract"];
