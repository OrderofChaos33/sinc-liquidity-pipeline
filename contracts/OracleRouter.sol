// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract OracleRouter is AccessControl {
    bytes32 public constant ORACLE_ADMIN_ROLE = keccak256("ORACLE_ADMIN_ROLE");

    struct PriceFeed {
        AggregatorV3Interface aggregator;
        uint256 heartbeat;
        uint8 decimals;
        bool active;
    }

    mapping(bytes32 => PriceFeed) public feeds;
    address public pyth;
    address public sincEthPool;
    uint32 public twapInterval = 3600;

    event FeedUpdated(bytes32 indexed pair, address aggregator, uint256 heartbeat);
    event SincEthPoolUpdated(address pool);

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ORACLE_ADMIN_ROLE, admin);
    }

    function setFeed(bytes32 pair, address aggregator, uint256 heartbeat, uint8 dec) external onlyRole(ORACLE_ADMIN_ROLE) {
        feeds[pair] = PriceFeed(AggregatorV3Interface(aggregator), heartbeat, dec, true);
        emit FeedUpdated(pair, aggregator, heartbeat);
    }

    function setSincEthPool(address _pool) external onlyRole(ORACLE_ADMIN_ROLE) {
        sincEthPool = _pool;
        emit SincEthPoolUpdated(_pool);
    }

    function getPrice(bytes32 pair) external view returns (uint256 price, uint256 timestamp) {
        // Full TWAP derivation logic for SINC/USD can be added here using sincEthPool
        // For now uses direct feeds; bootstrap with ETH/USD
        PriceFeed memory feed = feeds[pair];
        require(feed.active, "Feed not active");
        (, int256 answer, , uint256 updatedAt, ) = feed.aggregator.latestRoundData();
        require(answer > 0, "Invalid price");
        require(block.timestamp - updatedAt <= feed.heartbeat, "Stale price");
        price = uint256(answer);
        if (feed.decimals < 18) price = price * (10 ** (18 - feed.decimals));
        timestamp = updatedAt;
    }

    function getSINCUSDPrice() external view returns (uint256) {
        (uint256 price, ) = this.getPrice(keccak256("SINC/USD"));
        return price;
    }
}