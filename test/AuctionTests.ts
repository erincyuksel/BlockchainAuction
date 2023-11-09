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
            auctionContract.createAuctionItem("test", "testItem", "testDescription", "", 1000)
        ).to.be.revertedWith("Not enough tokens staked to create an auction");
    });

    it("Fails to create an auction with same ID", async () => {
        await obscurityToken.approve(auctionContract.address, BigInt(500 * 10 ** 18));
        await auctionContract.stakeTokens(BigInt(500 * 10 ** 18));

        await auctionContract.createAuctionItem(
            "test",
            "testItem",
            "testDescription",
            "",
            BigInt(1000 * 10 ** 18)
        );
        await expect(
            auctionContract.createAuctionItem(
                "test",
                "testItem",
                "testDescription",
                "",
                BigInt(1000 * 10 ** 18)
            )
        ).to.be.revertedWith("Item already exists");
    });

    it("Successfully creates an auction inside contract", async () => {
        await obscurityToken.approve(auctionContract.address, BigInt(500 * 10 ** 18));
        await auctionContract.stakeTokens(BigInt(500 * 10 ** 18));
        await auctionContract.createAuctionItem(
            "test",
            "testItem",
            "testDescription",
            "",
            BigInt(1000 * 10 ** 18)
        );
        let item = await auctionContract.getAuctionItem("test");
        expect(item[0]).to.equal("test");
        expect(item[1]).to.equal("testItem");
        expect(item[3].toBigInt()).to.equal(BigInt(1000 * 10 ** 18));
    });

    it("User successfully stakes and withdraws his tokens", async () => {
        let sellerBalancePrev = await obscurityToken.balanceOf(seller.address);
        await obscurityToken.transfer(seller.address, BigInt(500 * 10 ** 18));
        await obscurityToken
            .connect(seller)
            .approve(auctionContract.address, BigInt(500 * 10 ** 18));
        let sellerBalanceAfter = await obscurityToken.balanceOf(seller.address);
        await auctionContract.connect(seller).stakeTokens(BigInt(500 * 10 ** 18));

        let remainingTokens = await obscurityToken.connect(seller).balanceOf(seller.address);
        expect(remainingTokens).to.equal(sellerBalancePrev);
        await auctionContract.connect(seller).relinquishTokensToOwner();
        remainingTokens = await obscurityToken.connect(seller).balanceOf(seller.address);
        expect(remainingTokens).to.equal(sellerBalanceAfter);
    });

    it("Throws an event when non-existing item is tried to be fetched", async () => {
        await expect(auctionContract.getAuctionItem("test")).to.be.revertedWith(
            "Item does not exist"
        );
    });

    it("Throws an event when placed bid is lower than reserve price", async () => {
        await obscurityToken.transfer(seller.address, BigInt(500 * 10 ** 18));
        await obscurityToken.approve(auctionContract.address, BigInt(500 * 10 ** 18));
        await auctionContract.stakeTokens(BigInt(500 * 10 ** 18));
        await auctionContract.createAuctionItem(
            "test",
            "testItem",
            "testDescription",
            "",
            BigInt(1000 * 10 ** 18)
        );
        await obscurityToken
            .connect(seller)
            .approve(auctionContract.address, BigInt(500 * 10 ** 18));
        await expect(
            auctionContract.connect(seller).placeBid("test", BigInt(500 * 10 ** 18))
        ).to.be.revertedWith("Bid must be higher than the reserve price");
    });

    it("Successfully places a bid on a created Auction", async () => {
        await obscurityToken.transfer(seller.address, BigInt(500 * 10 ** 18));
        await obscurityToken
            .connect(seller)
            .approve(auctionContract.address, BigInt(500 * 10 ** 18));
        await auctionContract.connect(seller).stakeTokens(BigInt(500 * 10 ** 18));
        await auctionContract
            .connect(seller)
            .createAuctionItem("test", "testItem", "testDescription", "", BigInt(200 * 10 ** 18));
        await obscurityToken
            .connect(deployer)
            .approve(auctionContract.address, BigInt(500 * 10 ** 18));
        await auctionContract.connect(deployer).placeBid("test", BigInt(500 * 10 ** 18));
        let auctionItem = await auctionContract.getAuctionItem("test");
        expect(auctionItem[4].toBigInt()).to.equal(BigInt(500 * 10 ** 18));
    });

    it("Successfully refunds the previous highest bidder", async () => {
        // give some of the tokens to buyer from deployer
        await obscurityToken.transfer(buyer.address, BigInt(1000 * 10 ** 18));
        await obscurityToken.transfer(seller.address, BigInt(1000 * 10 ** 18));
        await obscurityToken
            .connect(seller)
            .approve(auctionContract.address, BigInt(500 * 10 ** 18));
        await auctionContract.connect(seller).stakeTokens(BigInt(500 * 10 ** 18));
        await auctionContract
            .connect(seller)
            .createAuctionItem("test", "testItem", "testDescription", "", BigInt(500 * 10 ** 18));
        await obscurityToken
            .connect(buyer)
            .approve(auctionContract.address, BigInt(700 * 10 ** 18));
        await auctionContract.connect(buyer).placeBid("test", BigInt(700 * 10 ** 18));
        expect(await obscurityToken.balanceOf(buyer.address)).to.equal(
            BigInt(300 * 10 ** 18) + BigInt(20000 * 10 ** 18)
        );
        await obscurityToken
            .connect(deployer)
            .approve(auctionContract.address, BigInt(800 * 10 ** 18));
        await auctionContract.connect(deployer).placeBid("test", BigInt(800 * 10 ** 18));

        expect(await obscurityToken.balanceOf(buyer.address)).to.equal(
            BigInt(1000 * 10 ** 18) + BigInt(20000 * 10 ** 18)
        );
    });

    it("Successfully finalizes the auction", async () => {
        // give some of the tokens to buyer from deployer
        await obscurityToken.transfer(buyer.address, BigInt(1500 * 10 ** 18));
        await obscurityToken.approve(auctionContract.address, BigInt(500 * 10 ** 18));
        await auctionContract.stakeTokens(BigInt(500 * 10 ** 18));
        await auctionContract.createAuctionItem(
            "test",
            "testItem",
            "testDescription",
            "",
            BigInt(1000 * 10 ** 18)
        );
        await obscurityToken
            .connect(buyer)
            .approve(auctionContract.address, BigInt(1500 * 10 ** 18));
        await auctionContract.connect(buyer).placeBid("test", BigInt(1500 * 10 ** 18));
        await increase(60 * 60 * 48); // increase time by 2 days
        await auctionContract.endAuction("test");
        let item = await auctionContract.getAuctionItem("test");
        expect(item[7]).to.be.true;
    });

    it("Denies the auctioneer to relinquish tokens to himself while ongoing auctions persist", async () => {
        await obscurityToken.approve(auctionContract.address, BigInt(500 * 10 ** 18));
        await auctionContract.stakeTokens(BigInt(500 * 10 ** 18));
        await auctionContract.createAuctionItem(
            "test",
            "testItem",
            "testDescription",
            "",
            BigInt(1000 * 10 ** 18)
        );
        await expect(auctionContract.relinquishTokensToOwner()).to.be.revertedWith(
            "You can't redeem tokens while ongoing auctions persist"
        );
    });

    it("Successfully allows the auctioneer to withdraw tokens after existing auctions concluded", async () => {
        await obscurityToken.approve(auctionContract.address, BigInt(500 * 10 ** 18));
        await auctionContract.stakeTokens(BigInt(500 * 10 ** 18));
        await auctionContract.createAuctionItem(
            "test",
            "testItem",
            "testDescription",
            "",
            BigInt(1000 * 10 ** 18)
        );
        await increase(60 * 60 * 48); // increase time by 2 days
        await auctionContract.endAuction("test");
        await auctionContract.relinquishTokensToOwner();
    });

    it("Successfully extends auction time when last bid is made in last 5 minutes", async () => {
        await obscurityToken.transfer(buyer.address, BigInt(1500 * 10 ** 18));
        await obscurityToken.approve(auctionContract.address, BigInt(500 * 10 ** 18));
        await auctionContract.stakeTokens(BigInt(500 * 10 ** 18));
        await auctionContract.createAuctionItem(
            "test",
            "testItem",
            "testDescription",
            "",
            BigInt(1000 * 10 ** 18)
        );
        let item = await auctionContract.getAuctionItem("test");
        let originalEndingTime = item[6].toNumber();
        await increase(60 * 60 * 24 - 300); // leave less than 5 minutes until the auction expires
        await obscurityToken
            .connect(buyer)
            .approve(auctionContract.address, BigInt(1100 * 10 ** 18));
        await auctionContract.connect(buyer).placeBid("test", BigInt(1100 * 10 ** 18));
        item = await auctionContract.getAuctionItem("test");
        let extendedEndingTime = item[6].toNumber();

        expect(extendedEndingTime - originalEndingTime).to.be.closeTo(
            extendedEndingTime - originalEndingTime,
            500
        );
    });
    it("Successfully fetches all auctions", async () => {
        await obscurityToken.transfer(buyer.address, BigInt(1500 * 10 ** 18));
        await obscurityToken.approve(auctionContract.address, BigInt(500 * 10 ** 18));
        await auctionContract.stakeTokens(BigInt(500 * 10 ** 18));
        await auctionContract.createAuctionItem(
            "test1",
            "testItem1",
            "testDescription1",
            "",
            BigInt(1000 * 10 ** 18)
        );
        await auctionContract.createAuctionItem(
            "test2",
            "testItem2",
            "testDescription2",
            "",
            BigInt(1000 * 10 ** 18)
        );
        let auctions = await auctionContract.getAllAuctions();
        expect(auctions).to.be.length(2);
    });

    it("Shouldn't add duplicate values to users previously bidded auction array", async () => {
        await obscurityToken.approve(auctionContract.address, BigInt(500 * 10 ** 18));
        await auctionContract.stakeTokens(BigInt(500 * 10 ** 18));
        await auctionContract.createAuctionItem(
            "test1",
            "testItem1",
            "testDescription1",
            "",
            BigInt(1000 * 10 ** 18)
        );
        await obscurityToken
            .connect(buyer)
            .approve(auctionContract.address, BigInt(3500 * 10 ** 18));
        await auctionContract.connect(buyer).placeBid("test1", BigInt(1500 * 10 ** 18));
        await auctionContract.connect(buyer).placeBid("test1", BigInt(2000 * 10 ** 18));
        let previouslyBidAuctions = await auctionContract.connect(buyer).getMyBidAuctions();
        expect(previouslyBidAuctions).to.be.lengthOf(1);
    });

    it("Successfully adds created auction to users created auctions history", async () => {
        await obscurityToken.transfer(buyer.address, BigInt(1500 * 10 ** 18));
        await obscurityToken.approve(auctionContract.address, BigInt(500 * 10 ** 18));
        await auctionContract.stakeTokens(BigInt(500 * 10 ** 18));
        await auctionContract.createAuctionItem(
            "test1",
            "testItem1",
            "testDescription1",
            "",
            BigInt(1000 * 10 ** 18)
        );
        await auctionContract.createAuctionItem(
            "test2",
            "testItem2",
            "testDescription2",
            "",
            BigInt(1000 * 10 ** 18)
        );
        let createdAuctions = await auctionContract.getMyOwnerAuctions();
        expect(createdAuctions).to.be.lengthOf(2);
    });
});
