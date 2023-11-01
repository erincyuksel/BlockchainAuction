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

        await auctionContract.setPubKey("3C0Bx7xLMBBpM0oONXB9il6T5GHts1b/z6cqsBYfoXM=");
        await auctionContract
            .connect(seller)
            .setPubKey("3C0Bx7xLMBBpM0oONXB9il6T5GHts1b/z6cqsBYfoXM=");
        await auctionContract
            .connect(buyer)
            .setPubKey("3C0Bx7xLMBBpM0oONXB9il6T5GHts1b/z6cqsBYfoXM=");
    });

    it("Fails to create an auction before staking the required amount", async () => {
        await expect(
            auctionContract.createAuctionItem(
                "test",
                "testItem",
                "testDescription",
                new Uint8Array(32),
                1000
            )
        ).to.be.revertedWith("Not enough tokens staked to create an auction");
    });

    it("Fails to create an auction with same ID", async () => {
        await obscurityToken.approve(auctionContract.address, 500);
        await auctionContract.stakeTokens(500);

        await auctionContract.createAuctionItem(
            "test",
            "testItem",
            "testDescription",
            new Uint8Array(32),
            1000
        );
        await expect(
            auctionContract.createAuctionItem(
                "test",
                "testItem",
                "testDescription",
                new Uint8Array(32),
                1000
            )
        ).to.be.revertedWith("Item already exists");
    });

    it("Successfully creates an auction inside contract", async () => {
        await obscurityToken.approve(auctionContract.address, 500);
        await auctionContract.stakeTokens(500);
        await auctionContract.createAuctionItem(
            "test",
            "testItem",
            "testDescription",
            new Uint8Array(32),
            1000
        );
        let item = await auctionContract.getAuctionItem("test");
        expect(item[0]).to.equal("test");
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
        await expect(auctionContract.getAuctionItem("test")).to.be.revertedWith(
            "Item does not exist"
        );
    });

    it("Throws an event when placed bid is lower than reserve price", async () => {
        await obscurityToken.transfer(seller.address, 500);
        await obscurityToken.approve(auctionContract.address, 500);
        await auctionContract.stakeTokens(500);
        await auctionContract.createAuctionItem(
            "test",
            "testItem",
            "testDescription",
            new Uint8Array(32),
            1000
        );
        await obscurityToken.connect(seller).approve(auctionContract.address, 500);
        await expect(auctionContract.connect(seller).placeBid("test", 500)).to.be.revertedWith(
            "Bid must be higher than the reserve price"
        );
    });

    it("Successfully places a bid on a created Auction", async () => {
        await obscurityToken.transfer(seller.address, 500);
        await obscurityToken.connect(seller).approve(auctionContract.address, 500);
        await auctionContract.connect(seller).stakeTokens(500);
        await auctionContract
            .connect(seller)
            .createAuctionItem("test", "testItem", "testDescription", new Uint8Array(32), 200);
        await obscurityToken.connect(deployer).approve(auctionContract.address, 500);
        await auctionContract.connect(deployer).placeBid("test", 500);
        let auctionItem = await auctionContract.getAuctionItem("test");
        expect(auctionItem[4].toNumber()).to.equal(500);
    });

    it("Successfully refunds the previous highest bidder", async () => {
        // give some of the tokens to buyer from deployer
        await obscurityToken.transfer(buyer.address, 1000);
        await obscurityToken.transfer(seller.address, 1000);
        await obscurityToken.connect(seller).approve(auctionContract.address, 500);
        await auctionContract.connect(seller).stakeTokens(500);
        await auctionContract
            .connect(seller)
            .createAuctionItem("test", "testItem", "testDescription", new Uint8Array(32), 500);
        await obscurityToken.connect(buyer).approve(auctionContract.address, 700);
        await auctionContract.connect(buyer).placeBid("test", 700);
        expect((await obscurityToken.balanceOf(buyer.address)).toNumber()).to.equal(300);
        await obscurityToken.connect(deployer).approve(auctionContract.address, 800);
        await auctionContract.connect(deployer).placeBid("test", 800);

        expect((await obscurityToken.balanceOf(buyer.address)).toNumber()).to.equal(1000);
    });

    it("Successfully finalizes the auction", async () => {
        // give some of the tokens to buyer from deployer
        await obscurityToken.transfer(buyer.address, 1500);
        await obscurityToken.approve(auctionContract.address, 500);
        await auctionContract.stakeTokens(500);
        await auctionContract.createAuctionItem(
            "test",
            "testItem",
            "testDescription",
            new Uint8Array(32),
            1000
        );
        await obscurityToken.connect(buyer).approve(auctionContract.address, 1500);
        await auctionContract.connect(buyer).placeBid("test", 1500);
        await increase(60 * 60 * 48); // increase time by 2 days
        await auctionContract.endAuction("test");
        let item = await auctionContract.getAuctionItem("test");
        expect(item[7]).to.be.true;
    });

    it("Denies the auctioneer to relinquish tokens to himself while ongoing auctions persist", async () => {
        await obscurityToken.approve(auctionContract.address, 500);
        await auctionContract.stakeTokens(500);
        await auctionContract.createAuctionItem(
            "test",
            "testItem",
            "testDescription",
            new Uint8Array(32),
            1000
        );
        await expect(auctionContract.relinquishTokensToOwner()).to.be.revertedWith(
            "You can't redeem tokens while ongoing auctions persist"
        );
    });

    it("Successfully allows the auctioneer to withdraw tokens after existing auctions concluded", async () => {
        await obscurityToken.approve(auctionContract.address, 500);
        await auctionContract.stakeTokens(500);
        await auctionContract.createAuctionItem(
            "test",
            "testItem",
            "testDescription",
            new Uint8Array(32),
            1000
        );
        await increase(60 * 60 * 48); // increase time by 2 days
        await auctionContract.endAuction("test");
        await auctionContract.relinquishTokensToOwner();
    });

    it("Successfully extends auction time when last bid is made in last 5 minutes", async () => {
        await obscurityToken.transfer(buyer.address, 1500);
        await obscurityToken.approve(auctionContract.address, 500);
        await auctionContract.stakeTokens(500);
        await auctionContract.createAuctionItem(
            "test",
            "testItem",
            "testDescription",
            new Uint8Array(32),
            1000
        );
        let item = await auctionContract.getAuctionItem("test");
        let originalEndingTime = item[6].toNumber();
        await increase(60 * 60 * 24 - 300); // leave less than 5 minutes until the auction expires
        await obscurityToken.connect(buyer).approve(auctionContract.address, 1100);
        await auctionContract.connect(buyer).placeBid("test", 1100);
        item = await auctionContract.getAuctionItem("test");
        let extendedEndingTime = item[6].toNumber();

        expect(extendedEndingTime - originalEndingTime).to.be.closeTo(
            extendedEndingTime - originalEndingTime,
            500
        );
    });
    it("Successfully fetches all auctions", async () => {
        await obscurityToken.transfer(buyer.address, 1500);
        await obscurityToken.approve(auctionContract.address, 500);
        await auctionContract.stakeTokens(500);
        await auctionContract.createAuctionItem(
            "test1",
            "testItem1",
            "testDescription1",
            new Uint8Array(32),
            1000
        );
        await auctionContract.createAuctionItem(
            "test2",
            "testItem2",
            "testDescription2",
            new Uint8Array(32),
            1000
        );
        let auctions = await auctionContract.getAllAuctions();
        console.log(auctions);
        expect(auctions).to.be.length(2);
    });
});
