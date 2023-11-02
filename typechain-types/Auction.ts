/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import { Listener, Provider } from "@ethersproject/providers";
import { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "./common";

export declare namespace Auction {
  export type AuctionItemStruct = {
    itemId: string;
    itemName: string;
    itemDescription: string;
    hashOfImage: string;
    seller: string;
    reservePrice: BigNumberish;
    highestBid: BigNumberish;
    highestBidder: string;
    auctionEndTime: BigNumberish;
    ended: boolean;
    deliveryAddress: string;
    privateChatLogs: string[];
    committeeChatLogs: string[];
    escrowState: BigNumberish;
    yesVotes: BigNumberish;
    noVotes: BigNumberish;
  };

  export type AuctionItemStructOutput = [
    string,
    string,
    string,
    string,
    string,
    BigNumber,
    BigNumber,
    string,
    BigNumber,
    boolean,
    string,
    string[],
    string[],
    number,
    number,
    number
  ] & {
    itemId: string;
    itemName: string;
    itemDescription: string;
    hashOfImage: string;
    seller: string;
    reservePrice: BigNumber;
    highestBid: BigNumber;
    highestBidder: string;
    auctionEndTime: BigNumber;
    ended: boolean;
    deliveryAddress: string;
    privateChatLogs: string[];
    committeeChatLogs: string[];
    escrowState: number;
    yesVotes: number;
    noVotes: number;
  };
}

export interface AuctionInterface extends utils.Interface {
  contractName: "Auction";
  functions: {
    "activeAuctionOwners(address)": FunctionFragment;
    "auctionItems(string)": FunctionFragment;
    "compareStrings(string,string)": FunctionFragment;
    "createAuctionItem(string,string,string,string,uint256)": FunctionFragment;
    "endAuction(string)": FunctionFragment;
    "getActiveAuctioneer()": FunctionFragment;
    "getAllAuctions()": FunctionFragment;
    "getAllDisputeAuctions()": FunctionFragment;
    "getAuctionDuration()": FunctionFragment;
    "getAuctionItem(string)": FunctionFragment;
    "getChatLogOfItem(string)": FunctionFragment;
    "getConcurrentAuctionsPerUser()": FunctionFragment;
    "getCurrentTimestamp()": FunctionFragment;
    "getDeliveryAddress(string)": FunctionFragment;
    "getPubKey(address)": FunctionFragment;
    "getTokensToStake()": FunctionFragment;
    "isCommitteeMember(address)": FunctionFragment;
    "owner()": FunctionFragment;
    "placeBid(string,uint256)": FunctionFragment;
    "pubKeys(address)": FunctionFragment;
    "raiseDispute(string)": FunctionFragment;
    "relinquishTokensToOwner()": FunctionFragment;
    "renounceOwnership()": FunctionFragment;
    "resolveDispute(string)": FunctionFragment;
    "sendChat(string,string)": FunctionFragment;
    "sendCommitteeChat(string,string)": FunctionFragment;
    "setAuctionDuration(uint64)": FunctionFragment;
    "setConcurrentAuctionsPerUser(uint8)": FunctionFragment;
    "setDeliveryAddress(string,string)": FunctionFragment;
    "setPubKey(string)": FunctionFragment;
    "setTokensToStake(uint256)": FunctionFragment;
    "stakeTokens(uint256)": FunctionFragment;
    "transferOwnership(address)": FunctionFragment;
    "transitionEscrowState(string,uint8)": FunctionFragment;
    "voteOnDispute(string,uint8)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "activeAuctionOwners",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "auctionItems",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "compareStrings",
    values: [string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "createAuctionItem",
    values: [string, string, string, string, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "endAuction", values: [string]): string;
  encodeFunctionData(
    functionFragment: "getActiveAuctioneer",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getAllAuctions",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getAllDisputeAuctions",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getAuctionDuration",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getAuctionItem",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "getChatLogOfItem",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "getConcurrentAuctionsPerUser",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getCurrentTimestamp",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getDeliveryAddress",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "getPubKey", values: [string]): string;
  encodeFunctionData(
    functionFragment: "getTokensToStake",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "isCommitteeMember",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "placeBid",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "pubKeys", values: [string]): string;
  encodeFunctionData(
    functionFragment: "raiseDispute",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "relinquishTokensToOwner",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "resolveDispute",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "sendChat",
    values: [string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "sendCommitteeChat",
    values: [string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "setAuctionDuration",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setConcurrentAuctionsPerUser",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setDeliveryAddress",
    values: [string, string]
  ): string;
  encodeFunctionData(functionFragment: "setPubKey", values: [string]): string;
  encodeFunctionData(
    functionFragment: "setTokensToStake",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "stakeTokens",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "transitionEscrowState",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "voteOnDispute",
    values: [string, BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "activeAuctionOwners",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "auctionItems",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "compareStrings",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "createAuctionItem",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "endAuction", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getActiveAuctioneer",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAllAuctions",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAllDisputeAuctions",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAuctionDuration",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAuctionItem",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getChatLogOfItem",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getConcurrentAuctionsPerUser",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getCurrentTimestamp",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getDeliveryAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getPubKey", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getTokensToStake",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isCommitteeMember",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "placeBid", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "pubKeys", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "raiseDispute",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "relinquishTokensToOwner",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "resolveDispute",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "sendChat", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "sendCommitteeChat",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setAuctionDuration",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setConcurrentAuctionsPerUser",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setDeliveryAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "setPubKey", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setTokensToStake",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "stakeTokens",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transitionEscrowState",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "voteOnDispute",
    data: BytesLike
  ): Result;

  events: {
    "AuctionItemCreated(string,string)": EventFragment;
    "OwnershipTransferred(address,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "AuctionItemCreated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
}

export type AuctionItemCreatedEvent = TypedEvent<
  [string, string],
  { itemId: string; itemName: string }
>;

export type AuctionItemCreatedEventFilter =
  TypedEventFilter<AuctionItemCreatedEvent>;

export type OwnershipTransferredEvent = TypedEvent<
  [string, string],
  { previousOwner: string; newOwner: string }
>;

export type OwnershipTransferredEventFilter =
  TypedEventFilter<OwnershipTransferredEvent>;

export interface Auction extends BaseContract {
  contractName: "Auction";
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: AuctionInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    activeAuctionOwners(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, boolean] & { stakedAmount: BigNumber; isInitialized: boolean }
    >;

    auctionItems(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<
      [
        string,
        string,
        string,
        string,
        string,
        BigNumber,
        BigNumber,
        string,
        BigNumber,
        boolean,
        string,
        number,
        number,
        number
      ] & {
        itemId: string;
        itemName: string;
        itemDescription: string;
        hashOfImage: string;
        seller: string;
        reservePrice: BigNumber;
        highestBid: BigNumber;
        highestBidder: string;
        auctionEndTime: BigNumber;
        ended: boolean;
        deliveryAddress: string;
        escrowState: number;
        yesVotes: number;
        noVotes: number;
      }
    >;

    compareStrings(
      a: string,
      b: string,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    createAuctionItem(
      itemId: string,
      itemName: string,
      itemDescription: string,
      hashOfImage: string,
      reservePrice: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    endAuction(
      itemId: string,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    getActiveAuctioneer(
      overrides?: CallOverrides
    ): Promise<[BigNumber, string[], boolean]>;

    getAllAuctions(
      overrides?: CallOverrides
    ): Promise<[Auction.AuctionItemStructOutput[]]>;

    getAllDisputeAuctions(
      overrides?: CallOverrides
    ): Promise<[Auction.AuctionItemStructOutput[]]>;

    getAuctionDuration(overrides?: CallOverrides): Promise<[BigNumber]>;

    getAuctionItem(
      itemId: string,
      overrides?: CallOverrides
    ): Promise<
      [string, string, string, BigNumber, BigNumber, string, BigNumber, boolean]
    >;

    getChatLogOfItem(
      itemId: string,
      overrides?: CallOverrides
    ): Promise<[string[]]>;

    getConcurrentAuctionsPerUser(
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getCurrentTimestamp(overrides?: CallOverrides): Promise<[BigNumber]>;

    getDeliveryAddress(
      itemId: string,
      overrides?: CallOverrides
    ): Promise<[string]>;

    getPubKey(adr: string, overrides?: CallOverrides): Promise<[string]>;

    getTokensToStake(overrides?: CallOverrides): Promise<[BigNumber]>;

    isCommitteeMember(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    placeBid(
      itemId: string,
      bidAmount: BigNumberish,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    pubKeys(arg0: string, overrides?: CallOverrides): Promise<[string]>;

    raiseDispute(
      itemId: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    relinquishTokensToOwner(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    resolveDispute(
      itemId: string,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    sendChat(
      itemId: string,
      message: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    sendCommitteeChat(
      itemId: string,
      message: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setAuctionDuration(
      duration: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setConcurrentAuctionsPerUser(
      auctionCount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setDeliveryAddress(
      itemId: string,
      deliveryAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setPubKey(
      pubKey: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setTokensToStake(
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    stakeTokens(
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    transitionEscrowState(
      itemId: string,
      nextState: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    voteOnDispute(
      itemId: string,
      vote: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  activeAuctionOwners(
    arg0: string,
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, boolean] & { stakedAmount: BigNumber; isInitialized: boolean }
  >;

  auctionItems(
    arg0: string,
    overrides?: CallOverrides
  ): Promise<
    [
      string,
      string,
      string,
      string,
      string,
      BigNumber,
      BigNumber,
      string,
      BigNumber,
      boolean,
      string,
      number,
      number,
      number
    ] & {
      itemId: string;
      itemName: string;
      itemDescription: string;
      hashOfImage: string;
      seller: string;
      reservePrice: BigNumber;
      highestBid: BigNumber;
      highestBidder: string;
      auctionEndTime: BigNumber;
      ended: boolean;
      deliveryAddress: string;
      escrowState: number;
      yesVotes: number;
      noVotes: number;
    }
  >;

  compareStrings(
    a: string,
    b: string,
    overrides?: CallOverrides
  ): Promise<boolean>;

  createAuctionItem(
    itemId: string,
    itemName: string,
    itemDescription: string,
    hashOfImage: string,
    reservePrice: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  endAuction(
    itemId: string,
    overrides?: PayableOverrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  getActiveAuctioneer(
    overrides?: CallOverrides
  ): Promise<[BigNumber, string[], boolean]>;

  getAllAuctions(
    overrides?: CallOverrides
  ): Promise<Auction.AuctionItemStructOutput[]>;

  getAllDisputeAuctions(
    overrides?: CallOverrides
  ): Promise<Auction.AuctionItemStructOutput[]>;

  getAuctionDuration(overrides?: CallOverrides): Promise<BigNumber>;

  getAuctionItem(
    itemId: string,
    overrides?: CallOverrides
  ): Promise<
    [string, string, string, BigNumber, BigNumber, string, BigNumber, boolean]
  >;

  getChatLogOfItem(
    itemId: string,
    overrides?: CallOverrides
  ): Promise<string[]>;

  getConcurrentAuctionsPerUser(overrides?: CallOverrides): Promise<BigNumber>;

  getCurrentTimestamp(overrides?: CallOverrides): Promise<BigNumber>;

  getDeliveryAddress(
    itemId: string,
    overrides?: CallOverrides
  ): Promise<string>;

  getPubKey(adr: string, overrides?: CallOverrides): Promise<string>;

  getTokensToStake(overrides?: CallOverrides): Promise<BigNumber>;

  isCommitteeMember(arg0: string, overrides?: CallOverrides): Promise<boolean>;

  owner(overrides?: CallOverrides): Promise<string>;

  placeBid(
    itemId: string,
    bidAmount: BigNumberish,
    overrides?: PayableOverrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  pubKeys(arg0: string, overrides?: CallOverrides): Promise<string>;

  raiseDispute(
    itemId: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  relinquishTokensToOwner(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  renounceOwnership(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  resolveDispute(
    itemId: string,
    overrides?: PayableOverrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  sendChat(
    itemId: string,
    message: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  sendCommitteeChat(
    itemId: string,
    message: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setAuctionDuration(
    duration: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setConcurrentAuctionsPerUser(
    auctionCount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setDeliveryAddress(
    itemId: string,
    deliveryAddress: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setPubKey(
    pubKey: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setTokensToStake(
    amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  stakeTokens(
    amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  transferOwnership(
    newOwner: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  transitionEscrowState(
    itemId: string,
    nextState: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  voteOnDispute(
    itemId: string,
    vote: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    activeAuctionOwners(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, boolean] & { stakedAmount: BigNumber; isInitialized: boolean }
    >;

    auctionItems(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<
      [
        string,
        string,
        string,
        string,
        string,
        BigNumber,
        BigNumber,
        string,
        BigNumber,
        boolean,
        string,
        number,
        number,
        number
      ] & {
        itemId: string;
        itemName: string;
        itemDescription: string;
        hashOfImage: string;
        seller: string;
        reservePrice: BigNumber;
        highestBid: BigNumber;
        highestBidder: string;
        auctionEndTime: BigNumber;
        ended: boolean;
        deliveryAddress: string;
        escrowState: number;
        yesVotes: number;
        noVotes: number;
      }
    >;

    compareStrings(
      a: string,
      b: string,
      overrides?: CallOverrides
    ): Promise<boolean>;

    createAuctionItem(
      itemId: string,
      itemName: string,
      itemDescription: string,
      hashOfImage: string,
      reservePrice: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    endAuction(itemId: string, overrides?: CallOverrides): Promise<void>;

    getActiveAuctioneer(
      overrides?: CallOverrides
    ): Promise<[BigNumber, string[], boolean]>;

    getAllAuctions(
      overrides?: CallOverrides
    ): Promise<Auction.AuctionItemStructOutput[]>;

    getAllDisputeAuctions(
      overrides?: CallOverrides
    ): Promise<Auction.AuctionItemStructOutput[]>;

    getAuctionDuration(overrides?: CallOverrides): Promise<BigNumber>;

    getAuctionItem(
      itemId: string,
      overrides?: CallOverrides
    ): Promise<
      [string, string, string, BigNumber, BigNumber, string, BigNumber, boolean]
    >;

    getChatLogOfItem(
      itemId: string,
      overrides?: CallOverrides
    ): Promise<string[]>;

    getConcurrentAuctionsPerUser(overrides?: CallOverrides): Promise<BigNumber>;

    getCurrentTimestamp(overrides?: CallOverrides): Promise<BigNumber>;

    getDeliveryAddress(
      itemId: string,
      overrides?: CallOverrides
    ): Promise<string>;

    getPubKey(adr: string, overrides?: CallOverrides): Promise<string>;

    getTokensToStake(overrides?: CallOverrides): Promise<BigNumber>;

    isCommitteeMember(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<boolean>;

    owner(overrides?: CallOverrides): Promise<string>;

    placeBid(
      itemId: string,
      bidAmount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    pubKeys(arg0: string, overrides?: CallOverrides): Promise<string>;

    raiseDispute(itemId: string, overrides?: CallOverrides): Promise<void>;

    relinquishTokensToOwner(overrides?: CallOverrides): Promise<void>;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    resolveDispute(itemId: string, overrides?: CallOverrides): Promise<void>;

    sendChat(
      itemId: string,
      message: string,
      overrides?: CallOverrides
    ): Promise<void>;

    sendCommitteeChat(
      itemId: string,
      message: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setAuctionDuration(
      duration: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    setConcurrentAuctionsPerUser(
      auctionCount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    setDeliveryAddress(
      itemId: string,
      deliveryAddress: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setPubKey(pubKey: string, overrides?: CallOverrides): Promise<void>;

    setTokensToStake(
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    stakeTokens(amount: BigNumberish, overrides?: CallOverrides): Promise<void>;

    transferOwnership(
      newOwner: string,
      overrides?: CallOverrides
    ): Promise<void>;

    transitionEscrowState(
      itemId: string,
      nextState: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    voteOnDispute(
      itemId: string,
      vote: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "AuctionItemCreated(string,string)"(
      itemId?: string | null,
      itemName?: null
    ): AuctionItemCreatedEventFilter;
    AuctionItemCreated(
      itemId?: string | null,
      itemName?: null
    ): AuctionItemCreatedEventFilter;

    "OwnershipTransferred(address,address)"(
      previousOwner?: string | null,
      newOwner?: string | null
    ): OwnershipTransferredEventFilter;
    OwnershipTransferred(
      previousOwner?: string | null,
      newOwner?: string | null
    ): OwnershipTransferredEventFilter;
  };

  estimateGas: {
    activeAuctionOwners(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    auctionItems(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    compareStrings(
      a: string,
      b: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    createAuctionItem(
      itemId: string,
      itemName: string,
      itemDescription: string,
      hashOfImage: string,
      reservePrice: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    endAuction(
      itemId: string,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    getActiveAuctioneer(overrides?: CallOverrides): Promise<BigNumber>;

    getAllAuctions(overrides?: CallOverrides): Promise<BigNumber>;

    getAllDisputeAuctions(overrides?: CallOverrides): Promise<BigNumber>;

    getAuctionDuration(overrides?: CallOverrides): Promise<BigNumber>;

    getAuctionItem(
      itemId: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getChatLogOfItem(
      itemId: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getConcurrentAuctionsPerUser(overrides?: CallOverrides): Promise<BigNumber>;

    getCurrentTimestamp(overrides?: CallOverrides): Promise<BigNumber>;

    getDeliveryAddress(
      itemId: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getPubKey(adr: string, overrides?: CallOverrides): Promise<BigNumber>;

    getTokensToStake(overrides?: CallOverrides): Promise<BigNumber>;

    isCommitteeMember(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    placeBid(
      itemId: string,
      bidAmount: BigNumberish,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    pubKeys(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    raiseDispute(
      itemId: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    relinquishTokensToOwner(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    resolveDispute(
      itemId: string,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    sendChat(
      itemId: string,
      message: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    sendCommitteeChat(
      itemId: string,
      message: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setAuctionDuration(
      duration: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setConcurrentAuctionsPerUser(
      auctionCount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setDeliveryAddress(
      itemId: string,
      deliveryAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setPubKey(
      pubKey: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setTokensToStake(
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    stakeTokens(
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    transitionEscrowState(
      itemId: string,
      nextState: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    voteOnDispute(
      itemId: string,
      vote: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    activeAuctionOwners(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    auctionItems(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    compareStrings(
      a: string,
      b: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    createAuctionItem(
      itemId: string,
      itemName: string,
      itemDescription: string,
      hashOfImage: string,
      reservePrice: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    endAuction(
      itemId: string,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    getActiveAuctioneer(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getAllAuctions(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getAllDisputeAuctions(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getAuctionDuration(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getAuctionItem(
      itemId: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getChatLogOfItem(
      itemId: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getConcurrentAuctionsPerUser(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getCurrentTimestamp(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getDeliveryAddress(
      itemId: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getPubKey(
      adr: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getTokensToStake(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    isCommitteeMember(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    placeBid(
      itemId: string,
      bidAmount: BigNumberish,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    pubKeys(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    raiseDispute(
      itemId: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    relinquishTokensToOwner(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    resolveDispute(
      itemId: string,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    sendChat(
      itemId: string,
      message: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    sendCommitteeChat(
      itemId: string,
      message: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setAuctionDuration(
      duration: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setConcurrentAuctionsPerUser(
      auctionCount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setDeliveryAddress(
      itemId: string,
      deliveryAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setPubKey(
      pubKey: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setTokensToStake(
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    stakeTokens(
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    transitionEscrowState(
      itemId: string,
      nextState: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    voteOnDispute(
      itemId: string,
      vote: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
