import { deployments, ethers } from "hardhat";
import { assert, expect } from "chai";
import { Auction, ObscurityToken } from "../typechain-types";
import { BigNumber } from "ethers";
import "@nomicfoundation/hardhat-chai-matchers";

describe("Auction Tests", async () => {
    let auctionContract: Auction;
    let obscurityToken: ObscurityToken;
    let deployer, seller, buyer;

    beforeEach(async () => {
        await deployments.fixture(["all"]);
        auctionContract = await ethers.getContract("Auction");
        obscurityToken = await ethers.getContract("ObscurityToken");
        [deployer, seller, buyer] = await ethers.getSigners();
    });

    it("Successfully creates an auction inside contract", async () => {
        let targetTime = Math.floor(new Date().getTime() / 1000);
        await auctionContract.connect(seller).createAuctionItem(1, "testItem", 1000, targetTime);
        let item = await auctionContract.getAuctionItem(1);
        expect(item[0].toNumber()).to.equal(1);
        expect(item[1]).to.equal("testItem");
        expect(item[3].toNumber()).to.equal(1000);
    });

    it("Throws an event when non-existing item is tried to be fetched", async () => {
        await expect(auctionContract.getAuctionItem(1)).to.be.revertedWith("Item does not exist");
    });

    it("Successfully places a bid on a created Auction", async () => {
        let targetTime = Math.floor(new Date().getTime() / 1000);
        await auctionContract.connect(seller).createAuctionItem(1, "testItem", 1000, targetTime);
        await obscurityToken.connect(deployer).approve(auctionContract.address, 500);
        await auctionContract.connect(deployer).placeBid(1, 500);
        let auctionItem = await auctionContract.getAuctionItem(1);
        expect(auctionItem[4].toNumber()).to.equal(500);
    });

    it("Successfully refunds the previous highest bidder", async () => {
        // give some of the tokens to buyer from deployer
        await obscurityToken.transfer(buyer.address, 1000);
        let targetTime = Math.floor(new Date().getTime() / 1000);
        await auctionContract.connect(seller).createAuctionItem(1, "testItem", 1000, targetTime);
        await obscurityToken.connect(buyer).approve(auctionContract.address, 700);
        await auctionContract.connect(buyer).placeBid(1, 700);
        expect((await obscurityToken.balanceOf(buyer.address)).toNumber()).to.equal(300);
        await obscurityToken.connect(deployer).approve(auctionContract.address, 800);
        await auctionContract.connect(deployer).placeBid(1, 800);

        expect((await obscurityToken.balanceOf(buyer.address)).toNumber()).to.equal(1000);
    });
});
