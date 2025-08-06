import React from 'react';
import { Row, Col, Card, Button, Typography } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface Product {
  _id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
  rating?: number;
}

interface ProductCategoriesProps {
  products: Product[];
  categoryDiscounts: { [key: string]: number };
  selectedCategory: string | null;
  handleCategoryClick: (category: string) => void;
}

const ProductCategories: React.FC<ProductCategoriesProps> = ({
  products,
  categoryDiscounts,
  selectedCategory,
  handleCategoryClick
}) => {
  return (
    <div style={{ marginBottom: '3rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <Title level={2} className="section-title">Product Categories</Title>
      </div>
      <Row gutter={[16, 16]}>
        {Array.from(new Set(products.map(p => p.category))).map((category) => (
          <Col xs={24} md={8} key={category}>
            <Card
              hoverable
              style={{
                height: '100%',
                cursor: 'pointer',
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                backgroundColor: 'rgba(82, 196, 26, 0.1)',
                border: selectedCategory === category ? '2px dashed #52c41a' : '1px solid #d9d9d9',
                position: 'relative'
              }}
              bodyStyle={{
                textAlign: 'center',
                padding: '1em'
              }}
              onClick={() => handleCategoryClick(category)}
            >
              <Title level={4} style={{ 
                fontWeight: 'bold', 
                color: '#52c41a', 
                marginBottom: '1rem' 
              }}>
                {category}
              </Title>
              <Text style={{ display: 'block', marginBottom: '1rem' }}>
                {products.filter(p => p.category === category).length} items
              </Text>
              <Button 
                type="primary" 
                style={{ 
                  backgroundColor: '#52c41a',
                  borderColor: '#52c41a',
                  paddingLeft: '1rem',
                  paddingRight: '1rem'
                }}
                icon={<ArrowRightOutlined />}
                iconPosition="end"
              >
                View All
              </Button>
              {categoryDiscounts[category] && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}>
                  -{categoryDiscounts[category]}% OFF
                </div>
              )}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ProductCategories;