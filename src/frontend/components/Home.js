import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { Button, Card, Col, Row } from "react-bootstrap";

const Home = ({ marketplace, nft }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const loadmarketplaceItems = async () => {
    const itemCount = await marketplace.itemCount();

    for (let i = 0; i < itemCount; i++) {
      const item = await marketplace.getItem(i);
      if (!item.sold) {
        const url = await nft.tokenURI(item.tokenId);

        const response = await fetch(url);
        const metadata = await response.json();
        const totalprice = await marketplace.getTotalPrice(item.itemId);

        items.push({
          totalprice,
          itemId: item.itemId,
          seller: item.seller,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
        });
      }
    }
    setItems(items);
    setLoading(false);
  };

  const buyMarketItem = async (item) => {
    await (
      await marketplace.purchaseItem(item.itemId, { value: item.totalprice })
    ).wait();
    loadmarketplaceItems();
  };

  useEffect(() => {
    loadmarketplaceItems();
  }, []);

  if (loading) {
    return (
      <main style={{ padding: "1rem 8" }}>
        <h2>loading ...</h2>
      </main>
    );
  }
  return (
    <div className="flex justify-centter">
      {items.length > 0
        ? items.map((item) => {
            <div className="px-5 container">
              <Row xs={1} md={2} lg={4} className="g-4 py-5">
                {items.mpa((item, idx) => {
                  <Col key={idx} className="overflow-hidden">
                    <Card>
                      <Card.Img variant="top" src={item.image} />
                      <Card.Body>
                        <Card.Title>{item.name}</Card.Title>
                        <Card.Text>{item.description}</Card.Text>
                      </Card.Body>
                      <Card.Footer>
                        <div className="d-grid">
                          <Button
                            onClick={() => {
                              buyMarketItem(item);
                            }}
                            variant="primary"
                            size="lg"
                          >
                            Buy for {ethers.utils.formatEther(item.totalprice)}{" "}
                            ETH
                          </Button>
                        </div>
                      </Card.Footer>
                    </Card>
                  </Col>;
                })}
              </Row>
            </div>;
          })
        : "No items found"}
    </div>
  );
};

export default Home;
