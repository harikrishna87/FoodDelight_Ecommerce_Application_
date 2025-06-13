import React, { useState, useContext } from 'react';
import { Row, Col, Card, Button, Alert, Tag, Pagination, Typography, Spin, message } from 'antd';
import { SearchOutlined, ShoppingCartOutlined, CloseOutlined, StarFilled, StarOutlined } from '@ant-design/icons';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import AuthModal from "../Components/AuthModal"

const { Title, Text } = Typography;

interface Product {
  id: number;
  name: string
  description: string;
  image: string;
  price: number;
  category: string;
  rating?: number;
}

interface ProductSelectionProps {
  selectedProducts: Product[];
  selectedCategory: string | null;
  resetCategoryFilter: () => void;
  categoryDiscounts: { [key: string]: number };
  currentPage: number;
  paginate: (pageNumber: number) => void;
  filteredProducts: Product[];
  productsPerPage: number;
}

const ProductSelection: React.FC<ProductSelectionProps> = ({
  selectedProducts,
  selectedCategory,
  resetCategoryFilter,
  categoryDiscounts,
  currentPage,
  paginate,
  filteredProducts,
  productsPerPage
}) => {
  const [addingToCart, setAddingToCart] = useState<{ [key: number]: boolean }>({});
  const [messageApi, contextHolder] = message.useMessage();
  const auth = useContext(AuthContext);

  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const calculateDiscountedPrice = (originalPrice: number, category: string) => {
    const discountPercentage = categoryDiscounts[category];
    if (!discountPercentage) return originalPrice;
    return originalPrice - (originalPrice * (discountPercentage / 100));
  };

  const addToCart = async (product: Product) => {
    if (!auth?.isAuthenticated) {
      setShowAuthModal(true);
      setIsLoginMode(true);
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
        discount_price: calculateDiscountedPrice(product.price, product.category),
      };

      const response = await axios.post(`${backendUrl}/api/cart/add_item`, cartItem, {
        withCredentials: true
      });
      messageApi.success({
        content: response.data.message || "Item added to cart successfully",
        duration: 3,
        style: {
          marginTop: '10vh',
        },
      });
      if ((window as any).updateCartCount) {
        (window as any).updateCartCount();
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        messageApi.info({
          content: error.response.data.message || "Item already exists in cart",
          duration: 3,
          style: {
            marginTop: '10vh',
          },
        });
      } else {
        messageApi.error({
          content: "Failed to add item to cart",
          duration: 3,
          style: {
            marginTop: '10vh',
          },
        });
      }
      console.error("Error adding item to cart:", error);
    } finally {
      setAddingToCart(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const renderStarRating = (rating: number) => {
    const safeRating = Math.min(5, Math.max(0, rating || 0));
    const fullStars = Math.floor(safeRating);
    const hasHalfStar = (safeRating % 1) >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div style={{ color: '#faad14', marginBottom: '8px' }}>
        {Array.from({ length: fullStars }, (_, i) => (
          <StarFilled key={`full-${i}`} />
        ))}
        {hasHalfStar && <StarFilled style={{ clipPath: 'inset(0 50% 0 0)' }} />}
        {Array.from({ length: emptyStars }, (_, i) => (
          <StarOutlined key={`empty-${i}`} />
        ))}
        <span style={{ color: '#8c8c8c', marginLeft: '4px' }}>({safeRating.toFixed(1)})</span>
      </div>
    );
  };

  const truncateDescription = (description: string | undefined | null) => {
    if (!description) return "";

    const maxLength = 80;
    if (description.length <= maxLength) {
      return description;
    }
    return `${description.substring(0, maxLength)}...`;
  };

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const showPagination = selectedCategory && filteredProducts.length > productsPerPage && totalPages > 1;

  return (
    <div style={{ marginBottom: '3rem' }}>
      {contextHolder}

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <Title level={2} className="section-title">
          {selectedCategory ? `${selectedCategory} Products` : 'Our Selection'}
        </Title>
        {selectedCategory && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="default"
              size="small"
              icon={<CloseOutlined />}
              onClick={resetCategoryFilter}
              style={{ borderColor: '#52c41a', color: '#52c41a' }}
            >
              Clear Filter
            </Button>
          </div>
        )}
      </div>

      {selectedProducts.length > 0 ? (
        <>
          <Row gutter={[16, 16]}>
            {selectedProducts.map(product => (
              <Col xs={24} sm={12} md={12} lg={8} xl={6} key={product.id}>
                <Card
                  hoverable
                  style={{
                    height: '100%',
                    borderRadius: '10px',
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                  bodyStyle={{ padding: '16px' }}
                  cover={
                    <div style={{ position: 'relative' }}>
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          height: '180px',
                          width: '100%',
                          objectFit: 'cover',
                          borderTopLeftRadius: '10px',
                          borderTopRightRadius: '10px'
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.style.display = 'none';
                        }}
                      />
                      {categoryDiscounts[product.category] && (
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          right: '-8px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          padding: '5px 15px 5px 10px',
                          fontWeight: 'bold',
                          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 10% 50%)',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                        }}>
                          {categoryDiscounts[product.category]}% OFF
                        </div>
                      )}
                    </div>
                  }
                >
                  <Tag color="success" style={{ marginBottom: '8px' }}>
                    {product.category}
                  </Tag>
                  <Title
                    level={5}
                    style={{
                      margin: '0 0 8px 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {product.name || 'Unnamed Product'}
                  </Title>
                  {renderStarRating(product.rating || 0)}
                  <Text
                    type="secondary"
                    style={{
                      fontSize: '14px',
                      display: 'block',
                      marginBottom: '12px'
                    }}
                  >
                    {truncateDescription(product.description)}
                  </Text>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    {categoryDiscounts[product.category] ? (
                      <div>
                        <span style={{
                          fontWeight: 'bold',
                          color: '#52c41a',
                          marginRight: '8px'
                        }}>
                          ₹ {calculateDiscountedPrice(product.price, product.category).toFixed(2)}
                        </span>
                        <span style={{
                          color: '#8c8c8c',
                          textDecoration: 'line-through',
                          fontSize: '14px'
                        }}>
                          ₹ {product.price.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
                        ₹ {product.price.toFixed(2)}
                      </span>
                    )}
                    <Button
                      type="primary"
                      size="small"
                      style={{
                        backgroundColor: '#52c41a',
                        borderColor: '#52c41a',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      onClick={() => addToCart(product)}
                      disabled={addingToCart[product.id]}
                      icon={addingToCart[product.id] ? <Spin size="small" /> : <ShoppingCartOutlined />}
                    >
                      {addingToCart[product.id] ? 'Adding...' : 'Add Item'}
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {showPagination && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
              <Pagination
                current={currentPage}
                total={filteredProducts.length}
                pageSize={productsPerPage}
                onChange={paginate}
                showSizeChanger={false}
                showQuickJumper={false}
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`
                }
              />
            </div>
          )}
        </>
      ) : (
        <Alert
          message="No products found in this category. Please try another category or check back later."
          type="info"
          showIcon
          icon={<SearchOutlined />}
          style={{
            backgroundColor: 'rgba(82, 196, 26, 0.1)',
            border: '1px solid rgba(82, 196, 26, 0.25)',
            borderRadius: '6px'
          }}
        />
      )}
      <AuthModal
        show={showAuthModal}
        onHide={() => setShowAuthModal(false)}
        isLoginMode={isLoginMode}
        onToggleMode={() => setIsLoginMode(prev => !prev)}
      />
    </div>
  );
};

export default ProductSelection;