const { task } = require("hardhat/config");

task("viewVoting", "view results of voting")
.addParam("compaignId", "Id of compaign to view")
.setAction(async (taskArgs)=> {
  const Voting = await ethers.getContractFactory("Voting");
  await Voting.viewCompaing(taskArgs.compaignId);
  const result = await Voting.viewCompaing(taskArgs.compaignId);
  console.log(`compaign results: ${result}`);
});