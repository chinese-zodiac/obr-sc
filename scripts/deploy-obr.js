const hre = require("hardhat");
const loadJsonFile = require("load-json-file");

const {ethers} = hre;
const { parseEther } = ethers.utils;

const LRT = "0xE95412D2d374B957ca7f8d96ABe6b6c1148fA438";
const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const BUSD = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
const CZUSD = "0xE68b79e51bf826534Ff37AA9CeE71a3842ee9c70";
const PCS_ROUTER = "0x10ED43C718714eb63d5aA57B78B54704E256024E";

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    
    const OneBadRabbit = await ethers.getContractFactory("OneBadRabbit");
    const obr = await OneBadRabbit.deploy();
    await obr.deployed();
    console.log("OneBadRabbit deployed:",obr.address);

    const OneBadRabbitRecruiter = await ethers.getContractFactory("OneBadRabbitRecruiter");
    obrRecruiter = await OneBadRabbitRecruiter.deploy(obr.address);
    await obrRecruiter.deployed();
    console.log("OneBadRabbitRecruiter deployed:",obrRecruiter.address);
    
    await obr.grantRole(ethers.utils.id("RECRUITER_ROLE"),obrRecruiter.address);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
