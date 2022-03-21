import React, { useState } from "react";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { Button, Form, Row } from "react-bootstrap";
const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

const Create = ({ marketplace, nft }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [price, setPrice] = useState("");

  const uploadToIPFS = async (event) => {
    event.preventDefault();
    const files = event.target.files[0];

    if (typeof files !== "undefined") {
      try {
        const result = await client.add(files);
        console.log(result);
        setImage(`https://ipfs.infura.io/ipfs/${result.path}`);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const createNFT = async () => {
    const mintThenList = async (result) => {
      const uri = `https://ipfs.infura.io/ipfs/${result.path}`;
      await (await nft.mint(uri)).wait();
      const id = await nft.tokenCounter();
      await (await nft.setApprovalForAll(marketplace.address, true)).wait();
      const listingPrice = ethers.utils.parseEther(price.toString());
      await (await marketplace.makeItem(nft.address, id, listingPrice)).wait();
    };

    if (!image || !name || !description || !price) return;
    try {
      const result = await client.add(
        JSON.stringify({ name, description, image, price })
      );
      mintThenList(result);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main
          role="main"
          className="col-lg-12 mx-auto"
          style={{ maxWidth: "1000px" }}
        >
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control type="file" name="file" onChange={uploadToIPFS} />
              <Form.Control
                type="text"
                size="lg"
                placeholder="Name"
                onChange={(e) => setName(e.target.value)}
              />

              <Form.Control
                type="textarea"
                size="lg"
                placeholder="Description"
                onChange={(e) => setDescription(e.target.value)}
              />

              <Form.Control
                type="number"
                size="lg"
                placeholder="Price in ETH"
                onChange={(e) => setPrice(e.target.value)}
              />

              <div className="d-grid px-0">
                <Button onClick={createNFT} variant="primary" size="lg">
                  Create & List NFT
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Create;
