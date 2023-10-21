import { deployments, ethers } from "hardhat";
import { assert, expect } from "chai";
import { Auction, ObscurityToken, TimeLock, GovernorContract } from "../typechain-types";
import "@nomicfoundation/hardhat-chai-matchers";
import { VOTING_DELAY, VOTING_PERIOD, MIN_DELAY } from "../helper-hardhat-config";
import { mine } from "@nomicfoundation/hardhat-network-helpers";
import { increase } from "@nomicfoundation/hardhat-network-helpers/dist/src/helpers/time";
import * as sigUtils from "@metamask/eth-sig-util";

describe("Governor Voting Tests", async () => {
    let governor: GovernorContract;
    let obscurityToken: ObscurityToken;
    let timeLock: TimeLock;
    let auction: Auction;
    let deployer, seller, buyer;

    beforeEach(async () => {
        await deployments.fixture(["all"]);
        governor = await ethers.getContract("GovernorContract");
        timeLock = await ethers.getContract("TimeLock");
        obscurityToken = await ethers.getContract("ObscurityToken");
        auction = await ethers.getContract("Auction");

        [deployer, seller, buyer] = await ethers.getSigners();

        await auction.setPubKey(
            sigUtils.getEncryptionPublicKey(
                "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
            )
        );
        await auction
            .connect(seller)
            .setPubKey(
                sigUtils.getEncryptionPublicKey(
                    "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
                )
            );
        await auction
            .connect(buyer)
            .setPubKey(
                sigUtils.getEncryptionPublicKey(
                    "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"
                )
            );
    });

    it("Auction duration can only be changed through governance", async () => {
        await expect(auction.setAuctionDuration(60 * 60 * 48)).to.be.revertedWith(
            "Ownable: caller is not the owner"
        );
    });

    it("Concurrent auctions can only be changed through governance", async () => {
        await expect(auction.setConcurrentAuctionsPerUser(5)).to.be.revertedWith(
            "Ownable: caller is not the owner"
        );
    });

    it("Tokens to stake can only be changed through governance", async () => {
        await expect(auction.setTokensToStake(2000)).to.be.revertedWith(
            "Ownable: caller is not the owner"
        );
    });

    it("Tokens to stake is changed after voting process", async () => {
        const encodedFunctionCall = auction.interface.encodeFunctionData("setTokensToStake", [
            1000,
        ]);

        // propose
        const proposalId = await propose(
            encodedFunctionCall,
            "We should increase the tokens to stake to 1000!"
        );
        let proposalState = await governor.state(proposalId);
        console.log(`Current Proposal State: ${proposalState}`);
        await mine(VOTING_DELAY + 1);

        // vote
        await vote(proposalId, "Yeah lets increase it!", 1);
        proposalState = await governor.state(proposalId);
        assert.equal(proposalState.toString(), "1");
        console.log(`Current Proposal State: ${proposalState}`);
        await mine(VOTING_PERIOD + 1);

        // queue
        await queue(encodedFunctionCall, "We should increase the tokens to stake to 1000!");
        await increase(MIN_DELAY);
        proposalState = await governor.state(proposalId);
        console.log(`Current Proposal State: ${proposalState}`);

        // execute
        console.log("Executing...");
        await execute(encodedFunctionCall, "We should increase the tokens to stake to 1000!");
        const tokensToStake = await auction.getTokensToStake();
        expect(tokensToStake.toNumber()).to.equal(1000);

        // try to create auction with old stake amount and fail

        await obscurityToken.approve(auction.address, 500);
        await auction.stakeTokens(500);
        await expect(auction.createAuctionItem(1, "testItem", 1000)).to.be.revertedWith(
            "Not enough tokens staked to create an auction"
        );
    });

    it("Concurrent active auctions is changed after voting process", async () => {
        const encodedFunctionCall = auction.interface.encodeFunctionData(
            "setConcurrentAuctionsPerUser",
            [3]
        );

        // propose
        const proposalId = await propose(
            encodedFunctionCall,
            "We should increase the active auctions to 3!"
        );
        let proposalState = await governor.state(proposalId);
        console.log(`Current Proposal State: ${proposalState}`);
        await mine(VOTING_DELAY + 1);

        // vote
        await vote(proposalId, "Yeah lets increase it!", 1);
        proposalState = await governor.state(proposalId);
        assert.equal(proposalState.toString(), "1");
        console.log(`Current Proposal State: ${proposalState}`);
        await mine(VOTING_PERIOD + 1);

        // queue
        await queue(encodedFunctionCall, "We should increase the active auctions to 3!");
        await increase(MIN_DELAY);
        proposalState = await governor.state(proposalId);
        console.log(`Current Proposal State: ${proposalState}`);

        // execute
        console.log("Executing...");
        await execute(encodedFunctionCall, "We should increase the active auctions to 3!");

        // try to create 3 ongoing auctions

        await obscurityToken.approve(auction.address, 500);
        await auction.stakeTokens(500);
        await auction.createAuctionItem(1, "testItem1", 1000);
        await auction.createAuctionItem(2, "testItem2", 1000);
        await auction.createAuctionItem(3, "testItem3", 1000);

        // 4th one should fail
        await expect(auction.createAuctionItem(4, "testItem4", 1000)).to.be.revertedWith(
            "You can't have any more active auctions"
        );
    });

    it("Auction duration is changed after voting process", async () => {
        const encodedFunctionCall = auction.interface.encodeFunctionData("setAuctionDuration", [
            60 * 60 * 48,
        ]);

        // propose
        const proposalId = await propose(
            encodedFunctionCall,
            "Lets increase the auction duration to 2 days!"
        );
        let proposalState = await governor.state(proposalId);
        console.log(`Current Proposal State: ${proposalState}`);
        await mine(VOTING_DELAY + 1);

        // vote
        await vote(proposalId, "Yeah lets increase it!", 1);
        proposalState = await governor.state(proposalId);
        assert.equal(proposalState.toString(), "1");
        console.log(`Current Proposal State: ${proposalState}`);
        await mine(VOTING_PERIOD + 1);

        // queue
        await queue(encodedFunctionCall, "Lets increase the auction duration to 2 days!");
        await increase(MIN_DELAY);
        proposalState = await governor.state(proposalId);
        console.log(`Current Proposal State: ${proposalState}`);

        // execute
        console.log("Executing...");
        await execute(encodedFunctionCall, "Lets increase the auction duration to 2 days!");

        // try to create 3 ongoing auctions
        await obscurityToken.approve(auction.address, 500);
        await auction.stakeTokens(500);
        await auction.createAuctionItem(1, "testItem", 1000);
        await increase(60 * 60 * 48 - 3600);
        await expect(auction.endAuction(1)).to.be.revertedWith("Auction has not yet ended");
    });

    // UTILS
    const propose = async (encodedFunctionCall, proposal) => {
        const proposeTx = await governor.propose(
            [auction.address],
            [0],
            [encodedFunctionCall],
            proposal
        );
        const receipt = await proposeTx.wait(1);
        return receipt.events![0].args!.proposalId;
    };

    const vote = async (proposalId, reason, voteWay) => {
        const voteTx = await governor.castVoteWithReason(proposalId, voteWay, reason);
        await voteTx.wait(1);
    };

    const queue = async (encodedFunctionCall, description) => {
        const descriptionHash = ethers.utils.id(description);
        const queueTx = await governor.queue(
            [auction.address],
            [0],
            [encodedFunctionCall],
            descriptionHash
        );
        await queueTx.wait(1);
    };

    const execute = async (encodedFunctionCall, description) => {
        const descriptionHash = ethers.utils.id(description);
        const exTx = await governor.execute(
            [auction.address],
            [0],
            [encodedFunctionCall],
            descriptionHash
        );
        await exTx.wait(1);
    };
});
