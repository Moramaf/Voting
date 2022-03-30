const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting", function () {
  let voting;
  const neededSum = "10000000000000000";
  const notEhoughSum = "100000000000000"

  beforeEach(async ()=>{
      [owner, addr1, addr2,addr3, addr4, ...addrs] = await ethers.getSigners();
      const Voting = await ethers.getContractFactory("Voting");
      voting = await Voting.deploy();
      await voting.deployed();
      await voting.addVoting([addr2.address, addr3.address]);
      
  });

  it("Checking owner is changed", async function () {
    await voting.changeOwner(addr1.address);
    expect(await voting.owner()).to.equal(addr1.address);
  });

  it("Checking additing new candidate list", async function (){
    const [candidates, winner] = await voting.viewCompaing(0);
    const [cand1, cand2] = candidates;
    expect(cand1.candidateAddress).to.be.equal(addr2.address);
    expect(cand2.candidateAddress).to.be.equal(addr3.address);
    expect(cand1.voteCount).to.be.equal(ethers.BigNumber.from("0"));
    expect(cand2.voteCount).to.be.equal(ethers.BigNumber.from("0"));
    expect(winner).to.be.equal(ethers.constants.AddressZero);
  });

  it("Vote for candidate from candidate list", async function () {
    await voting.connect(addr4).vote(0, 1, {value: ethers.BigNumber.from(neededSum)});
    const [candidates, winner] = await voting.viewCompaing(0);
    const [cand1, cand2] = candidates;
    expect(cand2.voteCount).to.be.equal(ethers.BigNumber.from("1"));
  });

  it("Revert not enough ether require", async function () {
    await expect(voting.connect(addr4).vote(0, 0, {value: ethers.BigNumber.from(notEhoughSum)})).to.be.revertedWith('Send more ether!');
  });

  it("Revert voter has already voted", async function () {
    await await voting.connect(addr4).vote(0, 1, {value: ethers.BigNumber.from(neededSum)});;
    await expect(voting.connect(addr4).vote(0, 1, {value: ethers.BigNumber.from(neededSum)})).to.be.revertedWith("Already voted.");
  });

  it("vote is adding commision and pool", async function () {
    await voting.connect(addr4).vote(0, 1, {value: ethers.BigNumber.from(neededSum)});
    let firstCompaign = await voting.campaigns(0);
    expect(await firstCompaign.poolToWin).to.be.equal(ethers.BigNumber.from("9000000000000000"));
    expect(await firstCompaign.commission).to.be.equal(ethers.BigNumber.from("1000000000000000"));
  });

  it("Revert if lockup operiod hasn't ended", async function () {
    await expect(voting.finishCompaign(0)).to.be.revertedWith('Compaign is not over!');
  });

  it("the vote can be finished", async function () {
    await voting.connect(addr4).vote(0, 1, {value: ethers.BigNumber.from(neededSum)});
    const roundTime = 3 * 24 * 60 * 60; //3 дня
    await network.provider.send("evm_increaseTime", [roundTime]);
    await network.provider.send("evm_mine");
    await voting.connect(addr4).finishCompaign(0);
    let firstCompaign = await voting.campaigns(0);
    expect(await firstCompaign.isVotingCampaignEnded).to.be.equal(true);
    expect(await firstCompaign.winningAddress).to.be.equal(addr3.address);
    

  });

  it("revert campaign has been ended!", async function () {
    await voting.connect(addr4).vote(0, 1, {value: ethers.BigNumber.from(neededSum)});
    const roundTime = 3 * 24 * 60 * 60; //3 дня
    await network.provider.send("evm_increaseTime", [roundTime]);
    await network.provider.send("evm_mine");
    await voting.connect(addr4).finishCompaign(0);
    await expect(voting.connect(addr4).finishCompaign(0)).to.be.revertedWith("Campaign has been ended!");

  });

  it("commission withdraw to owner", async function () {
    await voting.connect(addr4).vote(0, 1, {value: ethers.BigNumber.from(neededSum)});
    await voting.commissionWithdraw(0);
    let firstCompaign = await voting.campaigns(0);
    expect(await firstCompaign.commission).to.be.equal("0");
  });

});