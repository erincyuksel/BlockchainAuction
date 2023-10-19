// contracts/Box.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ObscurityToken.sol";

contract Auction is Ownable {
    // enums

    enum EscrowState {
        AwaitingDeliveryAddress, // Waiting for winner to provide address
        PreparingItem, // Seller preparing item
        ItemOnDelivery, // Seller sent item on delivery
        ItemReceived, // Buyer received the item
        Dispute, // There is a dispute,
        DisputeResolved // Dispute has been resolved
    }

    // structs

    struct AuctionItem {
        uint256 itemId; // Unique identifier for the item
        string itemName; // Name or description of the item
        address payable seller; // Address of the seller
        uint256 reservePrice; // Minimum price at which the item can be sold
        uint256 highestBid; // Current highest bid
        address payable highestBidder; // Address of the highest bidder
        uint256 auctionEndTime; // Unix timestamp when the auction ends
        bool ended; // Flag to indicate if the auction has ended
        string deliveryAddress; // Delivery address of the winner, will be set by winner after auction ends
        EscrowState escrowState;
    }

    struct ActiveAuctioneer {
        uint256 stakedAmount;
        uint256[] activeAuctions;
        bool isInitialized;
    }

    // fields
    mapping(uint256 => AuctionItem) public auctionItems;
    mapping(address => ActiveAuctioneer) public activeAuctionOwners;
    mapping(uint256 => bool) public disputeResolved;
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
        require(
            activeAuctionOwners[msg.sender].stakedAmount >= tokensToStake,
            "Not enough tokens staked to create an auction"
        );
        _;
    }

    modifier belowAuctionCount() {
        require(
            activeAuctionOwners[msg.sender].activeAuctions.length < concurrentAuctionsPerUser,
            "You can't have any more active auctions"
        );
        _;
    }

    modifier isOwner(uint256 itemId) {
        require(
            auctionItems[itemId].seller == msg.sender,
            "Only auction owner can call this method"
        );
        _;
    }

    constructor(ObscurityToken _token) {
        token = _token;
    }

    modifier isWinner(uint256 itemId) {
        require(
            (msg.sender == auctionItems[itemId].highestBidder) && (auctionItems[itemId].ended),
            "You haven't won the auction or its still in progress"
        );
        _;
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
        if (activeAuctionOwners[msg.sender].isInitialized) {
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
        require(
            activeAuctionOwners[msg.sender].activeAuctions.length == 0,
            "You can't redeem tokens while ongoing auctions persist"
        );
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
            ended: false,
            deliveryAddress: "",
            escrowState: EscrowState.AwaitingDeliveryAddress
        });

        activeAuctionOwners[msg.sender].activeAuctions.push(itemId);
        emit AuctionItemCreated(itemId, itemName);
    }

    function setDeliveryAddress(
        uint256 itemId,
        string memory deliveryAddress
    ) external itemExists(itemId) isWinner(itemId) {
        AuctionItem storage item = auctionItems[itemId];
        item.deliveryAddress = deliveryAddress;
    }

    function transitionEscrowState(
        uint256 itemId,
        EscrowState nextState
    ) external itemExists(itemId) {
        AuctionItem storage item = auctionItems[itemId];

        require(
            (msg.sender == item.seller &&
                nextState == EscrowState.PreparingItem &&
                item.escrowState == EscrowState.AwaitingDeliveryAddress) ||
                (msg.sender == item.seller &&
                    nextState == EscrowState.ItemOnDelivery &&
                    item.escrowState == EscrowState.PreparingItem) ||
                (msg.sender == item.highestBidder &&
                    nextState == EscrowState.ItemReceived &&
                    item.escrowState == EscrowState.ItemOnDelivery) ||
                (msg.sender == item.highestBidder &&
                    nextState == EscrowState.ItemReceived &&
                    item.escrowState == EscrowState.ItemOnDelivery),
            "Invalid state transition"
        );

        item.escrowState = nextState;
        if (nextState == EscrowState.ItemReceived) {
            token.transfer(item.seller, item.highestBid);
        }
    }

    // Function to place a bid
    function placeBid(uint256 itemId, uint256 bidAmount) external payable itemExists(itemId) {
        AuctionItem storage item = auctionItems[itemId];

        require(item.seller != msg.sender, "Owner can't bid on their auctions");
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
        if ((item.auctionEndTime - block.timestamp) <= 500) {
            auctionItems[itemId].auctionEndTime =
                500 -
                (item.auctionEndTime - block.timestamp) +
                item.auctionEndTime;
        }
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
        require(
            msg.sender == item.seller || msg.sender == item.highestBidder,
            "Only the seller or highest bidder can end the auction"
        );
        item.ended = true;
        uint256[] storage activeAuctionsArr = activeAuctionOwners[msg.sender].activeAuctions;
        for (uint256 i = 0; i < activeAuctionsArr.length; i++) {
            if (itemId == 1) {
                activeAuctionsArr[i] = activeAuctionsArr[activeAuctionsArr.length - 1];
                activeAuctionsArr.pop();
                activeAuctionOwners[msg.sender].activeAuctions = activeAuctionsArr;
                break;
            }
        }
        if (item.highestBid == 0) {
            return;
        }
    }

    // GETTERS

    // Function to get information about a specific auction item
    function getAuctionItem(
        uint256 itemId
    )
        external
        view
        itemExists(itemId)
        returns (
            uint256,
            string memory,
            address payable,
            uint256,
            uint256,
            address payable,
            uint256,
            bool
        )
    {
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

    function getDeliveryAddress(
        uint256 itemId
    ) external view itemExists(itemId) isOwner(itemId) returns (string memory) {
        return auctionItems[itemId].deliveryAddress;
    }

    function getActiveAuctioneer() external view returns (uint256, uint256[] memory, bool) {
        ActiveAuctioneer storage auctioneer = activeAuctionOwners[msg.sender];
        return (auctioneer.stakedAmount, auctioneer.activeAuctions, auctioneer.isInitialized);
    }

    function getTokensToStake() external view returns (uint256) {
        return tokensToStake;
    }

    function getConcurrentAuctionsPerUser() external view returns (uint256) {
        return concurrentAuctionsPerUser;
    }

    function getAuctionDuration() external view returns (uint256) {
        return auctionDuration;
    }
}
