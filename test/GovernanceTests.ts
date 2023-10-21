import { deployments, ethers } from "hardhat";
import { assert, expect } from "chai";
import { Auction, ObscurityToken, TimeLock, GovernorContract } from "../typechain-types";
import "@nomicfoundation/hardhat-chai-matchers";
import { VOTING_DELAY, VOTING_PERIOD, MIN_DELAY } from "../helper-hardhat-config";
import { mine } from "@nomicfoundation/hardhat-network-helpers";
import { increase } from "@nomicfoundation/hardhat-network-helpers/dist/src/helpers/time";

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

        await auction.setPubKey("3C0Bx7xLMBBpM0oONXB9il6T5GHts1b/z6cqsBYfoXM=");
        await auction.connect(seller).setPubKey("3C0Bx7xLMBBpM0oONXB9il6T5GHts1b/z6cqsBYfoXM=");
        await auction.connect(buyer).setPubKey("3C0Bx7xLMBBpM0oONXB9il6T5GHts1b/z6cqsBYfoXM=");
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
        await expect(auction.createAuctionItem("test", "testItem", 1000)).to.be.revertedWith(
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
        await auction.createAuctionItem("test1", "testItem1", 1000);
        await auction.createAuctionItem("test2", "testItem2", 1000);
        await auction.createAuctionItem("test3", "testItem3", 1000);

        // 4th one should fail
        await expect(auction.createAuctionItem("test4", "testItem4", 1000)).to.be.revertedWith(
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
        await auction.createAuctionItem("test", "testItem", 1000);
        await increase(60 * 60 * 48 - 3600);
        await expect(auction.endAuction("test")).to.be.revertedWith("Auction has not yet ended");
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
