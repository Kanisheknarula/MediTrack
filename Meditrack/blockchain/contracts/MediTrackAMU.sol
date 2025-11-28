// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MediTrackAMU {
    struct EventRecord {
        address actor;         // who triggered this (vet, manager, pharmacist)
        string actionType;     // e.g. "PRESCRIPTION_CREATED", "MRL_TESTED"
        string animalId;       // e.g. "COW-101"
        bytes32 recordHash;    // hash of JSON stored in MongoDB
        uint256 timestamp;     // when this happened
    }

    EventRecord[] public events;

    event EventLogged(
        uint256 indexed id,
        address indexed actor,
        string actionType,
        string animalId,
        bytes32 recordHash,
        uint256 timestamp
    );

    function addEvent(
        string memory actionType,
        string memory animalId,
        bytes32 recordHash
    ) public {
        EventRecord memory e = EventRecord({
            actor: msg.sender,
            actionType: actionType,
            animalId: animalId,
            recordHash: recordHash,
            timestamp: block.timestamp
        });

        events.push(e);

        emit EventLogged(
            events.length - 1,
            msg.sender,
            actionType,
            animalId,
            recordHash,
            block.timestamp
        );
    }

    function getEventCount() public view returns (uint256) {
        return events.length;
    }

    function getEvent(uint256 id) public view returns (
        address actor,
        string memory actionType,
        string memory animalId,
        bytes32 recordHash,
        uint256 timestamp
    ) {
        require(id < events.length, "Invalid id");
        EventRecord memory e = events[id];
        return (e.actor, e.actionType, e.animalId, e.recordHash, e.timestamp);
    }
}
