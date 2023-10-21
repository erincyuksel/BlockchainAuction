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
        string itemId; // Unique identifier for the item
        string itemName; // Name or description of the item
        address payable seller; // Address of the seller
        uint256 reservePrice; // Minimum price at which the item can be sold
        uint256 highestBid; // Current highest bid
        address payable highestBidder; // Address of the highest bidder
        uint256 auctionEndTime; // Unix timestamp when the auction ends
        bool ended; // Flag to indicate if the auction has ended
        string deliveryAddress; // Delivery address of the winner, will be set by winner after auction ends
        string[] privateChatLogs; // Chat log between winner and owner
        string[] committeeChatLogs; // In case of dispute, discussion will be held here
        EscrowState escrowState;
    }

    struct ActiveAuctioneer {
        uint256 stakedAmount;
        string[] activeAuctions;
        bool isInitialized;
    }

    // fields
    mapping(string => AuctionItem) public auctionItems;
    mapping(address => ActiveAuctioneer) public activeAuctionOwners;
    mapping (address => string) public pubKeys;
    uint256 tokensToStake = 500;
    ObscurityToken token;

    // fields that get edited with DAO votes
    uint64 auctionDuration = 60 * 60 * 24; // 1 day
    uint8 concurrentAuctionsPerUser = 2;

    // events
    event AuctionItemCreated(string indexed itemId, string itemName);

    // modifiers
    modifier itemExists(string calldata itemId) {
        require(compareStrings(auctionItems[itemId].itemId, itemId), "Item does not exist");
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

    modifier isOwner(string calldata itemId) {
        require(
            auctionItems[itemId].seller == msg.sender,
            "Only auction owner can call this method"
        );
        _;
    }

    modifier isWinner(string calldata itemId) {
        require(
            (msg.sender == auctionItems[itemId].highestBidder) && (auctionItems[itemId].ended),
            "You haven't won the auction or its still in progress"
        );
        _;
    }

    modifier hasPubKey() {
        require(bytes(pubKeys[msg.sender]).length == 44, "Please submit your eth wallet pubkey before using the system");
        _;
    }

    constructor(ObscurityToken _token) {
        token = _token;
    }


    // Functions to be called by DAO
    function setAuctionDuration(uint64 duration) external onlyOwner {
        auctionDuration = duration;
    }

    function setConcurrentAuctionsPerUser(uint8 auctionCount) external onlyOwner {
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
            string[] memory init;
            activeAuctionOwners[msg.sender] = ActiveAuctioneer({
                stakedAmount: amount,
                activeAuctions: init,
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
        string calldata itemId,
        string memory itemName,
        uint256 reservePrice
    ) external stakedCoinRequired belowAuctionCount hasPubKey{
        require(!compareStrings(itemId, auctionItems[itemId].itemId), "Item already exists");
        require(reservePrice > 0, "Reserve price must be greater than zero");

        uint256 auctionEndTime = block.timestamp + auctionDuration;
        string[] memory init;
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
            privateChatLogs: init,
            committeeChatLogs: init,
            escrowState: EscrowState.AwaitingDeliveryAddress
        });

        activeAuctionOwners[msg.sender].activeAuctions.push(itemId);
        emit AuctionItemCreated(itemId, itemName);
    }


    // Function to place a bid
    function placeBid(string calldata itemId, uint256 bidAmount) external payable itemExists(itemId) hasPubKey{
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

    // Function to end an auction and finalize the highest bidder
    function endAuction(string calldata itemId) external payable itemExists(itemId) {
        AuctionItem storage item = auctionItems[itemId];

        require(!item.ended, "Auction has already ended");
        require(block.timestamp >= item.auctionEndTime, "Auction has not yet ended");
        require(
            msg.sender == item.seller || msg.sender == item.highestBidder,
            "Only the seller or highest bidder can end the auction"
        );
        item.ended = true;
        string[] storage activeAuctionsArr = activeAuctionOwners[msg.sender].activeAuctions;
        for (uint256 i = 0; i < activeAuctionsArr.length; i++) {
            if (compareStrings(itemId, item.itemId)) {
                activeAuctionsArr[i] = activeAuctionsArr[activeAuctionsArr.length - 1];
                activeAuctionsArr.pop();
                break;
            }
        }
        if (item.highestBid == 0) {
            return;
        }
    }

    function sendChat(string calldata itemId, string calldata message) external itemExists(itemId){
        AuctionItem storage item = auctionItems[itemId];
        require((item.highestBidder ==  msg.sender || msg.sender == item.seller) && item.ended, "Auction has not ended yet, or you are not the winner or owner of the item");
        item.privateChatLogs.push(message);
    }


    // GETTERS

    // Function to get information about a specific auction item
    function getAuctionItem(
        string calldata itemId
    )
        external
        view
        itemExists(itemId)
        returns (
            string memory,
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
        string calldata itemId
    ) external view itemExists(itemId) isOwner(itemId) returns (string memory) {
        return auctionItems[itemId].deliveryAddress;
    }

    function getActiveAuctioneer() external view returns (uint256, string[] memory, bool) {
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

    // Function to get the current block timestamp
    function getCurrentTimestamp() external view returns (uint256) {
        return block.timestamp;
    }

    function getChatLogOfItem(string calldata itemId) external view itemExists(itemId) returns (string[] memory){
        AuctionItem storage item = auctionItems[itemId];
        require((item.highestBidder ==  msg.sender || msg.sender == item.seller) && item.ended, "Auction has not ended yet, or you are not the winner or owner of the item");

        return item.privateChatLogs;
    }

    function getPubKey(address adr) external view returns (string memory){
        return pubKeys[adr];
    }

    // SETTERS

    function setDeliveryAddress(
        string calldata itemId,
        string memory deliveryAddress
    ) external itemExists(itemId) isWinner(itemId) {
        AuctionItem storage item = auctionItems[itemId];
        item.deliveryAddress = deliveryAddress;
    }

    function setPubKey(string calldata pubKey) external {
        pubKeys[msg.sender] = pubKey;
    }

    // Escrow Functions

    function transitionEscrowState(
        string calldata itemId,
        EscrowState nextState
    ) external itemExists(itemId) {
        AuctionItem storage item = auctionItems[itemId];
        require(item.escrowState != EscrowState.Dispute, "Cant resume escrow processes without dispute resolution");
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

        require(bytes(item.deliveryAddress).length > 0, "Please set a delivery address first");

        item.escrowState = nextState;
        if (nextState == EscrowState.ItemReceived) {
            token.transfer(item.seller, item.highestBid);
        }
    }

    function raiseDispute(string calldata itemId) external itemExists(itemId) {
        AuctionItem storage item = auctionItems[itemId];
        require((item.highestBidder ==  msg.sender || msg.sender == item.seller) && item.ended, "Auction has not ended yet, or you are not the winner or owner of the item");
        item.escrowState = EscrowState.Dispute;
    }

    // Utils
        function compareStrings(string memory a, string memory b) public pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }
}
