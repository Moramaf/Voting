const { task } = require("hardhat/config");

task("withdraw", "withdraw Commision to owner address")
.addParam("compainId", "Add Id of voting compaign")
.setAction(async (taskArgs)=> {
  const Voting = await ethers.getContractFactory("Voting");
  await Voting.withdraw(taskArgs.compainId);
  console.log(`Commission has been withdraw from votingID: ${taskArgs.compainId}`);
});