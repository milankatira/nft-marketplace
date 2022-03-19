/* eslint-disable jest/valid-expect */
/* eslint-disable jest/valid-describe-callback */
/* eslint-disable no-undef */
const { expect } = require("chai");

// eslint-disable-next-line jest/valid-describe-callback
describe("NFTMarketplace", async function () {
  let deployer, addr1, addr2, nft, marketplace;

  let feePercent = 1;
  beforeEach(async function () {
    const NFT = await ethers.getContractFactory("NFT");
    const Marketplace = await ethers.getContractFactory("Marketplace");
    [deployer, addr1, addr2] = await ethers.getSigners();

    nft = await NFT.deploy();
    marketplace = await Marketplace.deploy(feePercent);
  });

  describe("deploy", async function () {
    it("should trace feeAccount and feePercentage", async function () {
      expect(await marketplace.feeAccount()).to.equal(deployer.address);
      expect(await marketplace.feePercent()).to.equal(feePercent);
    });

    it("should trace name and symbol", async function () {
      expect(await nft.name()).to.equal("DApp NFT");
      expect(await nft.symbol()).to.equal("DAPP");
    });
  });
});
