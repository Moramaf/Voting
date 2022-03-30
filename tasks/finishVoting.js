const { task } = require("hardhat/config");

task("finishVoting", "finish voting compaign")
.addParam("compaignId", "Id of compaign to finish")
.setAction(async (taskArgs)=> {
  const Voting = await ethers.getContractFactory("Voting");
  await Voting.finishCompaign(taskArgs.compaignId);
  const result = await Voting.finishCompaign(taskArgs.compaignId);
  console.log(`compaign results: ${result}`);
});