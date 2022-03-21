/* eslint-disable no-undef */
import logo from "./logo.png";
import "./App.css";
import { ethers } from "ethers";
import { useState } from "react";
import MarketplaceAbi from "../contractsData/Marketplace.json";
import MarketplaceAddress from "../contractsData/Marketplace-address.json";
import NFTAbi from "../contractsData/NFT.json";
import NFTAddress from "../contractsData/NFT-address.json";
import Navbar from "./Appbar";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Create from "./Create";
import Listeditem from "./Listeditem";
import Mypurchase from "./Mypurchase";
import Home from "./Home";
import { Spinner } from "react-bootstrap";

function App() {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState("");
  const [marketplace, setMarketplace] = useState({});
  const [nft, setNft] = useState({});
  //TODO conncect metamast
  const Web3Handler = async () => {
    const account = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccount(account[0]);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    //todo set singer
    const signer = provider.getSigner();

    loadContracts(signer);
  };

  const loadContracts = async (singer) => {
    // eslint-disable-next-line no-undef
    const marketplace = new ethers.Contract(
      MarketplaceAddress.address,
      MarketplaceAbi.abi,
      singer
    );
    setMarketplace(marketplace);
    const nft = new ethers.Contract(NFTAddress.address, NFTAbi.abi, singer);
    setNft(nft);
    setLoading(false);
  };
  return (
    <BrowserRouter>
      <div className="App">
        <Navbar web3Handler={Web3Handler} account={account} />
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "80vh",
            }}
          >
            <Spinner animation="border" style={{ display: "flex" }} />
            <p className="mx-3 my-0">Awaiting metamask connnection</p>
          </div>
        ) : (
          <Routes>
            <Route
              path="/"
              element={<Home marketplace={marketplace} nft={nft} />}
            />
            <Route
              path="/create"
              element={<Create marketplace={marketplace} nft={nft} />}
            />
            <Route path="/my-listed-items" element={Listeditem} />
            <Route path="/my-purchases" element={Mypurchase} />
          </Routes>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
