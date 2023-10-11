// contracts/Box.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ObscurityToken.sol";

contract Auction is Ownable {

    struct AuctionItem {
        uint256 itemId;         // Unique identifier for the item
        string itemName;        // Name or description of the item
        address payable seller; // Address of the seller
        uint256 reservePrice;   // Minimum price at which the item can be sold
        uint256 highestBid;     // Current highest bid
        address payable highestBidder; // Address of the highest bidder
        uint256 auctionEndTime; // Unix timestamp when the auction ends
        bool ended;             // Flag to indicate if the auction has ended
    }

    struct ActiveAuctioneer {
        uint256 stakedAmount;
        uint256[] activeAuctions;
        bool isInitialized;
    }

    mapping(uint256 => AuctionItem) public auctionItems;
    mapping(address => ActiveAuctioneer) public activeAuctionOwners;
    uint256 tokensToStake = 500;
    ObscurityToken token;

    // fields that get edited with DAO votes
    uint256 auctionDuration = 60 * 60 * 24; // 1 day
    uint256 concurrentAuctionsPerUser = 2;

    // events
    event AuctionItemCreated(uint256 indexed itemId, string itemName);

    // modifiers
    modifier itemExists(uint256 itemId) {
        require(auctionItems[itemId].itemId == itemId, "Item does not exist");
        _;
    }

    modifier stakedCoinRequired() {
        require(activeAuctionOwners[msg.sender].stakedAmount >= tokensToStake, "Not enough tokens staked to create an auction");
        _;
    }

    modifier belowAuctionCount() {
        require(activeAuctionOwners[msg.sender].activeAuctions.length <= concurrentAuctionsPerUser);
        _;
    }

        constructor(ObscurityToken _token) {
        token = _token;
    }

    // Functions to be called by DAO
    function setAuctionDuration(uint256 duration) external onlyOwner {
        auctionDuration = duration;
    }

    function setConcurrentAuctionsPerUser(uint256 auctionCount) external onlyOwner {
        concurrentAuctionsPerUser = auctionCount;
    }

    function setTokensToStake(uint256 amount) external onlyOwner {
        tokensToStake = amount;
    }

    // Auction functions

    function stakeTokens(uint256 amount) external {
        token.transferFrom(msg.sender, address(this), amount);
        if(activeAuctionOwners[msg.sender].isInitialized){
            activeAuctionOwners[msg.sender].stakedAmount += amount;
        } else {
            activeAuctionOwners[msg.sender] = ActiveAuctioneer({
                stakedAmount: amount,
                activeAuctions: new uint256[](0),
                isInitialized: true
            });
        }
    }

    function relinquishTokensToOwner() external {
        require(activeAuctionOwners[msg.sender].activeAuctions.length == 0, "You can't redeem tokens while ongoing auctions persist");
        token.approve(address(this), activeAuctionOwners[msg.sender].stakedAmount);
        token.transferFrom(address(this), msg.sender, activeAuctionOwners[msg.sender].stakedAmount);
    }

    function createAuctionItem(
        uint256 itemId,
        string memory itemName,
        uint256 reservePrice
    ) external stakedCoinRequired belowAuctionCount {
        require(auctionItems[itemId].itemId == 0, "Item already exists");
        require(reservePrice > 0, "Reserve price must be greater than zero");

        uint256 auctionEndTime = block.timestamp + auctionDuration;

        auctionItems[itemId] = AuctionItem({
            itemId: itemId,
            itemName: itemName,
            seller: payable(msg.sender),
            reservePrice: reservePrice,
            highestBid: 0,
            highestBidder: payable(address(0)),
            auctionEndTime: auctionEndTime,
            ended: false
        });

        activeAuctionOwners[msg.sender].activeAuctions.push(itemId);
        emit AuctionItemCreated(itemId, itemName);
    }


    // Function to place a bid
    function placeBid(uint256 itemId, uint256 bidAmount) external payable itemExists(itemId) {
        AuctionItem storage item = auctionItems[itemId];

        require(item.reservePrice < bidAmount, "Bid must be higher than the reserve price");
        require(!item.ended, "Auction has ended");
        require(block.timestamp < item.auctionEndTime, "Auction has expired");
        require(bidAmount > item.highestBid, "Bid must be higher than the current highest bid");

        // Transfer the ERC-20 tokens from the bidder to the contract
        token.transferFrom(msg.sender, address(this), bidAmount);

        // Refund the previous highest bidder
        if (item.highestBidder != address(0)) {
            token.transfer(item.highestBidder, item.highestBid);
        }

        item.highestBid = bidAmount;
        item.highestBidder = payable(msg.sender);
    }

    // Function to get the current block timestamp
    function getCurrentTimestamp() external view returns (uint256) {
        return block.timestamp;
    }

    // Function to end an auction and finalize the highest bidder
    function endAuction(uint256 itemId) external payable itemExists(itemId) {
        AuctionItem storage item = auctionItems[itemId];

        require(!item.ended, "Auction has already ended");
        require(block.timestamp >= item.auctionEndTime, "Auction has not yet ended");
        require(msg.sender == item.seller || msg.sender == item.highestBidder, "Only the seller or highest bidder can end the auction");

        item.ended = true;

        // If there are bids above the reserve price, transfer the item to the highest bidder
        if (item.highestBid >= item.reservePrice) {
            // Transfer the ERC-20 tokens from the contract to the seller
            token.transfer(item.seller, item.highestBid);
        } else {
            // If the reserve price is not met, refund the highest bidder
            token.transfer(item.highestBidder, item.highestBid);
        }
    }

        // Function to get information about a specific auction item
    function getAuctionItem(uint256 itemId) external view itemExists(itemId) returns (
        uint256,
        string memory,
        address payable,
        uint256,
        uint256,
        address payable,
        uint256,
        bool
    ) {
        AuctionItem storage item = auctionItems[itemId];

        return (
            item.itemId,
            item.itemName,
            item.seller,
            item.reservePrice,
            item.highestBid,
            item.highestBidder,
            item.auctionEndTime,
            item.ended
        );
    }

    function getActiveAuctioneer() external view returns (
        uint256,
        uint256[] memory,
        bool
    ){
        ActiveAuctioneer storage auctioneer = activeAuctionOwners[msg.sender];
        return (
            auctioneer.stakedAmount,
            auctioneer.activeAuctions,
            auctioneer.isInitialized
        );
    }

}