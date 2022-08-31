const {
  time, impersonateAccount
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { parseEther, formatEther, defaultAbiCoder } = ethers.utils;

const LRT = "0xE95412D2d374B957ca7f8d96ABe6b6c1148fA438";



describe("OneBadRabbitRecruiter", function () {
  let owner, trader, trader1, trader2, trader3;
  let lrt, obr, obrSale;
  before(async function() {
    [owner, trader, trader1, trader2, trader3] = await ethers.getSigners();
    
    lrt = await ethers.getContractAt("LuckyRabbitToken", LRT);
    
    const OneBadRabbit = await ethers.getContractFactory("OneBadRabbit");
    obr = await OneBadRabbit.deploy();
    await obr.deployed();

    const OneBadRabbitRecruiter = await ethers.getContractFactory("OneBadRabbitRecruiter");
    obrRecruiter = await OneBadRabbitRecruiter.deploy(obr.address);
    await obrRecruiter.deployed();

    await obr.grantRole(ethers.utils.id("RECRUITER_ROLE"),obrRecruiter.address)
  });
  it("Shoulde deploy OneBadRabbitRecruiter", async function() {
    const totalSupply = await obr.totalSupply();
    const totalRecruited = await obrRecruiter.totalRecruited();
    expect(totalSupply).to.eq(0);
    expect(totalRecruited).to.eq(totalRecruited);
  })
  it("Shoulde revert before start epoch set", async function() {
    await expect(obrRecruiter.recruitBadRabbit()).to.be.revertedWith("OBR: Recruitment not open");
  })
});