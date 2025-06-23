import React, { useState, useEffect, useContext } from 'react';
import {
    Row,
    Col,
    Card,
    Input,
    Button,
    Pagination,
    Select,
    InputNumber,
    Space,
    Rate,
    Empty,
    Typography,
    Tag,
    message,
    Spin,
    Layout
} from 'antd';
import {
    SearchOutlined,
    FilterOutlined,
    ShopOutlined,
    ShoppingCartOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import 'antd/dist/reset.css';
import { AuthContext } from '../context/AuthContext';
import AuthModal from "../Components/AuthModal";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface Product {
    _id: string;
    title: string;
    price: number;
    description: string;
    category: string;
    image: string;
    rating: {
        rate: number;
        count: number;
    };
}

interface FilterOptions {
    category: string;
    minPrice: number;
    maxPrice: number;
    minRating: number;
}

interface CategoryDiscount {
    [key: string]: number;
}

const SkeletonPulse = ({ height = '20px', width = '100%', className = '', style = {} }) => (
    <div
        className={`skeleton-pulse ${className}`}
        style={{
            height,
            width,
            backgroundColor: '#e8f5e8',
            borderRadius: '6px',
            ...style
        }}
    />
);

const customStyles = `
.product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(25, 135, 84, 0.1) !important;
    transition: all 0.3s ease;
}
.header-ribbon {
    position: relative;
    overflow: hidden;
}
.header-ribbon:before, .header-ribbon:after {
    content: '';
    position: absolute;
    bottom: -10px;
    width: 20px;
    height: 20px;
    z-index: -1;
    background: #52c41a;
    opacity: 0.7;
}
.header-ribbon:before {
    left: -10px;
    border-radius: 0 0 100% 0;
}
.header-ribbon:after {
    right: -10px;
    border-radius: 0 0 0 100%;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
.ant-card-cover img {
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
}
.store-wrapper {
    position: relative;
    overflow: hidden;
}
.store-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px 20px;
}
.decoration-left-bottom {
    position: absolute;
    left: -50px;
    bottom: -50px;
    width: 200px;
    height: 200px;
    opacity: 0.15;
    z-index: -1;
}
.decoration-right-bottom {
    position: absolute;
    right: -50px;
    bottom: -50px;
    width: 220px;
    height: 220px;
    opacity: 0.15;
    z-index: -1;
}
.discount-badge {
    position: absolute;
    top: 10px;
    right: -8px;
    background: #ff4d4f;
    color: white;
    padding: 5px 15px 5px 10px;
    font-weight: bold;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%, 10% 50%);
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    font-size: 12px;
}
.category-badge {
    position: absolute;
    bottom: 8px;
    left: 8px;
}
.filter-panel {
    background: rgba(82, 196, 26, 0.1);
    padding: 24px;
    border-radius: 12px;
    margin-bottom: 24px;
}
.header-section {
    background: rgba(82, 196, 26, 0.1);
    padding: 24px;
    border-radius: 12px;
    margin-bottom: 32px;
    position: relative;
}
.search-section {
    margin-bottom: 24px;
}
.ant-pagination-item-active {
    border-color: #52c41a !important;
    background-color: #52c41a !important;
}
.ant-pagination-item-active a {
    color: white !important;
}
.ant-pagination-item:hover {
    border-color: #52c41a !important;
}
.ant-pagination-item:hover a {
    color: #52c41a !important;
}
@media (max-width: 768px) {
    .store-container {
        padding: 20px 16px;
    }
    .ant-card {
        width: 301px;
        margin: 0 auto;
    }
}
@media (max-width: 1440px) {
    .store-container {
        max-width: 1000px;
    }
}
@media (max-width: 1024px) {
    .store-container {
        max-width: 900px;
    }
}
`;

const shuffleArray = (array: Product[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const Store: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [categories, setCategories] = useState<string[]>([]);
    const [addingToCart, setAddingToCart] = useState<{ [key: string]: boolean }>({}); // Changed key from number to string
    const [filters, setFilters] = useState<FilterOptions>({
        category: '',
        minPrice: 0,
        maxPrice: 1000,
        minRating: 0
    });
    const [messageApi, contextHolder] = message.useMessage();
    const [categoryDiscounts, setCategoryDiscounts] = useState<CategoryDiscount>({});
    const [currentPage, setCurrentPage] = useState<number>(1);
    const productsPerPage = 8;

    const auth = useContext(AuthContext);

    const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
    const [isLoginMode, setIsLoginMode] = useState<boolean>(true);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const styleElement = document.createElement('style');
        styleElement.innerHTML = customStyles;
        document.head.appendChild(styleElement);

        return () => {
            document.head.removeChild(styleElement);
        };
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${backendUrl}/api/products/getallproducts`);
                const shuffledProducts = shuffleArray(response.data.data);

                setProducts(shuffledProducts);
                setFilteredProducts(shuffledProducts);

                const uniqueCategories = [...new Set(response.data.data.map((product: Product) => product.category))] as string[];
                setCategories(uniqueCategories);

                const discounts: CategoryDiscount = {};
                uniqueCategories.forEach(category => {
                    discounts[category] = Math.floor(Math.random() * 30) + 5;
                });

                setCategoryDiscounts(discounts);

                setTimeout(() => {
                    setLoading(false);
                }, 1000);
            } catch (err) {
                console.error('Failed to fetch products:', err);
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        let results = [...products];

        if (searchTerm) {
            results = results.filter(product =>
                product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        if (filters.category) {
            results = results.filter(product => product.category === filters.category);
        }

        results = results.filter(product =>
            product.price >= filters.minPrice && product.price <= filters.maxPrice
        );

        results = results.filter(product => product.rating.rate >= filters.minRating);

        setFilteredProducts(results);
        setCurrentPage(1);
    }, [searchTerm, filters, products]);

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    const handleFilterChange = (name: string, value: any) => {
        if (name === 'minPrice' || name === 'maxPrice' || name === 'minRating') {
            const numValue = value === null || value === undefined ? 0 : parseFloat(value);
            setFilters(prev => ({
                ...prev,
                [name]: numValue
            }));
        } else {
            setFilters(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const addToCart = async (product: Product) => {
        if (!auth?.isAuthenticated) {
            setShowAuthModal(true);
            setIsLoginMode(true);
            return;
        }

        try {
            setAddingToCart(prev => ({ ...prev, [product._id]: true })); // Changed from product.id

            const cartItem = {
                name: product.title,
                image: product.image,
                category: product.category,
                description: product.description,
                quantity: 1,
                original_price: product.price,
                discount_price: calculateDiscountedPrice(product.price, product.category)
            };

            const token = localStorage.getItem('token') || auth?.token;

            const headers: any = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await axios.post(`${backendUrl}/api/cart/add_item`, cartItem, {
                withCredentials: true,
                headers: headers
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
                } else {
                    messageApi.error({
                        content: "Failed to add item to cart",
                        duration: 3,
                        style: {
                            marginTop: '10vh',
                        },
                    });
                }
            } else {
                messageApi.error({
                    content: "Network error. Please try again.",
                    duration: 3,
                    style: {
                        marginTop: '10vh',
                    },
                });
            }
        } finally {
            setAddingToCart(prev => ({ ...prev, [product._id]: false })); // Changed from product.id
        }
    };

    const resetFilters = () => {
        setFilters({
            category: '',
            minPrice: 0,
            maxPrice: 1000,
            minRating: 0
        });
        setSearchTerm('');
    };

    const calculateDiscountedPrice = (originalPrice: number, category: string) => {
        const discountPercentage = categoryDiscounts[category];
        if (!discountPercentage) return originalPrice;
        return originalPrice - (originalPrice * (discountPercentage / 100));
    };

    if (loading) {
        return (
            <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Spin size="large" style={{ color: '#52c41a' }} />
                <Paragraph style={{ marginTop: '16px', color: '#52c41a' }}>Loading your Store Page...</Paragraph>
            </Layout>
        );
    }

    return (
        <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <Content>
                <div className="store-wrapper">
                    <div className="decoration-left-bottom" style={{ display: window.innerWidth > 768 ? 'block' : 'none' }}>
                        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3.61,5.51a15.2,15.2,0,0,1,12.7-1.21c4,1.72,6.3,5.66,8.38,9.47,4.33,7.94,8.64,16,15.73,21.37s17.48,7.35,25.25,2.57c3.8-2.34,6.6-6.07,9-10s4.36-8,7-11.53c10-13.78,32.33-14.35,47.68-5.77,7.56,4.22,14.33,10.86,17.35,19.18s1.79,18.61-5,24c-5.38,4.25-13.12,4.78-19.78,2.66s-12.45-6.59-17.53-11.46C87.86,31.17,71.53,16.84,51.22,13.15c-5.35-1,10.8-1.15,16.22-1.68A92.7,92.7,0,0,1,3.61,5.51Z" transform="translate(6.5 55)" fill="#52c41a" />
                            <path d="M134.89,8.5c6.54,5.11,9.42,14.15,7.46,22.28S133.9,44,126.23,47.52C118.47,51.1,109.52,52.32,101,53.5C79.36,56.59,57.52,59.67,35.81,54.47s-43.54-22.77-44.76-44.71C-10.16-12.32,14.5-28.59,39.5-28c11.75.27,23.43,4.58,30.45,14,8.33,11.18,8.21,27.6,18.61,36.83,7.51,6.67,18.9,7.17,28.16,3.59a31.84,31.84,0,0,0,18.17-17.88" transform="translate(6.5 55)" fill="#52c41a" />
                            <path d="M98,111.39a134.3,134.3,0,0,0-19.42-47C70.79,52.58,58.77,43.81,45.25,39.5C27.51,33.8,7.49,37.75-7.5,45.12" transform="translate(6.5 55)" stroke="#52c41a" strokeMiterlimit="10" strokeWidth="2" />
                        </svg>
                    </div>

                    <div className="decoration-right-bottom" style={{ display: window.innerWidth > 768 ? 'block' : 'none' }}>
                        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M196.39,5.51a15.2,15.2,0,0,0-12.7-1.21c-4,1.72-6.3,5.66-8.38,9.47-4.33,7.94-8.64,16-15.73,21.37s-17.48,7.35-25.25,2.57c-3.8-2.34-6.6-6.07-9-10s-4.36-8-7-11.53c-10-13.78-32.33-14.35-47.68-5.77-7.56,4.22-14.33,10.86-17.35,19.18s-1.79,18.61,5,24c5.38,4.25,13.12,4.78,19.78,2.66s12.45-6.59,17.53-11.46c15.51-14.65,31.84-29,52.15-32.67,5.35-1,10.8-1.15,16.22-1.68A92.7,92.7,0,0,0,196.39,5.51Z" transform="translate(-6.5 55)" fill="#52c41a" />
                            <path d="M65.11,8.5C58.57,13.61,55.69,22.65,57.65,30.78S66.1,44,73.77,47.52C81.53,51.1,90.48,52.32,99,53.5c21.64,3.09,43.48,6.17,65.19,1s43.54-22.77,44.76-44.71C210.16-12.32,185.5-28.59,160.5-28c-11.75.27-23.43,4.58-30.45,14-8.33,11.18-8.21,27.6-18.61,36.83-7.51,6.67-18.9,7.17-28.16,3.59A31.84,31.84,0,0,1,65.11,8.5" transform="translate(-6.5 55)" fill="#52c41a" />
                            <path d="M102,111.39a134.3,134.3,0,0,1,19.42-47c7.79-11.81,19.81-20.58,33.33-24.89,17.74-5.7,37.76-1.75,52.75,5.62" transform="translate(-6.5 55)" stroke="#52c41a" strokeMiterlimit="10" strokeWidth="2" />
                        </svg>
                    </div>

                    <div className="store-container">
                        <div className="header-section" style={{ textAlign: 'center', marginBottom: '40px' }}>
                            <div className="header-ribbon" style={{ position: 'relative' }}>
                                <Title level={2} style={{ color: '#52c41a', margin: 0, fontWeight: 'bold', fontSize: '2em' }}>
                                    For the Love of Delicious Food
                                </Title>
                                <div style={{
                                    position: 'absolute',
                                    left: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)'
                                }}>
                                    <ShopOutlined style={{ color: '#52c41a', opacity: 0.5, fontSize: '24px' }} />
                                </div>
                                <div style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)'
                                }}>
                                    <ShoppingCartOutlined style={{ color: '#52c41a', opacity: 0.5, fontSize: '24px' }} />
                                </div>
                            </div>
                            <Title level={5} style={{
                                textAlign: 'center',
                                margin: '16px 0 0 0',
                                fontStyle: 'italic',
                                color: '#8c8c8c'
                            }}>
                                "Come with family & feel the joy of mouthwatering foods"
                            </Title>
                        </div>

                        <Row gutter={[16, 16]} className="search-section">
                            <Col md={12} xs={24}>
                                <Input.Search
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                    style={{ borderColor: '#52c41a' }}
                                    enterButton={
                                        <Button type="primary" style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}>
                                            <SearchOutlined />
                                        </Button>
                                    }
                                />
                            </Col>
                            <Col md={12} xs={24} style={{ textAlign: 'right' }}>
                                <Button
                                    type="default"
                                    style={{
                                        borderColor: '#52c41a',
                                        color: '#52c41a',
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginLeft: 'auto'
                                    }}
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    <FilterOutlined style={{ marginRight: '8px' }} />
                                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                                </Button>
                            </Col>
                        </Row>

                        {showFilters && (
                            <div className="filter-panel">
                                <Row gutter={[16, 16]}>
                                    <Col md={6} xs={24}>
                                        <div>
                                            <Text strong style={{ color: '#52c41a' }}>Category</Text>
                                            <Select
                                                value={filters.category}
                                                onChange={(value) => handleFilterChange('category', value)}
                                                style={{ width: '100%', marginTop: '8px', borderColor: '#52c41a' }}
                                                placeholder="All Categories"
                                            >
                                                <Option value="">All Categories</Option>
                                                {categories.map((category) => (
                                                    <Option key={category} value={category}>
                                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                                        {categoryDiscounts[category] ? ` (${categoryDiscounts[category]}% OFF)` : ''}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </div>
                                    </Col>
                                    <Col md={6} xs={24}>
                                        <div>
                                            <Text strong style={{ color: '#52c41a' }}>Min Price (₹)</Text>
                                            <InputNumber
                                                min={0}
                                                value={filters.minPrice}
                                                onChange={(value) => handleFilterChange('minPrice', value)}
                                                style={{ width: '100%', marginTop: '8px' }}
                                            />
                                        </div>
                                    </Col>
                                    <Col md={6} xs={24}>
                                        <div>
                                            <Text strong style={{ color: '#52c41a' }}>Max Price (₹)</Text>
                                            <InputNumber
                                                min={0}
                                                value={filters.maxPrice}
                                                onChange={(value) => handleFilterChange('maxPrice', value)}
                                                style={{ width: '100%', marginTop: '8px' }}
                                            />
                                        </div>
                                    </Col>
                                    <Col md={6} xs={24}>
                                        <div>
                                            <Text strong style={{ color: '#52c41a' }}>Min Rating</Text>
                                            <Select
                                                value={filters.minRating}
                                                onChange={(value) => handleFilterChange('minRating', value)}
                                                style={{ width: '100%', marginTop: '8px' }}
                                            >
                                                <Option value={0}>Any Rating</Option>
                                                <Option value={1}>1+ Stars</Option>
                                                <Option value={2}>2+ Stars</Option>
                                                <Option value={3}>3+ Stars</Option>
                                                <Option value={4}>4+ Stars</Option>
                                                <Option value={4.5}>4.5+ Stars</Option>
                                            </Select>
                                        </div>
                                    </Col>
                                    <Col xs={24} style={{ textAlign: 'right', marginTop: '16px' }}>
                                        <Button
                                            type="default"
                                            style={{ borderColor: '#52c41a', color: '#52c41a' }}
                                            onClick={resetFilters}
                                        >
                                            Reset Filters
                                        </Button>
                                    </Col>
                                </Row>
                            </div>
                        )}

                        <div style={{ marginBottom: '24px' }}>
                            <Text type="secondary">
                                {loading ? (
                                    <SkeletonPulse width='200px' height='20px' />
                                ) : (
                                    `Showing ${indexOfFirstProduct + 1}-${Math.min(indexOfLastProduct, filteredProducts.length)} of ${filteredProducts.length} products`
                                )}
                            </Text>
                        </div>

                        <Row gutter={[24, 24]}>
                            {currentProducts.length > 0 ? (
                                currentProducts.map((product) => (
                                    <Col xl={6} lg={8} md={12} sm={12} xs={24} key={product._id}>
                                        <Card
                                            className="product-card"
                                            style={{
                                                height: '100%',
                                                borderRadius: '12px',
                                                border: 'none',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                            }}
                                            cover={
                                                <div style={{ position: 'relative' }}>
                                                    <img
                                                        alt={product.title}
                                                        src={product.image}
                                                        style={{
                                                            height: '180px',
                                                            width: '100%',
                                                            objectFit: 'cover',
                                                            borderTopLeftRadius: '12px',
                                                            borderTopRightRadius: '12px'
                                                        }}
                                                    />
                                                    {categoryDiscounts[product.category] && (
                                                        <div className="discount-badge">
                                                            {categoryDiscounts[product.category]}% OFF
                                                        </div>
                                                    )}
                                                    <div className="category-badge">
                                                    </div>
                                                </div>
                                            }
                                        >
                                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                                <Tag
                                                    color="green"
                                                    style={{
                                                        fontSize: '12px',
                                                        padding: '2px 8px',
                                                        width: "fit-content"
                                                    }}
                                                >
                                                    {product.category}
                                                </Tag>
                                                <Title level={5} style={{ margin: '0 0 8px 0' }} ellipsis>
                                                    {product.title}
                                                </Title>

                                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                    <Rate
                                                        disabled
                                                        value={product.rating.rate}
                                                        style={{ fontSize: '14px' }}
                                                    />
                                                    <Text type="secondary" style={{ marginLeft: '8px', fontSize: '12px' }}>
                                                        ({product.rating.count})
                                                    </Text>
                                                </div>

                                                <Paragraph
                                                    type="secondary"
                                                    style={{ fontSize: '12px', marginBottom: '16px' }}
                                                    ellipsis={{ rows: 2 }}
                                                >
                                                    {product.description || 'No description available'}
                                                </Paragraph>

                                                <div style={{
                                                    marginTop: 'auto',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    <div>
                                                        {categoryDiscounts[product.category] ? (
                                                            <Space>
                                                                <Text strong style={{ color: '#52c41a' }}>
                                                                    ₹ {calculateDiscountedPrice(product.price, product.category).toFixed(2)}
                                                                </Text>
                                                                <Text delete type="secondary" style={{ fontSize: '12px' }}>
                                                                    ₹ {product.price.toFixed(2)}
                                                                </Text>
                                                            </Space>
                                                        ) : (
                                                            <Text strong style={{ color: '#52c41a' }}>
                                                                ₹ {product.price.toFixed(2)}
                                                            </Text>
                                                        )}
                                                    </div>
                                                    <Button
                                                        type="primary"
                                                        size="small"
                                                        icon={<ShoppingCartOutlined />}
                                                        loading={addingToCart[product._id]}
                                                        onClick={() => addToCart(product)}
                                                        style={{
                                                            backgroundColor: '#52c41a',
                                                            borderColor: '#52c41a'
                                                        }}
                                                    >
                                                        Add to Cart
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    </Col>
                                ))
                            ) : (
                                <Col span={24}>
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description="No products found"
                                        style={{ margin: '50px 0' }}
                                    />
                                </Col>
                            )}
                        </Row>

                        {filteredProducts.length > productsPerPage && (
                            <div style={{ textAlign: 'center', marginTop: '40px' }}>
                                <Pagination
                                    current={currentPage}
                                    total={filteredProducts.length}
                                    pageSize={productsPerPage}
                                    onChange={(page) => setCurrentPage(page)}
                                    showSizeChanger={false}
                                    style={{
                                        display: 'inline-block'
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
                {contextHolder}
                <AuthModal
                    show={showAuthModal}
                    onHide={() => setShowAuthModal(false)}
                    isLoginMode={isLoginMode}
                    onToggleMode={() => setIsLoginMode(!isLoginMode)}
                />
            </Content>
        </Layout>
    );
};

export default Store;