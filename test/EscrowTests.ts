import { deployments, ethers } from "hardhat";
import { assert, expect } from "chai";
import { Auction, ObscurityToken } from "../typechain-types";
import "@nomicfoundation/hardhat-chai-matchers";
import { increase } from "@nomicfoundation/hardhat-network-helpers/dist/src/helpers/time";

describe("Escrow Tests", async () => {
    let auctionContract: Auction;
    let obscurityToken: ObscurityToken;
    let deployer, seller, buyer, member1, member2, member3, outsider;
    beforeEach(async () => {
        await deployments.fixture(["all"]);
        auctionContract = await ethers.getContract("Auction");
        obscurityToken = await ethers.getContract("ObscurityToken");
        [deployer, seller, buyer, member1, member2, member3, outsider] = await ethers.getSigners();

        await auctionContract.setPubKey("3C0Bx7xLMBBpM0oONXB9il6T5GHts1b/z6cqsBYfoXM=");
        await auctionContract
            .connect(seller)
            .setPubKey("3C0Bx7xLMBBpM0oONXB9il6T5GHts1b/z6cqsBYfoXM=");
        await auctionContract
            .connect(buyer)
            .setPubKey("3C0Bx7xLMBBpM0oONXB9il6T5GHts1b/z6cqsBYfoXM=");
    });

    it("Should correctly follow escrow flow", async () => {
        await obscurityToken.transfer(seller.address, BigInt(500 * 10 ** 18));
        await obscurityToken
            .connect(seller)
            .approve(auctionContract.address, BigInt(500 * 10 ** 18));
        await auctionContract.connect(seller).stakeTokens(BigInt(500 * 10 ** 18));
        await auctionContract
            .connect(seller)
            .createAuctionItem("test", "testItem", "testDescription", "", BigInt(1000 * 10 ** 18));

        await obscurityToken.transfer(buyer.address, BigInt(1001 * 10 ** 18));
        await obscurityToken
            .connect(buyer)
            .approve(auctionContract.address, BigInt(1001 * 10 ** 18));
        await auctionContract.connect(buyer).placeBid("test", BigInt(BigInt(1001 * 10 ** 18)));

        await increase(60 * 60 * 24);
        await auctionContract.connect(seller).endAuction("test");
        await auctionContract.connect(buyer).setDeliveryAddress("test", "my house");
        await auctionContract.connect(buyer).transitionEscrowState("test", 1);
        await auctionContract.connect(seller).transitionEscrowState("test", 2);
        await auctionContract.connect(buyer).transitionEscrowState("test", 3);

        let balance = await obscurityToken.connect(seller).balanceOf(seller.address);
        expect(balance).to.equal(BigInt(1001 * 10 ** 18) + BigInt(20000 * 10 ** 18));
    });

    it("After auction, owner and winner should be able to chat", async () => {
        // for test purposes messages are un-encrypted
        await obscurityToken.transfer(seller.address, BigInt(500 * 10 ** 18));
        await obscurityToken
            .connect(seller)
            .approve(auctionContract.address, BigInt(500 * 10 ** 18));
        await auctionContract.connect(seller).stakeTokens(BigInt(500 * 10 ** 18));
        await auctionContract
            .connect(seller)
            .createAuctionItem("test", "testItem", "testDescription", "", BigInt(1000 * 10 ** 18));

        await obscurityToken.transfer(buyer.address, BigInt(1001 * 10 ** 18));
        await obscurityToken
            .connect(buyer)
            .approve(auctionContract.address, BigInt(1001 * 10 ** 18));
        await auctionContract.connect(buyer).placeBid("test", BigInt(1001 * 10 ** 18));

        await increase(60 * 60 * 24);
        await auctionContract.connect(seller).endAuction("test");
        await auctionContract.connect(buyer).setDeliveryAddress("test", "my house");
        await auctionContract.connect(buyer).transitionEscrowState("test", 1);
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
        await obscurityToken.transfer(seller.address, BigInt(500 * 10 ** 18));
        await obscurityToken
            .connect(seller)
            .approve(auctionContract.address, BigInt(500 * 10 ** 18));
        await auctionContract.connect(seller).stakeTokens(BigInt(500 * 10 ** 18));
        await auctionContract
            .connect(seller)
            .createAuctionItem("test", "testItem", "testDescription", "", BigInt(1000 * 10 ** 18));

        await obscurityToken.transfer(buyer.address, BigInt(1001 * 10 ** 18));
        await obscurityToken
            .connect(buyer)
            .approve(auctionContract.address, BigInt(1001 * 10 ** 18));
        await auctionContract.connect(buyer).placeBid("test", BigInt(1001 * 10 ** 18));

        await increase(60 * 60 * 24);
        await auctionContract.connect(seller).endAuction("test");
        await auctionContract.connect(buyer).setDeliveryAddress("test", "my house");
        await auctionContract.connect(buyer).transitionEscrowState("test", 1);
        await auctionContract.connect(seller).transitionEscrowState("test", 2);
        await auctionContract.connect(buyer).transitionEscrowState("test", 3);
        await expect(auctionContract.connect(deployer).sendChat("test", "Hey!")).to.be.revertedWith(
            "Auction has not ended yet, or you are not the winner or owner of the item"
        );
    });

    it("Should fail state transition once dispute is raised", async () => {
        // for test purposes messages are un-encrypted
        await obscurityToken.transfer(seller.address, BigInt(500 * 10 ** 18));
        await obscurityToken
            .connect(seller)
            .approve(auctionContract.address, BigInt(500 * 10 ** 18));
        await auctionContract.connect(seller).stakeTokens(BigInt(500 * 10 ** 18));
        await auctionContract
            .connect(seller)
            .createAuctionItem("test", "testItem", "testDescription", "", BigInt(1000 * 10 ** 18));

        await obscurityToken.transfer(buyer.address, BigInt(1001 * 10 ** 18));
        await obscurityToken
            .connect(buyer)
            .approve(auctionContract.address, BigInt(1001 * 10 ** 18));
        await auctionContract.connect(buyer).placeBid("test", BigInt(1001 * 10 ** 18));

        await increase(60 * 60 * 24);
        await auctionContract.connect(seller).endAuction("test");
        await auctionContract.connect(buyer).setDeliveryAddress("test", "my house");
        await auctionContract.connect(buyer).transitionEscrowState("test", 1);
        await auctionContract.connect(seller).transitionEscrowState("test", 2);
        await auctionContract.connect(seller).raiseDispute("test", 0);
        await expect(
            auctionContract.connect(buyer).transitionEscrowState("test", 3)
        ).to.be.revertedWith("Cant resume escrow processes without dispute resolution");
    });

    it("Should vote in favor of seller in a case of dispute", async () => {
        // for test purposes messages are un-encrypted
        await obscurityToken.transfer(seller.address, BigInt(500 * 10 ** 18));
        await obscurityToken
            .connect(seller)
            .approve(auctionContract.address, BigInt(500 * 10 ** 18));
        await auctionContract.connect(seller).stakeTokens(BigInt(500 * 10 ** 18));
        await auctionContract
            .connect(seller)
            .createAuctionItem("test", "testItem", "testDescription", "", BigInt(1000 * 10 ** 18));

        await obscurityToken.transfer(buyer.address, BigInt(1001 * 10 ** 18));
        await obscurityToken
            .connect(buyer)
            .approve(auctionContract.address, BigInt(1001 * 10 ** 18));
        await auctionContract.connect(buyer).placeBid("test", BigInt(1001 * 10 ** 18));

        await increase(60 * 60 * 24);
        await auctionContract.connect(seller).endAuction("test");
        await auctionContract.connect(buyer).setDeliveryAddress("test", "my house");
        await auctionContract.connect(buyer).transitionEscrowState("test", 1);
        await auctionContract.connect(seller).transitionEscrowState("test", 2);
        await auctionContract.connect(seller).raiseDispute("test", 0);
        await auctionContract.connect(member1).voteOnDispute("test", 0);
        await auctionContract.connect(member2).voteOnDispute("test", 0);
        await auctionContract.connect(member3).voteOnDispute("test", 0);
        await auctionContract.connect(member1).resolveDispute("test");

        let balance = await obscurityToken.connect(seller).balanceOf(seller.address);
        expect(balance).to.equal(BigInt(1001 * 10 ** 18) + BigInt(20000 * 10 ** 18));
    });

    it("Should vote in favor of of buyer in a case of dispute", async () => {
        // for test purposes messages are un-encrypted
        await obscurityToken.transfer(seller.address, BigInt(500 * 10 ** 18));
        await obscurityToken
            .connect(seller)
            .approve(auctionContract.address, BigInt(500 * 10 ** 18));
        await auctionContract.connect(seller).stakeTokens(BigInt(500 * 10 ** 18));
        await auctionContract
            .connect(seller)
            .createAuctionItem("test", "testItem", "testDescription", "", BigInt(1000 * 10 ** 18));

        await obscurityToken.transfer(buyer.address, BigInt(1001 * 10 ** 18));
        await obscurityToken
            .connect(buyer)
            .approve(auctionContract.address, BigInt(1001 * 10 ** 18));
        await auctionContract.connect(buyer).placeBid("test", BigInt(1001 * 10 ** 18));

        await increase(60 * 60 * 24);
        await auctionContract.connect(seller).endAuction("test");
        await auctionContract.connect(buyer).setDeliveryAddress("test", "my house");
        await auctionContract.connect(buyer).transitionEscrowState("test", 1);
        await auctionContract.connect(seller).transitionEscrowState("test", 2);
        await auctionContract.connect(seller).raiseDispute("test", 0);
        await auctionContract.connect(member1).voteOnDispute("test", 1);
        await auctionContract.connect(member2).voteOnDispute("test", 1);
        await auctionContract.connect(member3).voteOnDispute("test", 1);
        await auctionContract.connect(member1).resolveDispute("test");

        let balance = await obscurityToken.connect(buyer).balanceOf(buyer.address);
        expect(balance).to.equal(BigInt(1001 * 10 ** 18) + BigInt(20000 * 10 ** 18));
    });
    it("Should revert when someone outside of the committee tries to send chat", async () => {
        // for test purposes messages are un-encrypted
        await obscurityToken.transfer(seller.address, BigInt(500 * 10 ** 18));
        await obscurityToken
            .connect(seller)
            .approve(auctionContract.address, BigInt(500 * 10 ** 18));
        await auctionContract.connect(seller).stakeTokens(BigInt(500 * 10 ** 18));
        await auctionContract
            .connect(seller)
            .createAuctionItem("test", "testItem", "testDescription", "", BigInt(1000 * 10 ** 18));

        await obscurityToken.transfer(buyer.address, BigInt(1001 * 10 ** 18));
        await obscurityToken
            .connect(buyer)
            .approve(auctionContract.address, BigInt(1001 * 10 ** 18));
        await auctionContract.connect(buyer).placeBid("test", BigInt(1001 * 10 ** 18));

        await increase(60 * 60 * 24);
        await auctionContract.connect(seller).endAuction("test");
        await auctionContract.connect(buyer).setDeliveryAddress("test", "my house");
        await auctionContract.connect(buyer).transitionEscrowState("test", 1);
        await auctionContract.connect(seller).transitionEscrowState("test", 2);
        await auctionContract.connect(seller).raiseDispute("test", 0);
        await expect(
            auctionContract.connect(outsider).sendCommitteeChat("test", "im an outsider!")
        ).to.be.revertedWith("You do not have privileges to chat in this dispute");
    });
    it("Successfully fetches all disputes", async () => {
        // for test purposes messages are un-encrypted
        await obscurityToken.transfer(seller.address, BigInt(500 * 10 ** 18));
        await obscurityToken
            .connect(seller)
            .approve(auctionContract.address, BigInt(500 * 10 ** 18));
        await auctionContract.connect(seller).stakeTokens(BigInt(500 * 10 ** 18));
        await auctionContract
            .connect(seller)
            .createAuctionItem("test", "testItem", "testDescription", "", BigInt(1000 * 10 ** 18));

        await obscurityToken.transfer(buyer.address, BigInt(1001 * 10 ** 18));
        await obscurityToken
            .connect(buyer)
            .approve(auctionContract.address, BigInt(1001 * 10 ** 18));
        await auctionContract.connect(buyer).placeBid("test", BigInt(1001 * 10 ** 18));

        await increase(60 * 60 * 24);
        await auctionContract.connect(seller).endAuction("test");
        await auctionContract.connect(buyer).setDeliveryAddress("test", "my house");
        await auctionContract.connect(buyer).transitionEscrowState("test", 1);
        await auctionContract.connect(seller).transitionEscrowState("test", 2);
        await auctionContract.connect(seller).raiseDispute("test", 0);
        let disputes = await auctionContract.getAllDisputeAuctions();
        expect(disputes).to.be.length(1);
    });
    it("Committee members cannot vote on the same dispute twice", async () => {
        // for test purposes messages are un-encrypted
        await obscurityToken.transfer(seller.address, BigInt(500 * 10 ** 18));
        await obscurityToken
            .connect(seller)
            .approve(auctionContract.address, BigInt(500 * 10 ** 18));
        await auctionContract.connect(seller).stakeTokens(BigInt(500 * 10 ** 18));
        await auctionContract
            .connect(seller)
            .createAuctionItem("test", "testItem", "testDescription", "", BigInt(1000 * 10 ** 18));

        await obscurityToken.transfer(buyer.address, BigInt(1001 * 10 ** 18));
        await obscurityToken
            .connect(buyer)
            .approve(auctionContract.address, BigInt(1001 * 10 ** 18));
        await auctionContract.connect(buyer).placeBid("test", BigInt(1001 * 10 ** 18));

        await increase(60 * 60 * 24);
        await auctionContract.connect(seller).endAuction("test");
        await auctionContract.connect(buyer).setDeliveryAddress("test", "my house");
        await auctionContract.connect(buyer).transitionEscrowState("test", 1);
        await auctionContract.connect(seller).transitionEscrowState("test", 2);
        await auctionContract.connect(seller).raiseDispute("test", 0);
        await auctionContract.connect(member1).voteOnDispute("test", 1);
        await expect(auctionContract.connect(member1).voteOnDispute("test", 1)).to.be.revertedWith(
            "You have already voted on this dispute!"
        );
    });
});
