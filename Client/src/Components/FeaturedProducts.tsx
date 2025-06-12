import React, { JSX, useState, useContext } from 'react';
import {
  Card,
  Button,
  Tag,
  Spin,
  Rate,
  Typography,
  Space,
  Flex,
  Image
} from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {toast} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const { Title, Text, Paragraph } = Typography;

interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
  rating?: number;
}

interface FeaturedProductsProps {
  featuredProducts: Product[];
  categoryDiscounts: { [key: string]: number };
  calculateDiscountedPrice: (originalPrice: number, category: string) => number;
  renderStarRating: (rating: number) => JSX.Element;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  featuredProducts,
  categoryDiscounts,
  calculateDiscountedPrice
}) => {
  const [addingToCart, setAddingToCart] = useState<{ [key: number]: boolean }>({});
  const auth = useContext(AuthContext);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const addToCart = async (product: Product) => {
    if (!auth?.isAuthenticated) {
      toast.error("You need to login to add items to cart");
      return;
    }

    try {
      setAddingToCart(prev => ({ ...prev, [product.id]: true }));

      const cartItem = {
        name: product.name,
        image: product.image,
        category: product.category,
        description: product.description,
        quantity: 1,
        original_price: product.price,
        discount_price: calculateDiscountedPrice(product.price, product.category)
      };

      const response = await axios.post(`${backendUrl}/api/cart/add_item`, cartItem);
      toast.success(response.data.message || "Item added to cart successfully");

      if (window.updateCartCount) {
        window.updateCartCount();
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        toast.info(error.response.data.message || "Item already exists in cart");
      } else {
        toast.error("Failed to add item to cart");
      }
      console.error("Error adding item to cart:", error);
    } finally {
      setAddingToCart(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const CustomCard = ({ product, index }: { product: Product; index: number }) => (
    <Card
      key={`${product.id}-${index}`}
      className="mx-2 shadow-sm product-card"
      style={{
        minWidth: '300px',
        maxWidth: '300px',
        borderRadius: '10px',
        marginLeft: '8px',
        marginRight: '8px',
        border: 'none',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}
      cover={
        <div style={{ position: 'relative' }}>
          <Image
            src={product.image}
            alt={product.name}
            style={{
              width: "301px",
              height: "200px",
              borderRadius: "10px 10px 0px 0px",
              objectFit: "cover"
            }}
            preview={false}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxY4Q0IsRXhSI7d2MFOyMkmwg40smBHMilksoPsCEcSj+QIY9Y4C2Ix8+8//9nv+4U9M93v+2xPV93q6qmp7vfkr3/8e5m8PD3oVJJ5pNO6/nZqC1xN14Xev4pGmTgn55kS9VD//cqnVi5jzWzBVqjNMG3lVFIWQnOkUIg6hqgfukcfwUEn3kUV9w6VfPpYI/8lJlF6HZAhIxeIczf+X13V4xO8JcjOdZ+k5d6/JdPLu4o2nX9L0dIjZedUOZNO1e8hm2k5eBUdFgRAaVJMqzq73Z1dNYGvdtZHFv0aQs9PRBk+3Rak1zxVl9urULdDa2Z/YWdmFsGX4G7H5q4S1t4iEKGYGGpXh1Nnf4J3Tl4jHTpV4xMDAaWl0n8J5HlhCkx1+j3k1pfk0pPE8dLZn8pYN+xOHN2lQPMR8W7HGFLRJoOTh/5L8PZGaKR/4m4vQiHrrE+w5lNJOj0bIo75RgAAPAwBAAAPgwBAwMgQADBhJAlEhNL5nqo4xYRg0mOIKwQRADBdcowWBOlGGWPLCABYCYzI7DjHBOEKKz+fAZyNbq5zABfRBqYBZFOdlAEGOcIVaJlyCgIABUaFGOPGYBxhZjZfmBOEUNIhcM2aCuFNiOJOgVE2dkGhxBVJkFJSJTUfMG3VcvzWnxZF5VxKoQCfzJDEoBBteCbACSLJJmVfvqrLNvKLAPDfnUqB3xSTsQkgjKxJAhAbQiOcBJdSNTvtLl2TJZWvH11VfZxZ9wIAMkhP/9dqrNPNNb+jmL4xTGI2B3i8MXiWsJhHObOQzIKQHJHFoZiC7HKnGj3+p35ypY9zRiEQ5nKATpU9mVLNBrOQJoIQHF+kF3WZmNk0pOlhKIRO1eCmFoTLaQghSrWh1G3k4G1JRCgIhSjBcpCQnZWYKjAFY1Oqh6JwqQyHJAh8YHUxxrZQCJLF+AwqIK4Q2oy7KAMXkpF1U+Pu6hQg4U6OhLmFa3f5NkQchIFJgXJiUQgOdNZMFa0tCGoFpLCBHJVz6YHr7C+LLZwNxBCUUcL6ELPrV4kDYSPh0qCZwLqaArSTJoSgWArExUON0qgZaLQMdqcHVKJOBCGQEkS8U1LHAMw1TaOTAoNM4QwjqJ6BmjQ3Gs8bO3mUSDWFDBv5r6ZTGV3UhCq/CjSHgbHOLCzAPJsGAwpFGEQCONVgW7jk3lq5WJjJAAAKE3SAu2tLDQHqDAr8ZJ6UPJbwOhGpEAjlTDpRIgJ4w4y1gUPK+4sAACjsAq2UdaFaOqD9xLxTwRSjKPe2wAAAABJRU5ErkJggg=="
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.style.display = 'none';
            }}
          />
          {categoryDiscounts[product.category] && (
            <div
              style={{
                position: 'absolute',
                top: '10px',
                right: '-8px',
                backgroundColor: '#dc3545',
                color: 'white',
                padding: '5px 15px 5px 10px',
                fontWeight: 'bold',
                clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 10% 50%)',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}
            >
              {categoryDiscounts[product.category]}% OFF
            </div>
          )}
        </div>
      }
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <Tag 
              color="green"
              style={{ 
                fontSize: '12px',
                padding: '2px 8px'
              }}
            >
              {product.category}
            </Tag>
        <Title
          level={5}
          style={{
            // marginBottom: 'px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: '16px',
            fontWeight: 500,
            margin: 0
          }}
        >
          {product.name}
        </Title>

        <Flex align="center" gap={4}>
          <Rate
            disabled
            allowHalf
            value={product.rating || 0}
            style={{ fontSize: '14px' }}
          />
          <Text style={{ fontSize: '12px', color: '#666' }}>
            ({product.rating ? product.rating.toFixed(1) : '0.0'})
          </Text>
        </Flex>

        <Paragraph
          ellipsis={{ rows: 1 }}
          style={{
            color: '#666'
          }}
        >
          {product.description}
        </Paragraph>

        <Flex justify="space-between" align="center">
          {categoryDiscounts[product.category] ? (
            <Flex align="center" gap={4}>
              <Text
                strong
                style={{
                  color: '#52c41a',
                  fontSize: '16px'
                }}
              >
                ₹ {calculateDiscountedPrice(product.price, product.category).toFixed(2)}
              </Text>
              <Text
                delete
                style={{
                  color: '#999',
                  fontSize: '12px'
                }}
              >
                ₹ {product.price.toFixed(2)}
              </Text>
            </Flex>
          ) : (
            <Text
              strong
              style={{
                color: '#52c41a',
                fontSize: '16px'
              }}
            >
              ₹ {product.price.toFixed(2)}
            </Text>
          )}

          <Button
            type="primary"
            size="small"
            style={{
              backgroundColor: '#52c41a',
              borderColor: '#52c41a'
            }}
            onClick={() => addToCart(product)}
            disabled={addingToCart[product.id]}
            icon={addingToCart[product.id] ?
              <Spin size="small" /> :
              <ShoppingCartOutlined />
            }
          >
            {addingToCart[product.id] ? 'Adding...' : 'Add Item'}
          </Button>
        </Flex>
      </Space>
    </Card>
  );

  return (
    <>
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Title level={2} className="section-title" style={{ margin: 0 }}>
            Featured Products
          </Title>
        </div>

        <div
          className="marquee-container"
          style={{
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <Flex
            className="marquee-content"
            wrap={false}
          >
            {[...featuredProducts, ...featuredProducts].map((product, index) => (
              <CustomCard
                key={`${product.id}-${index}`}
                product={product}
                index={index}
              />
            ))}
          </Flex>
        </div>
      </div>
    </>
  );
};

export default FeaturedProducts;