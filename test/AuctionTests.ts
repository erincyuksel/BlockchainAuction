import { deployments, ethers } from "hardhat";
import { assert, expect } from "chai";
import { Auction, ObscurityToken } from "../typechain-types";
import "@nomicfoundation/hardhat-chai-matchers";
import { increase } from "@nomicfoundation/hardhat-network-helpers/dist/src/helpers/time";

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

    it("Fails to create an auction before staking the required amount", async () => {
        await expect(auctionContract.createAuctionItem(1, "testItem", 1000)).to.be.revertedWith(
            "Not enough tokens staked to create an auction"
        );
    });

    it("Successfully creates an auction inside contract", async () => {
        await obscurityToken.approve(auctionContract.address, 500);
        await auctionContract.stakeTokens(500);
        await auctionContract.createAuctionItem(1, "testItem", 1000);
        let item = await auctionContract.getAuctionItem(1);
        expect(item[0].toNumber()).to.equal(1);
        expect(item[1]).to.equal("testItem");
        expect(item[3].toNumber()).to.equal(1000);
    });

    it("User successfully stakes and withdraws his tokens", async () => {
        await obscurityToken.transfer(seller.address, 500);
        await obscurityToken.connect(seller).approve(auctionContract.address, 500);
        await auctionContract.connect(seller).stakeTokens(500);
        let remainingTokens = await obscurityToken.connect(seller).balanceOf(seller.address);
        expect(remainingTokens).to.equal(0);
        await auctionContract.connect(seller).relinquishTokensToOwner();
        remainingTokens = await obscurityToken.connect(seller).balanceOf(seller.address);
        expect(remainingTokens).to.equal(500);
    });

    it("Throws an event when non-existing item is tried to be fetched", async () => {
        await expect(auctionContract.getAuctionItem(1)).to.be.revertedWith("Item does not exist");
    });

    it("Throws an event when placed bid is lower than reserve price", async () => {
        await obscurityToken.transfer(seller.address, 500);
        await obscurityToken.approve(auctionContract.address, 500);
        await auctionContract.stakeTokens(500);
        await auctionContract.createAuctionItem(1, "testItem", 1000);
        await obscurityToken.connect(seller).approve(auctionContract.address, 500);
        await expect(auctionContract.connect(seller).placeBid(1, 500)).to.be.revertedWith(
            "Bid must be higher than the reserve price"
        );
    });

    it("Successfully places a bid on a created Auction", async () => {
        await obscurityToken.transfer(seller.address, 500);
        await obscurityToken.connect(seller).approve(auctionContract.address, 500);
        await auctionContract.connect(seller).stakeTokens(500);
        await auctionContract.connect(seller).createAuctionItem(1, "testItem", 200);
        await obscurityToken.connect(deployer).approve(auctionContract.address, 500);
        await auctionContract.connect(deployer).placeBid(1, 500);
        let auctionItem = await auctionContract.getAuctionItem(1);
        expect(auctionItem[4].toNumber()).to.equal(500);
    });

    it("Successfully refunds the previous highest bidder", async () => {
        // give some of the tokens to buyer from deployer
        await obscurityToken.transfer(buyer.address, 1000);
        await obscurityToken.transfer(seller.address, 1000);
        await obscurityToken.connect(seller).approve(auctionContract.address, 500);
        await auctionContract.connect(seller).stakeTokens(500);
        await auctionContract.connect(seller).createAuctionItem(1, "testItem", 500);
        await obscurityToken.connect(buyer).approve(auctionContract.address, 700);
        await auctionContract.connect(buyer).placeBid(1, 700);
        expect((await obscurityToken.balanceOf(buyer.address)).toNumber()).to.equal(300);
        await obscurityToken.connect(deployer).approve(auctionContract.address, 800);
        await auctionContract.connect(deployer).placeBid(1, 800);

        expect((await obscurityToken.balanceOf(buyer.address)).toNumber()).to.equal(1000);
    });

    it("Successfully finalizes the auction", async () => {
        // give some of the tokens to buyer from deployer
        await obscurityToken.transfer(buyer.address, 1500);
        await obscurityToken.approve(auctionContract.address, 500);
        await auctionContract.stakeTokens(500);
        await auctionContract.createAuctionItem(1, "testItem", 1000);
        await obscurityToken.connect(buyer).approve(auctionContract.address, 1500);
        await auctionContract.connect(buyer).placeBid(1, 1500);
        await increase(60 * 60 * 48); // increase time by 2 days
        await auctionContract.endAuction(1);
        let item = await auctionContract.getAuctionItem(1);
        expect(item[7]).to.be.true;
    });

    it("Denies the auctioneer to relinquish tokens to himself while ongoing auctions persist", async () => {
        await obscurityToken.approve(auctionContract.address, 500);
        await auctionContract.stakeTokens(500);
        await auctionContract.createAuctionItem(1, "testItem", 1000);
        await expect(auctionContract.relinquishTokensToOwner()).to.be.revertedWith(
            "You can't redeem tokens while ongoing auctions persist"
        );
    });
});
