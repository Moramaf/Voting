const { task } = require("hardhat/config");

task("newVoting", "add new voting compaign")
.addParam("candidatsArr", "Array of all candidates adresses")
.setAction(async (taskArgs)=> {
  const Voting = await ethers.getContractFactory("Voting");
  await Voting.changeOwner(taskArgs.candidatsArr);
  console.log(`You create new voting compaign # ${Voting.campaignId}`);
});