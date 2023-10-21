import { deployments, ethers } from "hardhat";
import { assert, expect } from "chai";
import { Auction, ObscurityToken } from "../typechain-types";
import "@nomicfoundation/hardhat-chai-matchers";
import { increase } from "@nomicfoundation/hardhat-network-helpers/dist/src/helpers/time";
import * as sigUtils from "@metamask/eth-sig-util";

describe("Escrow Tests", async () => {
    let auctionContract: Auction;
    let obscurityToken: ObscurityToken;
    let deployer, seller, buyer;
    beforeEach(async () => {
        await deployments.fixture(["all"]);
        auctionContract = await ethers.getContract("Auction");
        obscurityToken = await ethers.getContract("ObscurityToken");
        [deployer, seller, buyer] = await ethers.getSigners();

        await auctionContract.setPubKey(
            sigUtils.getEncryptionPublicKey(
                "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
            )
        );
        await auctionContract
            .connect(seller)
            .setPubKey(
                sigUtils.getEncryptionPublicKey(
                    "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
                )
            );
        await auctionContract
            .connect(buyer)
            .setPubKey(
                sigUtils.getEncryptionPublicKey(
                    "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"
                )
            );
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
        await auctionContract.connect(buyer).setDeliveryAddress(1, "my house");
        await auctionContract.connect(seller).transitionEscrowState(1, 1);
        await auctionContract.connect(seller).transitionEscrowState(1, 2);
        await auctionContract.connect(buyer).transitionEscrowState(1, 3);
    });

    it("After auction, owner and winner should be able to chat", async () => {
        // for test purposes messages are un-encrypted
        await obscurityToken.transfer(seller.address, 500);
        await obscurityToken.connect(seller).approve(auctionContract.address, 500);
        await auctionContract.connect(seller).stakeTokens(500);
        await auctionContract.connect(seller).createAuctionItem(1, "testItem", 1000);

        await obscurityToken.transfer(buyer.address, 1001);
        await obscurityToken.connect(buyer).approve(auctionContract.address, 1001);
        await auctionContract.connect(buyer).placeBid(1, 1001);

        await increase(60 * 60 * 24);
        await auctionContract.connect(seller).endAuction(1);
        await auctionContract.connect(buyer).setDeliveryAddress(1, "my house");
        await auctionContract.connect(seller).transitionEscrowState(1, 1);
        await auctionContract.connect(seller).transitionEscrowState(1, 2);
        await auctionContract.connect(buyer).transitionEscrowState(1, 3);

        await auctionContract.connect(seller).sendChat(1, "Hey!");
        await auctionContract.connect(buyer).sendChat(1, "Hey there as well!");

        let chatLogs = await auctionContract.connect(seller).getChatLogOfItem(1);
        expect(chatLogs[0]).to.eq("Hey!");
        expect(chatLogs[1]).to.eq("Hey there as well!");
    });

    it("Third party users shouldnt be able to use chat of a concluded auction", async () => {
        // for test purposes messages are un-encrypted
        await obscurityToken.transfer(seller.address, 500);
        await obscurityToken.connect(seller).approve(auctionContract.address, 500);
        await auctionContract.connect(seller).stakeTokens(500);
        await auctionContract.connect(seller).createAuctionItem(1, "testItem", 1000);

        await obscurityToken.transfer(buyer.address, 1001);
        await obscurityToken.connect(buyer).approve(auctionContract.address, 1001);
        await auctionContract.connect(buyer).placeBid(1, 1001);

        await increase(60 * 60 * 24);
        await auctionContract.connect(seller).endAuction(1);
        await auctionContract.connect(buyer).setDeliveryAddress(1, "my house");
        await auctionContract.connect(seller).transitionEscrowState(1, 1);
        await auctionContract.connect(seller).transitionEscrowState(1, 2);
        await auctionContract.connect(buyer).transitionEscrowState(1, 3);
        await expect(auctionContract.connect(deployer).sendChat(1, "Hey!")).to.be.revertedWith(
            "Auction has not ended yet, or you are not the winner or owner of the item"
        );
    });
});
