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

    mapping(uint256 => AuctionItem) public auctionItems;
    ObscurityToken token;

    // events
    event AuctionItemCreated(uint256 indexed itemId, string itemName);

    // modifiers
    modifier itemExists(uint256 itemId) {
        require(auctionItems[itemId].itemId == itemId, "Item does not exist");
        _;
    }

        constructor(ObscurityToken _token) {
        token = _token;
    }


    function createAuctionItem(
        uint256 itemId,
        string memory itemName,
        uint256 reservePrice,
        uint256 auctionDuration
    ) external {
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

        emit AuctionItemCreated(itemId, itemName);
    }


    // Function to place a bid
    function placeBid(uint256 itemId, uint256 bidAmount) external payable itemExists(itemId) {
        AuctionItem storage item = auctionItems[itemId];

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

}