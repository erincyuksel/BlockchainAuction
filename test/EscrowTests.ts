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

        await auctionContract.setPubKey("3C0Bx7xLMBBpM0oONXB9il6T5GHts1b/z6cqsBYfoXM=");
        await auctionContract
            .connect(seller)
            .setPubKey("3C0Bx7xLMBBpM0oONXB9il6T5GHts1b/z6cqsBYfoXM=");
        await auctionContract
            .connect(buyer)
            .setPubKey("3C0Bx7xLMBBpM0oONXB9il6T5GHts1b/z6cqsBYfoXM=");
    });

    it("Should correctly follow escrow flow", async () => {
        await obscurityToken.transfer(seller.address, 500);
        await obscurityToken.connect(seller).approve(auctionContract.address, 500);
        await auctionContract.connect(seller).stakeTokens(500);
        await auctionContract.connect(seller).createAuctionItem("test", "testItem", 1000);

        await obscurityToken.transfer(buyer.address, 1001);
        await obscurityToken.connect(buyer).approve(auctionContract.address, 1001);
        await auctionContract.connect(buyer).placeBid("test", 1001);

        await increase(60 * 60 * 24);
        await auctionContract.connect(seller).endAuction("test");
        await auctionContract.connect(buyer).setDeliveryAddress("test", "my house");
        await auctionContract.connect(seller).transitionEscrowState("test", 1);
        await auctionContract.connect(seller).transitionEscrowState("test", 2);
        await auctionContract.connect(buyer).transitionEscrowState("test", 3);
    });

    it("After auction, owner and winner should be able to chat", async () => {
        // for test purposes messages are un-encrypted
        await obscurityToken.transfer(seller.address, 500);
        await obscurityToken.connect(seller).approve(auctionContract.address, 500);
        await auctionContract.connect(seller).stakeTokens(500);
        await auctionContract.connect(seller).createAuctionItem("test", "testItem", 1000);

        await obscurityToken.transfer(buyer.address, 1001);
        await obscurityToken.connect(buyer).approve(auctionContract.address, 1001);
        await auctionContract.connect(buyer).placeBid("test", 1001);

        await increase(60 * 60 * 24);
        await auctionContract.connect(seller).endAuction("test");
        await auctionContract.connect(buyer).setDeliveryAddress("test", "my house");
        await auctionContract.connect(seller).transitionEscrowState("test", 1);
        await auctionContract.connect(seller).transitionEscrowState("test", 2);
        await auctionContract.connect(buyer).transitionEscrowState("test", 3);

        await auctionContract.connect(seller).sendChat("test", "Hey!");
        await auctionContract.connect(buyer).sendChat("test", "Hey there as well!");

        let chatLogs = await auctionContract.connect(seller).getChatLogOfItem("test");
        expect(chatLogs[0]).to.eq("Hey!");
        expect(chatLogs[1]).to.eq("Hey there as well!");
    });

    it("Third party users shouldnt be able to use chat of a concluded auction", async () => {
        // for test purposes messages are un-encrypted
        await obscurityToken.transfer(seller.address, 500);
        await obscurityToken.connect(seller).approve(auctionContract.address, 500);
        await auctionContract.connect(seller).stakeTokens(500);
        await auctionContract.connect(seller).createAuctionItem("test", "testItem", 1000);

        await obscurityToken.transfer(buyer.address, 1001);
        await obscurityToken.connect(buyer).approve(auctionContract.address, 1001);
        await auctionContract.connect(buyer).placeBid("test", 1001);

        await increase(60 * 60 * 24);
        await auctionContract.connect(seller).endAuction("test");
        await auctionContract.connect(buyer).setDeliveryAddress("test", "my house");
        await auctionContract.connect(seller).transitionEscrowState("test", 1);
        await auctionContract.connect(seller).transitionEscrowState("test", 2);
        await auctionContract.connect(buyer).transitionEscrowState("test", 3);
        await expect(auctionContract.connect(deployer).sendChat("test", "Hey!")).to.be.revertedWith(
            "Auction has not ended yet, or you are not the winner or owner of the item"
        );
    });

    it("Should fail state transition once dispute is raised", async () => {
        // for test purposes messages are un-encrypted
        await obscurityToken.transfer(seller.address, 500);
        await obscurityToken.connect(seller).approve(auctionContract.address, 500);
        await auctionContract.connect(seller).stakeTokens(500);
        await auctionContract.connect(seller).createAuctionItem("test", "testItem", 1000);

        await obscurityToken.transfer(buyer.address, 1001);
        await obscurityToken.connect(buyer).approve(auctionContract.address, 1001);
        await auctionContract.connect(buyer).placeBid("test", 1001);

        await increase(60 * 60 * 24);
        await auctionContract.connect(seller).endAuction("test");
        await auctionContract.connect(buyer).setDeliveryAddress("test", "my house");
        await auctionContract.connect(seller).transitionEscrowState("test", 1);
        await auctionContract.connect(seller).transitionEscrowState("test", 2);
        await auctionContract.connect(seller).raiseDispute("test");
        await expect(
            auctionContract.connect(buyer).transitionEscrowState("test", 3)
        ).to.be.revertedWith("Cant resume escrow processes without dispute resolution");
    });
});
