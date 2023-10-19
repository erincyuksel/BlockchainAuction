import { deployments, ethers } from "hardhat";
import { assert, expect } from "chai";
import { Auction, ObscurityToken } from "../typechain-types";
import "@nomicfoundation/hardhat-chai-matchers";
import { increase } from "@nomicfoundation/hardhat-network-helpers/dist/src/helpers/time";

describe("Escrow Tests", async () => {
    let auctionContract: Auction;
    let obscurityToken: ObscurityToken;
    let deployer, seller, buyer;

    beforeEach(async () => {
        await deployments.fixture(["all"]);
        auctionContract = await ethers.getContract("Auction");
        obscurityToken = await ethers.getContract("ObscurityToken");
        [deployer, seller, buyer] = await ethers.getSigners();
    });

    it("Should correctly follow escrow flow", async () => {
        await obscurityToken.transfer(seller.address, 500);
        await obscurityToken.connect(seller).approve(auctionContract.address, 500);
        await auctionContract.connect(seller).stakeTokens(500);
        await auctionContract.connect(seller).createAuctionItem(1, "testItem", 1000);

        await obscurityToken.transfer(buyer.address, 1001);
        await obscurityToken.connect(buyer).approve(auctionContract.address, 1001);
        await auctionContract.connect(buyer).placeBid(1, 1001);

        await increase(60 * 60 * 24);
        await auctionContract.connect(seller).endAuction(1);
        await auctionContract.connect(seller).transitionEscrowState(1, 1);
        await auctionContract.connect(seller).transitionEscrowState(1, 2);
        await auctionContract.connect(buyer).transitionEscrowState(1, 3);
    });
});
