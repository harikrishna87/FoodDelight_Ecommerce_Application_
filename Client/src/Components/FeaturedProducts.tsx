import React, { JSX, useState, useContext } from 'react';
import {
  Card,
  Button,
  Tag,
  Spin,
  Typography,
  Space,
  Flex,
  Image,
  message
} from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import AuthModal from "../Components/AuthModal";

const { Title, Text, Paragraph } = Typography;

interface Product {
  _id: string;
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
  calculateDiscountedPrice,
  renderStarRating
}) => {
  const [addingToCart, setAddingToCart] = useState<{ [key: string]: boolean }>({});
  const [messageApi, contextHolder] = message.useMessage();
  const auth = useContext(AuthContext);

  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const addToCart = async (product: Product) => {
    if (!auth?.isAuthenticated || !auth?.user) {
      setShowAuthModal(true);
      setIsLoginMode(true);
      return;
    }

    try {
      setAddingToCart(prev => ({ ...prev, [product._id]: true }));

      const cartItem = {
        product_id: product._id,
        name: product.name,
        image: product.image,
        category: product.category,
        description: product.description,
        quantity: 1,
        original_price: product.price,
        discount_price: calculateDiscountedPrice(product.price, product.category)
      };

      const token = auth.token || localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        withCredentials: true
      };

      const response = await axios.post(`${backendUrl}/api/cart/add_item`, cartItem, config);
      
      messageApi.success({
        content: response.data.message || "Item added to cart successfully",
        duration: 3,
        style: {
          marginTop: '10vh',
        },
      });

      if (typeof (window as any).updateCartCount === 'function') {
        (window as any).updateCartCount();
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          messageApi.error({
            content: "Please login to add items to cart",
            duration: 3,
            style: {
              marginTop: '10vh',
            },
          });
          setShowAuthModal(true);
          setIsLoginMode(true);
        } else if (error.response?.status === 400) {
          messageApi.info({
            content: error.response.data.message || "Item already exists in cart",
            duration: 3,
            style: {
              marginTop: '10vh',
            },
          });
        } else if (error.response?.status === 404) {
          messageApi.error({
            content: "Product not found",
            duration: 3,
            style: {
              marginTop: '10vh',
            },
          });
        } else {
          messageApi.error({
            content: error.response?.data?.message || "Failed to add item to cart",
            duration: 3,
            style: {
              marginTop: '10vh'
            },
          });
        }
      } else {
        messageApi.error({
          content: "Network error. Please try again.",
          duration: 3,
          style: {
            marginTop: '10vh'
          },
        });
      }
    } finally {
      setAddingToCart(prev => ({ ...prev, [product._id]: false }));
    }
  };

  const CustomCard = ({ product, index }: { product: Product; index: number }) => (
    <Card
      key={`${product._id}-${index}`}
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
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
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

        {renderStarRating(product.rating || 0)}

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
            disabled={addingToCart[product._id]}
            icon={addingToCart[product._id] ?
              <Spin size="small" /> :
              <ShoppingCartOutlined />
            }
          >
            {addingToCart[product._id] ? 'Adding...' : 'Add Item'}
          </Button>
        </Flex>
      </Space>
    </Card>
  );

  return (
    <>
      {contextHolder}
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
                key={`${product._id}-${index}`}
                product={product}
                index={index}
              />
            ))}
          </Flex>
        </div>
      </div>
      <AuthModal
        show={showAuthModal}
        onHide={() => setShowAuthModal(false)}
        isLoginMode={isLoginMode}
        onToggleMode={() => setIsLoginMode(prev => !prev)}
      />
    </>
  );
};

export default FeaturedProducts;