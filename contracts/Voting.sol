//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";

contract Voting {

    address public owner;
    uint public constant DURATION = 3 days;
    uint public constant FEE = 10;

    struct Candidate {
        address candidateAddress; 
        uint voteCount; //ammont of votes for candidate
    }

    struct VotingCampaign {
        bool isVotingCampaignEnded; // is voting compaign has been ended?
        Candidate[] candidates; //array of candidates
        uint poolToWin; //ETH pool to win
        uint commission; //contract owner commision
        mapping(address => bool) votersVoted; //mapping if voter has already voted
        address winningAddress;
        uint loocUpTime; //the end of lock up period - 3 days
    }

    uint campaignId; //voting compaing sequence number
    mapping (uint => VotingCampaign) public campaigns; //mapping of all campaigns.

    modifier isOwner() {
       require(msg.sender == owner, "You are not an owner");
        _;
    }

    event OwnerSet(address indexed oldOwner, address indexed newOwner);
    event NewCampaignAdded(uint campaignId);
    event CompaignFinished(uint campaignId, address winner);

    constructor() {
        owner = msg.sender;
        emit OwnerSet(address(0), owner);
    }

    function changeOwner(address newOwner) public isOwner { //basic function for change an owner.
        emit OwnerSet(owner, newOwner);
        owner = newOwner;
    }
    
    function addVoting(address[] memory _candidateAddress) public isOwner { //adding new voting in blockchain
        VotingCampaign storage compaign = campaigns[campaignId]; 
        for (uint i = 0; i < _candidateAddress.length; i++) { //adding array of candidates by loop from function arguments to blockchain Struct storage.
            compaign.candidates.push(Candidate({
                candidateAddress: _candidateAddress[i],
                voteCount: 0
            }));
        }
        compaign.loocUpTime = block.timestamp + DURATION; //calculate the period voting can't be finished
        emit NewCampaignAdded(campaignId);
        campaignId++; //counter increase
    }

    function vote(uint _campaignId, uint voteFor) external payable { //function to vote
        require(msg.value >= .01 ether, "Send more ether!"); //the main condition to vote is to send more then 0.01 ETH
        VotingCampaign storage compaign = campaigns[_campaignId];
        require(!compaign.isVotingCampaignEnded, "Campaign has been ended!"); //check if compaing has been finished.
        require(!compaign.votersVoted[msg.sender], "Already voted."); //check if voter has voted
        compaign.poolToWin += msg.value * 9 / 10; //calculate the wining pool
        compaign.commission += msg.value * FEE / 100; //calculate the owner commission
        compaign.votersVoted[msg.sender] = true; //mark that this voter is voted
        compaign.candidates[voteFor].voteCount++; //add one vote to candidate
    }

    function finishCompaign(uint _campaignId) public returns (address) { //function to finish voting compaign. Everybody can do this after 3 days
        VotingCampaign storage compaign = campaigns[_campaignId];
        require(!compaign.isVotingCampaignEnded, "Campaign has been ended!"); //check if compaing has been already finished.
        require(block.timestamp >= compaign.loocUpTime, "Compaign is not over!"); //check if 3 days over
        uint winningVoteCount = 0; //the maximum votes for a candidate
        uint winingCandidateId; //array position of wining candidate
        for (uint p = 0; p < compaign.candidates.length; p++) { //find the max votes for candidate
            if (compaign.candidates[p].voteCount > winningVoteCount) {
                winningVoteCount = compaign.candidates[p].voteCount;
                winingCandidateId = p;
            }
        }
        compaign.isVotingCampaignEnded = true;
        address winnerAddr = compaign.candidates[winingCandidateId].candidateAddress; //get wiiner address
        payable(winnerAddr).transfer(compaign.poolToWin); //transfer ETH pool to winner
        compaign.poolToWin = 0; // make pool empty
        emit CompaignFinished(_campaignId, winnerAddr);
        compaign.winningAddress = winnerAddr;
        return winnerAddr;
    }

    function commissionWithdraw (uint _campaignId) public isOwner { //withdraw commision to owner
        VotingCampaign storage compaign = campaigns[_campaignId]; 
        payable(owner).transfer(compaign.commission); //transfer commision to owner
        compaign.commission = 0; //make commission empty
    }

    function viewCompaing(uint _campaignId) public view returns(Candidate[] memory, address) {
        return (campaigns[_campaignId].candidates, campaigns[_campaignId].winningAddress); //results getter
    }
}