const { expect } = require('chai');
const { ethers } = require('hardhat');
const { collectCompilations } = require('truffle');
const { expectRevert, time } = require('@openzeppelin/test-helpers');


describe('Farm contract', () => {
    
    let Token, lpt, nrfx, MasterShef, mastershef, owner, addr1, addr2;

    beforeEach(async () => {
        
        Token = await ethers.getContractFactory("Token");
        MasterShef = await ethers.getContractFactory("MasterShef");

        nrfx = await Token.deploy('MasterShef', 'NRFX');
        lpt = await Token.deploy('LPToken', 'LPT');
        mastershef = await MasterShef.deploy(nrfx.address, lpt.address);

        [owner, addr1, addr2] = await ethers.getSigners();


    });

    describe("Stake", function () {

      it('Should stake', async () => {

        await lpt.approve(mastershef.address, ethers.utils.parseUnits("50", process.env.TOKEN_DECIMALS));

        await mastershef.stake(ethers.utils.parseUnits("50", process.env.TOKEN_DECIMALS));

        expect(await mastershef.getStakingBalance()).to.equal(ethers.utils.parseUnits("50", process.env.TOKEN_DECIMALS));
      });

      it('Dont have enough tokens', async () => {

        await lpt.connect(addr1).approve(mastershef.address, ethers.utils.parseUnits("50", process.env.TOKEN_DECIMALS));
        await expect(mastershef.connect(addr1).stake(ethers.utils.parseUnits("50", process.env.TOKEN_DECIMALS))).to.be.revertedWith('You dont have enough tokens');

      });

    });

    describe('Claim', () => {

      it('Dont have reward tokens', async () => {

        await expect(mastershef.connect(addr1).claim()).to.be.revertedWith('You dont have reward tokens');

      });

    });

    describe('Stake', () => {

      it('Claim and change apy', async () => {

        //console.log(await nrfx.balanceOf(owner.address));
        
        await nrfx.transfer(mastershef.address, ethers.utils.parseUnits("1000", process.env.TOKEN_DECIMALS));
        await lpt.transfer(addr1.address, ethers.utils.parseUnits("10", process.env.TOKEN_DECIMALS))
        //console.log(await nrfx.balanceOf(owner.address));

        await lpt.connect(addr1).approve(mastershef.address, ethers.utils.parseUnits("10", process.env.TOKEN_DECIMALS));
        await mastershef.connect(addr1).stake(ethers.utils.parseUnits("10", process.env.TOKEN_DECIMALS));

        await time.increase(31536000);

        await mastershef.connect(addr1).claim();

        expect(await nrfx.balanceOf(addr1.address)).to.equal(ethers.utils.parseUnits("40", process.env.TOKEN_DECIMALS));
        expect(await mastershef.apy()).to.equal("384");

      });

    });

    describe('Unstake', () => {

      it('Unstake', async () => {

        await nrfx.transfer(mastershef.address, ethers.utils.parseUnits("1000", process.env.TOKEN_DECIMALS));
        await lpt.transfer(addr1.address, ethers.utils.parseUnits("10", process.env.TOKEN_DECIMALS))
        await lpt.connect(addr1).approve(mastershef.address, ethers.utils.parseUnits("10", process.env.TOKEN_DECIMALS));

        await expect(mastershef.connect(addr1).unstake(ethers.utils.parseUnits("10", process.env.TOKEN_DECIMALS))).to.be.revertedWith('You dont have enough stake tokens');

        await mastershef.connect(addr1).stake(ethers.utils.parseUnits("10", process.env.TOKEN_DECIMALS));

        await time.increase(31536000);
        await mastershef.connect(addr1).claim();

        await mastershef.connect(addr1).unstake(ethers.utils.parseUnits("10", process.env.TOKEN_DECIMALS));

        expect(await lpt.balanceOf(addr1.address)).to.equal(ethers.utils.parseUnits("10", process.env.TOKEN_DECIMALS));
        expect(await lpt.balanceOf(mastershef.address)).to.equal(ethers.utils.parseUnits("0", process.env.TOKEN_DECIMALS));

      });

    });

});