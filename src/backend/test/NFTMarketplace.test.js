/* eslint-disable jest/valid-expect */
/* eslint-disable jest/valid-describe-callback */
/* eslint-disable no-undef */
const { expect } = require("chai");
const toWei = (num) => ethers.utils.parseEther(num.toString());
const fromWei = (num) => ethers.utils.formatEther(num);

// eslint-disable-next-line jest/valid-describe-callback
describe("NFTMarketplace", async function () {
  let deployer, addr1, addr2, nft, marketplace;

  let feePercent = 1;

  let URL = "sample url";
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
      expect(await nft.name()).to.equal("DappNFT");
      expect(await nft.symbol()).to.equal("DAPP");
    });
  });

  describe("minting NFT", async function () {
    it("should track each minted nft", async function () {
      await nft.connect(addr1).mint(URL);
      expect(await nft.tokenCount()).to.equal(1);
      expect(await nft.balanceOf(addr1.address)).to.equal(1);
      expect(await nft.tokenURI(1)).to.equal(URL);

      await nft.connect(addr2).mint(URL);
      expect(await nft.tokenCount()).to.equal(2);
      expect(await nft.balanceOf(addr2.address)).to.equal(1);
      expect(await nft.tokenURI(2)).to.equal(URL);
    });
  });

  describe("making market place items", function () {
    beforeEach(async function () {
      //TODO address1 min an nft
      await nft.connect(addr1).mint(URL);
      //TODO addr1 approves to market place to spend nft
      await nft.connect(addr1).setApprovalForAll(marketplace.address, true);
    });

    it("Should track newly created item, transfer NFT from seller to market place and emit offered event", async function () {
      await expect(
        marketplace.connect(addr1).makeItem(nft.address, 1, toWei(1))
      )
        .to.emit(marketplace, "Offered")
        .withArgs(1, nft.address, 1, toWei(1), addr1.address);

      expect(await nft.ownerOf(1)).to.equal(marketplace.address);
      expect(await marketplace.itemCount()).to.equal(1);

      const item = await marketplace.items(1);

      expect(item.itemId).to.equal(1);
      expect(item.nft).to.equal(nft.address);
      expect(item.tokenId).to.equal(1);
      expect(item.price).to.equal(toWei(1));
      expect(item.sold).to.equal(false);
    });

    it("Should fail if price is set to zero", async function () {
      await expect(
        marketplace.connect(addr1).makeItem(nft.address, 1, 0)
      ).to.be.revertedWith("Price must be greter than zero");
    });
  });

  describe("Purchasing market place item", function () {
    let price = 2;
    beforeEach(async function () {
      //TODO addr1 mint an nft
      await nft.connect(addr1).mint(URL);

      //TODO approve marketplace to spend nft
      await nft.connect(addr1).setApprovalForAll(marketplace.address, true);

      //TODO  makes their nft a marketplace item
      await marketplace.connect(addr1).makeItem(nft.address, 1, toWei(price));
    });

    it("Should update item as sold,pay selle,transfer nft to buyer, change fees and emit a bought event ", async function () {
      const sellerInitialEthBal = await addr1.getBalance();
      const feeAccountInitialEthBal = await deployer.getBalance();

      //total price
      totalPriceInWei = await marketplace.getTotalPrice(1);

      //addr2 purchase item
      await expect(
        marketplace.connect(addr2).purchaseItem(1, { value: totalPriceInWei })
      )
        .to.emit(marketplace, "Bought")
        .withArgs(
          1,
          nft.address,
          1,
          toWei(price),
          addr1.address,
          addr2.address
        );

      const sellerFinalEthBal = await addr1.getBalance();
      const feeAccounFinalEthBal = await deployer.getBalance();

      //todo seller receive payment for the price of the NFT sold.
      expect(+fromWei(sellerFinalEthBal)).to.equal(
        +price + +fromWei(sellerInitialEthBal)
      );

      //todo calculation fee
      const fee = (feePercent / 100) * price;

      //todo feeAccount should receive fee
      expect(+fromWei(feeAccounFinalEthBal)).to.equal(
        +fee + +fromWei(feeAccountInitialEthBal)
      );

      //todo buyer shoulf now own the nft
      expect(await nft.ownerOf(1)).to.equal(addr2.address);

      //Todo item mark as sold
      expect((await marketplace.items(1)).sold).to.equal(true);
    });
    it("Should fail for invalid item ids,sold items and when notv enought rther is paid", async function () {
      await expect(
        marketplace.connect(addr2).purchaseItem(2, { value: totalPriceInWei })
      ).to.be.revertedWith("Item doesn`t exist'");

      await expect(
        marketplace.connect(addr2).purchaseItem(0, { value: totalPriceInWei })
      ).to.be.revertedWith("Item doesn`t exist'");

      await expect(
        marketplace.connect(addr2).purchaseItem(1, { value: toWei(price) })
      ).to.be.revertedWith(
        "not enought ether to cover item price and market fee"
      );
      await marketplace
        .connect(addr2)
        .purchaseItem(1, { value: totalPriceInWei });

      await expect(
        marketplace
          .connect(deployer)
          .purchaseItem(1, { value: totalPriceInWei })
      ).to.be.revertedWith("Item already sold");
    });
  });
});
