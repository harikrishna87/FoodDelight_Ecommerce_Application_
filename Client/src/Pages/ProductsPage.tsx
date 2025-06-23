
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Table,
    Button,
    Input,
    Modal,
    InputNumber,
    Select,
    Card,
    Row,
    Col,
    Space,
    Image,
    Rate,
    Popconfirm,
    message,
    Tag,
    Typography,
    Spin,
    Layout
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    ShoppingCartOutlined,
    AppstoreOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;
const { Content } = Layout;

interface Rating {
    rate: number;
    count: number;
}

interface Product {
    _id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    image: string;
    rating: Rating;
}

interface Category {
    name: string;
    count: number;
}

interface FormData {
    title?: string;
    description?: string;
    price?: number;
    category?: string;
    image?: string;
    rate?: number;
    count?: number;
}

interface ApiResponse {
    products?: Product[];
    data?: Product[];
    result?: Product[];
    items?: Product[];
}

const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        if (error.response?.status === 500) {
            return 'Server error. Please try again later.';
        } else if (error.response?.status === 404) {
            return 'Resource not found. It may have been deleted.';
        } else if (error.response?.status === 400) {
            return 'Invalid data. Please check all fields.';
        } else if (error.response?.data?.message) {
            return error.response.data.message;
        }
    } else if (error instanceof Error) {
        if (error.message?.includes('Network Error')) {
            return 'Network error. Please check your connection and try again.';
        }
        return error.message;
    } else if (typeof error === 'string') {
        return error;
    }

    return 'An unexpected error occurred. Please try again.';
};

const ProductsPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<FormData>({});
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [tableLoading, setTableLoading] = useState<boolean>(false);
    const pageSize: number = 10;

    const [messageApi, contextHolder] = message.useMessage();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const fetchProducts = async (): Promise<void> => {
        try {
            setLoading(true);
            messageApi.loading({ content: 'Loading products...', key: 'loading' });

            const response = await axios.get<ApiResponse | Product[]>(`${backendUrl}/api/products/getallproducts`);

            let fetchedProducts: Product[] = [];

            if (Array.isArray(response.data)) {
                fetchedProducts = response.data;
            } else if (response.data && typeof response.data === 'object') {
                const apiResponse = response.data as ApiResponse;
                fetchedProducts = apiResponse.products || apiResponse.data || apiResponse.result || apiResponse.items || [];
            }

            if (!Array.isArray(fetchedProducts)) {
                console.error('API response is not an array:', response.data);
                messageApi.error({
                    content: 'Invalid data format received from server',
                    key: 'loading',
                    style: {
                        marginTop: '10vh',
                    },
                });
                return;
            }

            const shuffledProducts = shuffleArray(fetchedProducts);
            setProducts(shuffledProducts);
            setFilteredProducts(shuffledProducts);

            const categoryCount: { [key: string]: number } = {};
            shuffledProducts.forEach((product: Product) => {
                if (product.category) {
                    categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
                }
            });

            const categoryData: Category[] = Object.entries(categoryCount).map(([name, count]) => ({
                name,
                count
            }));

            setCategories(categoryData);

            messageApi.success({
                content: `Successfully loaded ${shuffledProducts.length} products`,
                key: 'loading',
                duration: 2,
                style: {
                    marginTop: '10vh',
                },
            });

        } catch (error) {
            console.error('Error fetching products:', error);

            const errorMessage = getErrorMessage(error);
            messageApi.error({
                content: `${errorMessage}`,
                key: 'loading',
                duration: 4,
                style: {
                    marginTop: '10vh',
                },
            });
        } finally {
            setLoading(false);
        }
    };

    const shuffleTableData = () => {
        setTableLoading(true);
        setTimeout(() => {
            const shuffledFiltered = shuffleArray(filteredProducts);
            setFilteredProducts(shuffledFiltered);
            setCurrentPage(1);
            setTableLoading(false);
        }, 500);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        let filtered: Product[] = products;

        if (selectedCategory !== 'all') {
            filtered = filtered.filter((product: Product) => product.category === selectedCategory);
        }

        if (searchTerm) {
            filtered = filtered.filter((product: Product) =>
                (product.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.category || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredProducts(filtered);
        setCurrentPage(1);
    }, [selectedCategory, searchTerm, products]);

    const handleCategoryClick = (categoryName: string): void => {
        setSelectedCategory(categoryName === selectedCategory ? 'all' : categoryName);
    };

    const handleAddProduct = (): void => {
        setEditingProduct(null);
        setFormData({});
        setIsModalVisible(true);
    };

    const handleEditProduct = (product: Product): void => {
        setEditingProduct(product);
        setFormData({
            title: product.title,
            description: product.description,
            price: product.price,
            category: product.category,
            image: product.image,
            rate: product.rating.rate,
            count: product.rating.count
        });
        setIsModalVisible(true);
    };

    const handleDeleteProduct = async (productId: string): Promise<void> => {
        const loadingKey = 'deleting';
        messageApi.loading({ content: 'Deleting product...', key: loadingKey });

        try {
            await axios.delete(`${backendUrl}/api/products/deleteproduct/${productId}`);

            const updatedProducts = products.filter((p: Product) => p._id !== productId);
            setProducts(updatedProducts);

            const updatedFilteredProducts = filteredProducts.filter((p: Product) => p._id !== productId);
            setFilteredProducts(updatedFilteredProducts);

            const categoryCount: { [key: string]: number } = {};
            updatedProducts.forEach((product: Product) => {
                if (product.category) {
                    categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
                }
            });

            const categoryData: Category[] = Object.entries(categoryCount).map(([name, count]) => ({
                name,
                count
            }));
            setCategories(categoryData);

            messageApi.success({
                content: 'Product deleted successfully!',
                key: loadingKey,
                duration: 3,
                style: {
                    marginTop: '10vh',
                },
            });

        } catch (error) {
            console.error('Error deleting product:', error);

            const errorMessage = getErrorMessage(error);
            messageApi.error({
                content: `${errorMessage}`,
                key: loadingKey,
                duration: 4,
                style: {
                    marginTop: '10vh',
                },
            });
        }
    };

    const handleModalOk = async (): Promise<void> => {
        if (!formData.title?.trim()) {
            messageApi.warning({
                content: 'Product title is required',
                style: {
                    marginTop: '10vh',
                },
            });
            return;
        }

        if (!formData.description?.trim()) {
            messageApi.warning({
                content: 'Product description is required',
                style: {
                    marginTop: '10vh',
                },
            });
            return;
        }

        if (!formData.price || formData.price <= 0) {
            messageApi.warning({
                content: 'Please enter a valid price greater than 0',
                style: {
                    marginTop: '10vh',
                },
            });
            return;
        }

        if (!formData.category) {
            messageApi.warning({
                content: 'Please select a product category',
                style: {
                    marginTop: '10vh',
                },
            });
            return;
        }

        if (!formData.image?.trim()) {
            messageApi.warning({
                content: 'Product image URL is required',
                style: {
                    marginTop: '10vh',
                },
            });
            return;
        }

        if (!formData.rate || formData.rate < 0 || formData.rate > 5) {
            messageApi.warning({
                content: 'Please enter a valid rating between 0 and 5',
                style: {
                    marginTop: '10vh',
                },
            });
            return;
        }

        if (!formData.count || formData.count < 0) {
            messageApi.warning({
                content: 'Please enter a valid rating count',
                style: {
                    marginTop: '10vh',
                },
            });
            return;
        }

        if (formData.description && formData.description.length > 100) {
            messageApi.error({
                content: 'Description must be 100 characters or less',
                style: {
                    marginTop: '10vh',
                },
            });
            return;
        }

        const productData = {
            title: formData.title.trim(),
            description: formData.description.trim(),
            price: formData.price,
            category: formData.category,
            image: formData.image.trim(),
            rating: {
                rate: formData.rate,
                count: formData.count
            }
        };

        const loadingKey = 'saving';
        messageApi.loading({ content: editingProduct ? 'Updating product...' : 'Adding product...', key: loadingKey });

        try {
            if (editingProduct && editingProduct._id) {
                await axios.put<Product>(`${backendUrl}/api/products/updateproduct/${editingProduct._id}`, productData);

                const updatedProduct: Product = {
                    ...productData,
                    _id: editingProduct._id
                };

                const updatedProducts = products.map((p: Product) =>
                    p._id === editingProduct._id ? updatedProduct : p
                );
                setProducts(updatedProducts);

                const updatedFilteredProducts = filteredProducts.map((p: Product) =>
                    p._id === editingProduct._id ? updatedProduct : p
                );
                setFilteredProducts(updatedFilteredProducts);

                messageApi.success({
                    content: 'Product updated successfully!',
                    key: loadingKey,
                    duration: 3,
                    style: {
                        marginTop: '10vh',
                    },
                });
            } else {
                const response = await axios.post<Product>(`${backendUrl}/api/products/addproduct`, productData);
                const newProduct = response.data;

                const updatedProducts = [...products, newProduct];
                setProducts(updatedProducts);

                const categoryCount: { [key: string]: number } = {};
                updatedProducts.forEach((product: Product) => {
                    if (product.category) {
                        categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
                    }
                });

                const categoryData: Category[] = Object.entries(categoryCount).map(([name, count]) => ({
                    name,
                    count
                }));
                setCategories(categoryData);

                messageApi.success({
                    content: 'Product added successfully!',
                    key: loadingKey,
                    duration: 3,
                    style: {
                        marginTop: '10vh',
                    },
                });
            }

            setIsModalVisible(false);
            setFormData({});
            setEditingProduct(null);

        } catch (error) {
            console.error('Error saving product:', error);

            const errorMessage = getErrorMessage(error);
            messageApi.error({
                content: `${errorMessage}`,
                key: loadingKey,
                duration: 4,
                style: {
                    marginTop: '10vh',
                },
            });
        }
    };

    const columns: ColumnsType<Product> = [
        {
            title: <span style={{ color: "#52c41a" }}>Image</span>,
            dataIndex: 'image',
            key: 'image',
            width: 100,
            render: (image: string) => (
                <Image
                    width={50}
                    height={50}
                    src={image}
                    style={{ objectFit: 'cover', borderRadius: '4px' }}
                    preview={false}
                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                />
            ),
        },
        {
            title: <span style={{ color: "#52c41a" }}>Name</span>,
            dataIndex: 'title',
            key: 'title',
            width: 200,
            sorter: (a: Product, b: Product) => (a.title || '').localeCompare(b.title || ''),
        },
        {
            title: <span style={{ color: "#52c41a" }}>Price</span>,
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => `₹${(price || 0).toFixed(2)}`,
            sorter: (a: Product, b: Product) => (a.price || 0) - (b.price || 0),
        },
        {
            title: <span style={{color: "#52c41a"}}>Category</span>,
            dataIndex: 'category',
            key: 'category',
            render: (category: string) => (
                <Tag color="cyan">{category}</Tag>
            ),
        },
        {
            title: <span style={{ color: "#52c41a" }}>Description</span>,
            dataIndex: 'description',
            key: 'description',
            width: 200,
            render: (description: string) => (
                <Text ellipsis={{ tooltip: description }} style={{ maxWidth: 200 }}>
                    {description}
                </Text>
            ),
        },
        {
            title: <span style={{ color: "#52c41a" }}>Rating</span>,
            dataIndex: 'rating',
            key: 'rating',
            width: 200,
            render: (rating: Rating) => (
                <Space direction="vertical" size={0}>
                    <Rate disabled defaultValue={rating?.rate || 0} style={{ fontSize: 14 }} />
                    <Text type="secondary" style={{ fontSize: 12 }}>({rating?.count || 0})</Text>
                </Space>
            ),
            sorter: (a: Product, b: Product) => (a.rating?.rate || 0) - (b.rating?.rate || 0),
        },
        {
            title: <span style={{ color: "#52c41a" }}>Actions</span>,
            key: 'actions',
            width: 120,
            render: (_: any, record: Product) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEditProduct(record)}
                        style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                    />
                    <Popconfirm
                        title="Delete Product"
                        description="Are you sure you want to delete this product? This action cannot be undone."
                        onConfirm={() => handleDeleteProduct(record._id)}
                        okText="Yes, Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                        icon={<DeleteOutlined style={{ color: 'red' }} />}
                    >
                        <Button
                            type="primary"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    if (loading) {
        return (
            <Layout style={{ minHeight: '75vh' }}>
                <Content style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '75vh',
                    flexDirection: 'column'
                }}>
                    <Spin size="large" style={{ color: '#52c41a' }} />
                    <Text style={{ marginTop: '16px', color: '#52c41a', fontSize: '18px' }}>Loading products...</Text>
                </Content>
            </Layout>
        );
    }

    return (
        <div style={{ padding: '24px', minHeight: '100vh', maxWidth: 1250, margin: '0 auto' }}>
            {contextHolder}
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <Title level={2} style={{ color: '#52c41a', marginBottom: '8px' }}>
                    <ShoppingCartOutlined /> Available Products in Cart
                </Title>
                <Text type="secondary" style={{ fontSize: '18px' }}>
                    "Quality products, organized by category - your inventory at a glance"
                </Text>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col span={24}>
                    <Card>
                        <Title level={4} style={{ marginBottom: '16px', color: '#52c41a' }}>
                            <AppstoreOutlined /> Categories
                        </Title>
                        <Row gutter={[8, 8]}>
                            <Col key="all-category">
                                <Button
                                    type={selectedCategory === 'all' ? 'primary' : 'default'}
                                    onClick={() => setSelectedCategory('all')}
                                    style={selectedCategory === 'all' ? { backgroundColor: '#52c41a', borderColor: '#52c41a' } : {}}
                                >
                                    All ({products.length})
                                </Button>
                            </Col>
                            {categories.map((category: Category) => (
                                <Col key={`category-${category.name}`}>
                                    <Button
                                        type={selectedCategory === category.name ? 'primary' : 'default'}
                                        onClick={() => handleCategoryClick(category.name)}
                                        style={selectedCategory === category.name ? { backgroundColor: '#52c41a', borderColor: '#52c41a' } : {}}
                                    >
                                        {category.name} ({category.count})
                                    </Button>
                                </Col>
                            ))}
                        </Row>
                    </Card>
                </Col>
            </Row>

            <Card>
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: "5px", flexWrap: 'wrap' }}>
                    <Search
                        placeholder="Search products..."
                        allowClear
                        enterButton={<Button type="primary" style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}>
                            <SearchOutlined />
                        </Button>}
                        size="large"
                        style={{ width: 300 }}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    />
                    <Space>
                        <Button
                            type="default"
                            onClick={shuffleTableData}
                            size="large"
                            style={{ borderColor: '#52c41a', color: '#52c41a' }}
                        >
                            Shuffle
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            size="large"
                            onClick={handleAddProduct}
                            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                        >
                            Add Product
                        </Button>
                    </Space>
                </div>

                <Spin spinning={tableLoading}>
                    <Table
                        columns={columns}
                        dataSource={filteredProducts}
                        rowKey="_id"
                        pagination={{
                            current: currentPage,
                            pageSize: pageSize,
                            total: filteredProducts.length,
                            onChange: (page: number) => setCurrentPage(page),
                            showSizeChanger: false,
                        }}
                        scroll={{ x: 800 }}
                        rowClassName={() => 'ant-table-row-hover'}
                        className="custom-table"
                    />
                </Spin>
            </Card>

            <Modal
                title={
                    <span style={{ color: '#52c41a' }}>
                        {editingProduct ? "Update Product" : "Add New Product"}
                    </span>
                }
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => {
                    setIsModalVisible(false);
                    setFormData({});
                }}
                style={{ color: "#52c41a" }}
                width={600}
                okText={editingProduct ? "Update" : "Add"}
                okButtonProps={{
                    style: { backgroundColor: '#52c41a', borderColor: '#52c41a' }
                }}
            >
                <div style={{ maxHeight: '60vh' }}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Product Title *</label>
                        <Input
                            placeholder="Enter product title"
                            value={formData.title || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Description (Max 100 characters) *</label>
                        <Input.TextArea
                            rows={3}
                            placeholder="Enter product description"
                            showCount
                            maxLength={100}
                            value={formData.description || ''}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <Row gutter={16}>
                        <Col span={12}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Price (₹) *</label>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    step={0.01}
                                    placeholder="295.00"
                                    value={formData.price}
                                    onChange={(value: number | null) => setFormData({ ...formData, price: value || undefined })}
                                />
                            </div>
                        </Col>
                        <Col span={12}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Category *</label>
                                <Select
                                    placeholder="Select category"
                                    style={{ width: '100%' }}
                                    value={formData.category}
                                    onChange={(value: string) => setFormData({ ...formData, category: value })}
                                >
                                    <Option value="NonVeg">NonVeg</Option>
                                    <Option value="Veg">Veg</Option>
                                    <Option value="Desserts">Desserts</Option>
                                    <Option value="IceCream">IceCream</Option>
                                    <Option value="Fruit Juice">Fruit Juice</Option>
                                    <Option value="Pizzas">Pizzas</Option>
                                </Select>
                            </div>
                        </Col>
                    </Row>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Image URL *</label>
                        <Input
                            placeholder="https://example.com/image.jpg"
                            value={formData.image || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, image: e.target.value })}
                        />
                    </div>

                    <Row gutter={16}>
                        <Col span={12}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Rating *</label>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    max={5}
                                    step={0.1}
                                    placeholder="4.1"
                                    value={formData.rate}
                                    onChange={(value: number | null) => setFormData({ ...formData, rate: value || undefined })}
                                />
                            </div>
                        </Col>
                        <Col span={12}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Rating Count *</label>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    placeholder="400"
                                    value={formData.count}
                                    onChange={(value: number | null) => setFormData({ ...formData, count: value || undefined })}
                                />
                            </div>
                        </Col>
                    </Row>
                </div>
            </Modal>
        </div>
    );
}

export default ProductsPage;