//const { tasks } = require("hardhat");
const { task } = require("hardhat/config");
//const hre = require("hardhat");

require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
require("solidity-coverage");
require("./tasks/changeOwner");
require("./tasks/addVoting");
require("./tasks/finishVoting");
require("./tasks/viewVoting");
require("./tasks/withdrawCommission");


module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 13137
    },
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}`,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  plugins: ["solidity-coverage"],
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
    tasks: "./tasks"
  },
  mocha: {
    timeout: 40000
  }
};