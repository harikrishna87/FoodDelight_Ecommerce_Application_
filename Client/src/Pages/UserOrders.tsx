import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Layout, Table, Tag, Spin, Alert, Typography, Modal, Button, Descriptions, Space, Tooltip, Row, Col, Card, Pagination, message } from 'antd';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { IOrder, OrderDeliveryStatus } from '../types';
import { CheckCircleOutlined, TruckOutlined, ClockCircleOutlined, EyeOutlined, CalendarOutlined, ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const UserOrders: React.FC = () => {
  const auth = useContext(AuthContext);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [isModalVisible, selectedOrder]);

  const fetchUserOrders = useCallback(async () => {
    if (!auth?.token) {
      setError('You are not logged in.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        withCredentials: true,
      };
      const response = await axios.get(`${backendUrl}/api/orders/myorders`, config);
      if (response.data.success) {
        setOrders(response.data.orders);
        setError(null);
      } else {
        setError(response.data.message || 'Failed to fetch your orders.');
      }
    } catch (err: any) {
      console.error('Error fetching user orders:', err);
      setError(err.response?.data?.message || 'Failed to fetch your orders.');
      messageApi.error({
        content: err.response?.data?.message || 'Failed to fetch your orders.',
        duration: 3,
        style: {
          marginTop: '20vh',
        },
      });
    } finally {
      setLoading(false);
    }
  }, [auth?.token, backendUrl]);

  useEffect(() => {
    fetchUserOrders();
  }, [fetchUserOrders]);

  const showModal = (order: IOrder) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedOrder(null);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getStatusTag = (status: OrderDeliveryStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <Tag color="warning" style={{ borderRadius: '5px', padding: '2px 10px', display: 'flex', alignItems: 'center' }}>
            <ClockCircleOutlined style={{ marginRight: '4px' }} /> Pending
          </Tag>
        );
      case 'Shipped':
        return (
          <Tag color="processing" style={{ borderRadius: '5px', padding: '2px 10px', display: 'flex', alignItems: 'center' }}>
            <TruckOutlined style={{ marginRight: '4px' }} /> Shipped
          </Tag>
        );
      case 'Delivered':
        return (
          <Tag color="success" style={{ borderRadius: '5px', padding: '2px 10px', display: 'flex', alignItems: 'center' }}>
            <CheckCircleOutlined style={{ marginRight: '4px' }} /> Delivered
          </Tag>
        );
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const getStatusBadge = (status: OrderDeliveryStatus) => {
    return getStatusTag(status);
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: '_id',
      key: '_id',
      width: 120,
      render: (id: string) => id,
    },
    {
      title: 'Customer',
      dataIndex: 'user',
      key: 'user',
      width: 180,
      render: (user: any) => (
        <div>
          <div>{user?.name || 'N/A'}</div>
          <div style={{ color: '#6c757d', fontSize: '12px' }}>{user?.email || 'N/A'}</div>
        </div>
      ),
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: (amount: number) => `₹${amount.toFixed(2)}`,
    },
    {
      title: 'Status',
      dataIndex: 'deliveryStatus',
      key: 'deliveryStatus',
      width: 120,
      render: (status: OrderDeliveryStatus) => getStatusBadge(status),
    },
    {
      title: 'Order Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 130,
      render: (date: string) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CalendarOutlined style={{ marginRight: '4px' }} />
          {new Date(date).toLocaleDateString()}
        </div>
      ),
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      width: 100,
      render: (items: any, record: IOrder) => (
        <Button type="link" onClick={() => showModal(record)} style={{ display: 'flex', alignItems: 'center', padding: 0 }}>
          <EyeOutlined /> View Items ({items?.length || 0})
        </Button>
      ),
    },
  ];

  // Calculate pagination for modal items
  const totalItems = selectedOrder?.items?.length || 0;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = selectedOrder?.items?.slice(startIndex, endIndex) || [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
          <Spin size="large" style={{ color: '#28a745' }} />
          <Paragraph style={{ marginTop: '16px', color: '#28a745' }}>Loading your orders...</Paragraph>
        </Content>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ padding: '50px', textAlign: 'center' }}>
          <Alert
            message="Error!"
            description={
              <>
                <Paragraph>{error}</Paragraph>
                <Paragraph>Please ensure you are logged in to view your orders.</Paragraph>
              </>
            }
            type="error"
            showIcon
            style={{ maxWidth: '600px', margin: '0 auto' }}
          />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '75vh' }}>
      <Content style={{
        padding: '20px',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          flexShrink: 0,
          marginBottom: '24px',
          padding: '0 20px'
        }}>
          <Title level={2} style={{ color: '#52c41a', marginBottom: '8px', textAlign: 'center' }}>My Orders</Title>
          <Paragraph style={{ color: '#6c757d', marginBottom: '0', textAlign: 'center', fontSize: "18px" }}>
            View and manage all your placed orders here. Check the status, order details, and items for each order as of {new Date().toLocaleDateString()}.
          </Paragraph>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column'
        }}>
          {orders.length === 0 ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1
            }}>
              <Alert
                message="You have not placed any orders yet."
                type="info"
                showIcon
                style={{ maxWidth: '600px', textAlign: 'center' }}
              />
            </div>
          ) : (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              padding: '20px'
            }}>
              <Table
                columns={columns}
                dataSource={orders}
                rowKey="_id"
                bordered={false}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '30'],
                  style: {
                    margin: '20px 0 0 0',
                    flexShrink: 0
                  },
                }}
                rowClassName={() => 'ant-table-row-hover'}
                className="custom-table"
                scroll={{
                  x: 'max-content'
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column'
                }}
              />
            </div>
          )}
        </div>

        {/* Enhanced Modal matching first code design */}
        {selectedOrder && (
          <Modal
            title={
              <Space>
                <ShoppingCartOutlined />
                <span>Order Details - {isMobile ? selectedOrder._id.substring(0, 6) + '...' : selectedOrder._id}</span>
              </Space>
            }
            open={isModalVisible}
            onCancel={handleCancel}
            footer={null}
            width={isMobile ? '95%' : 800}
            style={isMobile ? { top: 15 } : { top: 15 }}
          >
            <Title level={4} style={{ marginBottom: 16, color: '#52c41a' }}>Customer Details</Title>
            <Descriptions
              bordered
              column={isMobile ? 1 : 2}
              size={isMobile ? 'small' : 'default'}
              style={{ marginBottom: 24 }}
            >
              <Descriptions.Item label="Customer Name">
                <Space>
                  <UserOutlined />
                  {selectedOrder.user?.name || 'N/A'}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Customer Email">
                <Tooltip title={selectedOrder.user?.email || 'N/A'}>
                  <Text>{isMobile ? truncateText(selectedOrder.user?.email || 'N/A', 20) : (selectedOrder.user?.email || 'N/A')}</Text>
                </Tooltip>
              </Descriptions.Item>
            </Descriptions>

            <Title level={4} style={{ marginBottom: 16, color: '#52c41a' }}>Order Information</Title>
            <Descriptions
              bordered
              column={isMobile ? 1 : 2}
              size={isMobile ? 'small' : 'default'}
              style={{ marginBottom: 24 }}
            >
              <Descriptions.Item label="Order ID">
                <Tooltip title={selectedOrder._id}>
                  <Text code>{isMobile ? truncateText(selectedOrder._id, 15) : selectedOrder._id}</Text>
                </Tooltip>
              </Descriptions.Item>
              <Descriptions.Item label="Order Date">
                {new Date(selectedOrder.createdAt).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Total Amount">
                <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
                  ₹{selectedOrder.totalAmount.toFixed(2)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {getStatusTag(selectedOrder.deliveryStatus)}
              </Descriptions.Item>
            </Descriptions>

            <Title level={4} style={{ marginBottom: 16, color: '#52c41a' }}>
              Order Items ({totalItems} items)
            </Title>

            <Row gutter={[16, 16]}>
              {currentItems.length > 0 ? (
                currentItems.map((item, idx) => (
                  <Col
                    span={isMobile ? 24 : 12}
                    key={startIndex + idx}
                  >
                    <Card size="small" hoverable style={{ padding: '16px', height: '100%' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '16px'
                      }}>
                        {item.image && (
                          <div style={{
                            flexShrink: 0
                          }}>
                            <img
                              src={item.image}
                              alt={item.name}
                              style={{
                                width: 80,
                                height: 80,
                                borderRadius: 8,
                                objectFit: 'cover',
                                border: '1px solid #d9d9d9'
                              }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RUG8G+5BhMlyJFAcxBOJqhE8wQ7kKQQtKSlkZzZnZklBW1KKaUKZhJFM7MpIQ6lJTJKKJGJ6GElJvK5Z+cFklVVr6vr9e/39v3V/e8P";
                              }}
                            />
                          </div>
                        )}
                        <div style={{
                          flex: 1,
                          minWidth: 0
                        }}>
                          <Title level={5} style={{
                            margin: '0 0 8px 0',
                            fontSize: '16px'
                          }}>
                            {item.name || 'Unknown Item'}
                          </Title>
                          <div style={{ marginBottom: '8px' }}>
                            <Text type="secondary" style={{ fontSize: '14px' }}>
                              Quantity: <Text strong>{item.quantity || 0}</Text>
                            </Text>
                          </div>
                          <div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <Text
                                delete
                                style={{
                                  color: '#8c8c8c',
                                  fontSize: '14px'
                                }}
                              >
                                ₹{((item as any).original_price || 0).toFixed(2)}
                              </Text>
                              <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
                                ₹{((item as any).discount_price || 0).toFixed(2)}
                              </Text>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))
              ) : (
                <Col span={24}>
                  <Alert message="No items found in this order" type="info" showIcon />
                </Col>
              )}
            </Row>

            {totalItems > itemsPerPage && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: 24
              }}>
                <Pagination
                  current={currentPage}
                  total={totalItems}
                  pageSize={itemsPerPage}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showQuickJumper={false}
                  size={isMobile ? 'small' : 'default'}
                />
              </div>
            )}
            {contextHolder}
          </Modal>
        )}
      </Content>
      <style>{`
        .custom-table :global(.ant-table-thead > tr > th) {
          background-color: white !important;
          color: black !important;
          border-bottom: 1px solid #e8e8e8 !important;
          font-weight: 600;
          position: sticky !important;
          top: 0 !important;
          z-index: 1 !important;
        }
        .ant-table-row-hover:hover {
          background-color: #f8f9fa !important;
        }
        .custom-table :global(.ant-table-tbody > tr > td) {
          border-bottom: 1px solid #e8e8e8;
        }
        .custom-table :global(.ant-table) {
          background-color: white;
          display: flex;
          flex-direction: column;
        }
        .custom-table :global(.ant-table-container) {
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .custom-table :global(.ant-table-header) {
          flex-shrink: 0;
        }
        .custom-table :global(.ant-table-body) {
          overflow-y: auto;
        }
        .custom-table :global(.ant-pagination) {
          flex-shrink: 0;
          margin-top: 20px;
          margin-right: 0;
        }
        @media (max-width: 768px) {
          .custom-table :global(.ant-table) {
            font-size: 12px;
          }
          .custom-table :global(.ant-table-thead > tr > th) {
            padding: 8px 4px;
          }
          .custom-table :global(.ant-table-tbody > tr > td) {
            padding: 8px 4px;
          }
        }
        .custom-table :global(.ant-spin-nested-loading) {
          height: 100%;
        }
        .custom-table :global(.ant-spin-container) {
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </Layout>
  );
};

export default UserOrders;