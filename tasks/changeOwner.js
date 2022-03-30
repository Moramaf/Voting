const { task } = require("hardhat/config");

task("changeOwner", "change an owner")
.addParam("account", "The account address of new owner")
.setAction(async (taskArgs)=> {
  const Voting = await ethers.getContractFactory("Voting");
  await Voting.changeOwner(taskArgs.account);
  console.log(`new owner ${taskArgs.account}`);
});