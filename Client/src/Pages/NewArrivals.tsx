import { useState, useEffect } from 'react';
import {
    Card,
    Breadcrumb,
    Typography,
    Row,
    Col,
    Space,
    Alert,
    Tag,
    Badge,
    Spin,
    Button,
    Rate
} from 'antd';
import {
    HomeOutlined,
    StarOutlined,
    FireOutlined,
    ClockCircleOutlined,
    EyeOutlined,
    GiftOutlined,
    TrophyOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

const NewArrivals = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    const navigate = useNavigate();

    const handlenavigation = () => {
        navigate('/menu-items')
    }

    const newItems = [
        {
            id: 1,
            name: 'Truffle Mushroom Pizza',
            price: '₹899',
            originalPrice: '₹999',
            rating: 4.8,
            reviews: 127,
            category: 'Pizzas',
            isNew: true,
            isTrending: true,
            description: 'Authentic truffle mushrooms with premium cheese',
            image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop'
        },
        {
            id: 2,
            name: 'Spicy Korean Ramen Bowl',
            price: '₹449',
            originalPrice: '₹549',
            rating: 4.9,
            reviews: 89,
            category: 'NonVeg',
            isNew: true,
            isPopular: true,
            description: 'Authentic Korean flavors with fresh vegetables',
            image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&h=200&fit=crop'
        },
        {
            id: 3,
            name: 'Mediterranean Bowl',
            price: '₹649',
            originalPrice: '₹749',
            rating: 4.7,
            reviews: 203,
            category: 'Veg',
            isNew: true,
            description: 'Fresh quinoa, olives, and feta cheese',
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop'
        },
        {
            id: 4,
            name: 'Chocolate Lava Cake',
            price: '₹299',
            originalPrice: '₹349',
            rating: 4.9,
            reviews: 156,
            category: 'Desserts',
            isNew: true,
            isTrending: true,
            description: 'Warm chocolate cake with molten center',
            image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&h=200&fit=crop'
        },
        {
            id: 5,
            name: 'Avocado Toast Deluxe',
            price: '₹399',
            originalPrice: '₹449',
            rating: 4.6,
            reviews: 92,
            category: 'NonVeg',
            isNew: true,
            description: 'Multigrain bread with fresh avocado and toppings',
            image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=300&h=200&fit=crop'
        },
        {
            id: 6,
            name: 'BBQ Chicken Wings',
            price: '₹599',
            originalPrice: '₹699',
            rating: 4.8,
            reviews: 134,
            category: 'NonVeg',
            isNew: true,
            isPopular: true,
            description: 'Smoky BBQ glazed wings with special sauce',
            image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=300&h=200&fit=crop'
        }
    ];

    const categories = [
        { name: 'All', count: newItems.length, color: '#52c41a' },
        { name: 'NonVeg', count: 3, color: '#1890ff' },
        { name: 'Veg', count: 1, color: '#fa8c16' },
        { name: 'Desserts', count: 1, color: '#722ed1' },
        { name: 'Pizzas', count: 1, color: '#eb2f96' },
        // { name: 'Fruit Juice', count: 1, color: '#f5222d' }
    ];

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '75vh',
                flexDirection: 'column',
                backgroundColor: '#f5f5f5'
            }}>
                <Spin size="large" style={{ color: '#52c41a' }} />
                <Paragraph style={{ marginTop: '16px', color: '#52c41a' }}>Loading New Arrivals...</Paragraph>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            <Row justify="center">
                <Col xs={24} sm={24} md={22} lg={20} xl={18}>
                    <Card
                        style={{
                            marginBottom: '24px',
                            borderRadius: '12px'
                        }}
                    >
                        <Breadcrumb
                            items={[
                                {
                                    title: (
                                        <Link to="/">
                                            <Space>
                                                <HomeOutlined />
                                                <span>Home</span>
                                            </Space>
                                        </Link>
                                    ),
                                },
                                {
                                    title: (
                                        <Space>
                                            <StarOutlined />
                                            <span>New Arrivals</span>
                                        </Space>
                                    ),
                                },
                            ]}
                        />
                    </Card>

                    <Card
                        style={{
                            borderRadius: '12px',
                            border: 'none',
                            overflow: 'hidden'
                        }}
                    >
                        <div
                            style={{
                                background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                                color: 'white',
                                padding: '40px 32px',
                                margin: '-24px -24px 32px -24px',
                                textAlign: 'center'
                            }}
                        >
                            <StarOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                            <Title level={1} style={{ color: 'white', margin: 0, fontSize: '32px' }}>
                                New Arrivals
                            </Title>
                            <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', marginBottom: 0, marginTop: '8px' }}>
                                Discover our latest delicious additions to the menu
                            </Paragraph>
                        </div>

                        <div style={{ padding: '0 8px' }}>
                            <Alert
                                message="Fresh & New"
                                description="Explore our newest culinary creations, carefully crafted with the finest ingredients. Be the first to try these amazing dishes!"
                                type="success"
                                icon={<FireOutlined />}
                                showIcon
                                style={{
                                    marginBottom: '32px',
                                    borderRadius: '8px',
                                    backgroundColor: '#f6ffed',
                                    border: '1px solid #b7eb8f'
                                }}
                            />

                            <Card
                                title={
                                    <Space size="middle">
                                        <TrophyOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                                        <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                                            Categories
                                        </Title>
                                    </Space>
                                }
                                style={{ marginBottom: '24px', borderRadius: '8px' }}
                                headStyle={{ backgroundColor: '#f6ffed', borderBottom: '1px solid #d9f7be' }}
                            >
                                <Row gutter={[16, 16]}>
                                    {categories.map((category, index) => (
                                        <Col xs={12} sm={8} md={6} lg={4} key={index}>
                                            <Card
                                                size="small"
                                                hoverable
                                                style={{
                                                    textAlign: 'center',
                                                    borderRadius: '8px',
                                                    borderLeft: `4px solid ${category.color}`,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                <Space direction="vertical" size="small">
                                                    <Text strong style={{ color: category.color }}>
                                                        {category.name}
                                                    </Text>
                                                    <Badge count={category.count} style={{ backgroundColor: category.color }} />
                                                </Space>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </Card>

                            <Card
                                title={
                                    <Space size="middle">
                                        <GiftOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                                        <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                                            Latest Additions
                                        </Title>
                                    </Space>
                                }
                                style={{ marginBottom: '24px', borderRadius: '8px' }}
                                headStyle={{ backgroundColor: '#f6ffed', borderBottom: '1px solid #d9f7be' }}
                            >
                                <Row gutter={[24, 24]}>
                                    {newItems.map((item) => (
                                        <Col xs={24} sm={12} lg={8} key={item.id}>
                                            <Card
                                                hoverable
                                                style={{
                                                    borderRadius: '12px',
                                                    overflow: 'hidden',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                cover={
                                                    <div style={{ position: 'relative' }}>
                                                        <img
                                                            alt={item.name}
                                                            src={item.image}
                                                            style={{
                                                                height: '200px',
                                                                width: '100%',
                                                                objectFit: 'cover'
                                                            }}
                                                        />
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: '12px',
                                                            left: '12px',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: '8px'
                                                        }}>
                                                            {item.isNew && (
                                                                <Tag color="green" style={{ margin: 0 }}>
                                                                    <Space>
                                                                        <ClockCircleOutlined />
                                                                        NEW
                                                                    </Space>
                                                                </Tag>
                                                            )}
                                                            {item.isTrending && (
                                                                <Tag color="red" style={{ margin: 0 }}>
                                                                    <Space>
                                                                        <FireOutlined />
                                                                        TRENDING
                                                                    </Space>
                                                                </Tag>
                                                            )}
                                                            {item.isPopular && (
                                                                <Tag color="orange" style={{ margin: 0 }}>
                                                                    <Space>
                                                                        <StarOutlined />
                                                                        POPULAR
                                                                    </Space>
                                                                </Tag>
                                                            )}
                                                        </div>
                                                    </div>
                                                }
                                            >
                                                <Card.Meta
                                                    title={
                                                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                                            <Text strong style={{ fontSize: '16px' }}>{item.name}</Text>
                                                            <Tag color="cyan" style={{ width: 'fit-content', border:'1px dashed' }}>
                                                                {item.category}
                                                            </Tag>
                                                        </Space>
                                                    }
                                                    description={
                                                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                                            <Text
                                                                type="secondary"
                                                                style={{
                                                                    fontSize: '14px',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap',
                                                                    display: 'block',
                                                                }}
                                                            >
                                                                {item.description}
                                                            </Text>
                                                            <Space>
                                                                <Rate disabled defaultValue={item.rating} style={{ fontSize: '14px' }} />
                                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                                    ({item.reviews} reviews)
                                                                </Text>
                                                            </Space>
                                                            <Space>
                                                                <Text strong style={{ fontSize: '18px', color: '#52c41a' }}>
                                                                    {item.price}
                                                                </Text>
                                                                <Text delete type="secondary" style={{ fontSize: '14px' }}>
                                                                    {item.originalPrice}
                                                                </Text>
                                                            </Space>
                                                        </Space>
                                                    }
                                                />
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </Card>

                            <div style={{ textAlign: 'center', padding: '24px 0' }}>
                                <Space direction="vertical" size="large">
                                    <Button
                                        type="primary"
                                        size="large"
                                        style={{
                                            backgroundColor: '#52c41a',
                                            borderColor: '#52c41a',
                                            borderRadius: '8px',
                                            padding: '0 40px',
                                            height: '48px',
                                            fontSize: '16px'
                                        }}
                                        onClick={handlenavigation}
                                    >
                                        <Space>
                                            <EyeOutlined />
                                            View All Menu Items
                                        </Space>
                                    </Button>
                                    <Text type="secondary" style={{ fontSize: '14px' }}>
                                        More delicious items are coming soon!
                                    </Text>
                                </Space>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default NewArrivals;