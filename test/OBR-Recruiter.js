const {
  time, impersonateAccount
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { parseEther, formatEther, defaultAbiCoder } = ethers.utils;

const LRT = "0xE95412D2d374B957ca7f8d96ABe6b6c1148fA438";
const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const BUSD = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
const CZUSD = "0xE68b79e51bf826534Ff37AA9CeE71a3842ee9c70";
const PCS_ROUTER = "0x10ED43C718714eb63d5aA57B78B54704E256024E";



describe("OneBadRabbitRecruiter", function () {
  let owner, trader, trader1, trader2, trader3;
  let pcsRouter, lrt, obr, obrSale;
  before(async function() {
    [owner, trader, trader1, trader2, trader3] = await ethers.getSigners();
    
    lrt = await ethers.getContractAt("LuckyRabbitToken", LRT);
    pcsRouter = await ethers.getContractAt("IAmmRouter02", PCS_ROUTER);
    
    const OneBadRabbit = await ethers.getContractFactory("OneBadRabbit");
    obr = await OneBadRabbit.deploy();
    await obr.deployed();

    const OneBadRabbitRecruiter = await ethers.getContractFactory("OneBadRabbitRecruiter");
    obrRecruiter = await OneBadRabbitRecruiter.deploy(obr.address);
    await obrRecruiter.deployed();

    await obr.grantRole(ethers.utils.id("RECRUITER_ROLE"),obrRecruiter.address)
  });
  it("Should deploy OneBadRabbitRecruiter", async function() {
    const totalSupply = await obr.totalSupply();
    const totalRecruited = await obrRecruiter.totalRecruited();
    expect(totalSupply).to.eq(0);
    expect(totalRecruited).to.eq(totalRecruited);
  });
  it("Should revert before start epoch set", async function() {
    await expect(obrRecruiter.recruitBadRabbit()).to.be.revertedWith("OBR: Recruitment not open");
  });
  it("Should revert before start epoch begun", async function() {
    const currentTime = await time.latest();
    await obrRecruiter.setWhitelistStartEpochAndDuration(currentTime +86400,currentTime + 2*86400);
    await expect(obrRecruiter.recruitBadRabbit()).to.be.revertedWith("OBR: Recruitment not open");
  });
  it("Should revert if not on whitelist before public sale", async function() {
    await time.increase(1*86400);
    await expect(obrRecruiter.connect(trader).recruitBadRabbit()).to.be.revertedWith("OBR: Not whitelist eligible");
  });
  it("Should revert if not enough LRT", async function() {
    await obrRecruiter.setWhitelistedAll([trader.address]);
    await expect(obrRecruiter.connect(trader).recruitBadRabbit()).to.be.revertedWith("OBR: Not enough LRT");
  });
  it("Should recruit max 2 rabbits during whitelist period", async function() {
    await pcsRouter.connect(trader).swapExactETHForTokensSupportingFeeOnTransferTokens(
    0,
    [WBNB,BUSD,CZUSD,LRT],
    trader.address,
    2000000000,
    {value:parseEther("5")}
    );
    const initialTraderLrtBal = await lrt.balanceOf(trader.address);
    await lrt.connect(trader).approve(obrRecruiter.address,parseEther("10000"));
    await obrRecruiter.connect(trader).recruitBadRabbit();
    await obrRecruiter.connect(trader).recruitBadRabbit();
    const finalTraderLrtBal = await lrt.balanceOf(trader.address);
    const traderBadRabbits = await obr.balanceOf(trader.address);
    await expect(obrRecruiter.connect(trader).recruitBadRabbit()).to.be.revertedWith("OBR: Not whitelist eligible");
    expect(initialTraderLrtBal.sub(finalTraderLrtBal)).to.eq(parseEther("50"));
    expect(traderBadRabbits).to.eq(2);
  });
  it("Should recruit no limit during public period", async function() {
    await time.increase(1*86400);
    await pcsRouter.connect(trader1).swapExactETHForTokensSupportingFeeOnTransferTokens(
    0,
    [WBNB,BUSD,CZUSD,LRT],
    trader1.address,
    2000000000,
    {value:parseEther("5")}
    );
    const initialTraderLrtBal = await lrt.balanceOf(trader1.address);
    await lrt.connect(trader1).approve(obrRecruiter.address,parseEther("10000"));
    await obrRecruiter.connect(trader1).recruitBadRabbit();
    await obrRecruiter.connect(trader1).recruitBadRabbit();
    await obrRecruiter.connect(trader1).recruitBadRabbit();
    const finalTraderLrtBal = await lrt.balanceOf(trader1.address);
    const traderBadRabbits = await obr.balanceOf(trader1.address);
    expect(initialTraderLrtBal.sub(finalTraderLrtBal)).to.eq(parseEther("75"));
    expect(traderBadRabbits).to.eq(3);
  });
});