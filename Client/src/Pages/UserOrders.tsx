import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { Layout, Table, Tag, Spin, Alert, Typography, Modal, Button, Descriptions, Space, Tooltip, Row, Col, Card, Pagination, message } from 'antd';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { IOrder, OrderDeliveryStatus } from '../types';
import { CheckCircleOutlined, TruckOutlined, ClockCircleOutlined, EyeOutlined, CalendarOutlined, ShoppingCartOutlined, UserOutlined, DownloadOutlined, GiftOutlined, InfoCircleOutlined } from '@ant-design/icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

interface OrderStatusTrackerProps {
  currentStatus: 'Pending' | 'Shipped' | 'Delivered';
}

const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({ currentStatus }) => {
  const getStatusIndex = (status: string) => {
    switch (status) {
      case 'Pending': return 0;
      case 'Shipped': return 1;
      case 'Delivered': return 2;
      default: return 0;
    }
  };

  const currentIndex = getStatusIndex(currentStatus);

  const steps = [
    {
      key: 'Pending',
      title: 'ORDERED',
      icon: <ClockCircleOutlined />,
      index: 0
    },
    {
      key: 'Shipped', 
      title: 'ORDER SHIPPED',
      icon: <TruckOutlined />,
      index: 1
    },
    {
      key: 'Delivered',
      title: 'DELIVERED', 
      icon: <GiftOutlined />,
      index: 2
    }
  ];

  return (
    <div style={{
      padding: '30px 20px',
      backgroundColor: '#f0f9f0',
      borderRadius: '12px',
      margin: '20px 0'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        maxWidth: '500px',
        margin: '0 auto'
      }}>
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          right: '20px',
          height: '4px',
          backgroundColor: '#e8e8e8',
          borderRadius: '2px',
          zIndex: 1
        }}>
          <div style={{
            height: '100%',
            backgroundColor: '#52c41a',
            borderRadius: '2px',
            width: `${(currentIndex / (steps.length - 1)) * 100}%`,
            transition: 'width 0.3s ease'
          }} />
        </div>

        {steps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isActive = index === currentIndex;
          
          return (
            <div key={step.key} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              zIndex: 2
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: isCompleted ? '#52c41a' : '#e8e8e8',
                border: isActive ? '3px solid #52c41a' : '3px solid transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isCompleted ? 'white' : '#999',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                boxShadow: isActive ? '0 0 0 4px rgba(82, 196, 26, 0.2)' : 'none'
              }}>
                {isCompleted ? <CheckCircleOutlined /> : step.icon}
              </div>
              
              <span style={{
                marginTop: '12px',
                fontSize: '12px',
                fontWeight: '600',
                color: isCompleted ? '#52c41a' : '#999',
                textAlign: 'center',
                letterSpacing: '0.5px'
              }}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
      
      <div style={{
        textAlign: 'center',
        marginTop: '20px',
        padding: '10px',
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #d9f7be'
      }}>
        <span style={{
          color: '#52c41a',
          fontWeight: '500',
          fontSize: '14px'
        }}>
          {currentStatus === 'Pending' && 'Your order has been placed and is being processed'}
          {currentStatus === 'Shipped' && 'Your order is on its way to you'}
          {currentStatus === 'Delivered' && 'Your order has been successfully delivered'}
        </span>
      </div>
    </div>
  );
};

const UserOrders: React.FC = () => {
  const auth = useContext(AuthContext);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState<IOrder | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const receiptContentRef = useRef<HTMLDivElement>(null);
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
  }, [auth?.token, backendUrl, messageApi]);

  useEffect(() => {
    fetchUserOrders();
  }, [fetchUserOrders]);

  const showModal = (order: IOrder) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const showStatusModal = (order: IOrder) => {
    setSelectedOrderForStatus(order);
    setIsStatusModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedOrder(null);
  };

  const handleStatusModalCancel = () => {
    setIsStatusModalVisible(false);
    setSelectedOrderForStatus(null);
  };

  const handleDownloadReceipt = async () => {
    if (!receiptContentRef.current || !selectedOrder) {
      messageApi.error('Could not generate receipt. Content not found.');
      return;
    }

    setIsDownloading(true);
    messageApi.loading({ content: 'Generating your receipt...', key: 'pdf-download', duration: 0 });

    try {
      const receiptElement = receiptContentRef.current;
      const canvas = await html2canvas(receiptElement, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Receipt-Order-${selectedOrder._id}.pdf`);

      messageApi.success({ content: 'Receipt downloaded successfully!', key: 'pdf-download', duration: 3 });

    } catch (err) {
      console.error('Error generating PDF receipt:', err);
      messageApi.error({ content: 'Failed to download receipt. Please try again.', key: 'pdf-download', duration: 3 });
    } finally {
      setIsDownloading(false);
    }
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

  const getStatusBadge = (order: IOrder) => {
    return (
      <Button 
        type="link" 
        size="small" 
        icon={<InfoCircleOutlined />}
        onClick={() => showStatusModal(order)}
        style={{ padding: 0 }}
      >
        Track Status
      </Button>
    );
  };

  const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const columns = [
    {
      title: <span style={{color: "#52c41a"}}>Order ID</span>,
      dataIndex: '_id',
      key: '_id',
      width: 120,
      render: (id: string) => <Tag color='blue'>{id}</Tag>,
    },
    {
      title:  <span style={{color: "#52c41a"}}>Customer</span>,
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
      title:  <span style={{color: "#52c41a"}}>Amount</span>,
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      align: 'center' as const,
      render: (amount: number) => <Paragraph style={{color: "#52c41a", fontSize: '16px', margin: 0}}>₹ {amount.toFixed(2)}</Paragraph>,
    },
    {
      title:  <span style={{color: "#52c41a"}}>Status</span>,
      dataIndex: 'deliveryStatus',
      key: 'deliveryStatus',
      width: 100,
      render: (_: OrderDeliveryStatus, record: IOrder) => getStatusBadge(record),
    },
    {
      title:  <span style={{color: "#52c41a"}}>Order Date</span>,
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
      title:  <span style={{color: "#52c41a"}}>Items</span>,
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
        {contextHolder}
        <div style={{
          flexShrink: 0,
          marginBottom: '24px',
          padding: '0 20px'
        }}>
          <Title level={2} style={{ color: '#52c41a', marginBottom: '12px', textAlign: 'center' }}>My Orders List</Title>
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
                dataSource={sortedOrders}
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
            footer={[
              <Button key="back" onClick={handleCancel}>
                Close
              </Button>,
              <Button
                key="download"
                type="primary"
                icon={<DownloadOutlined />}
                loading={isDownloading}
                onClick={handleDownloadReceipt}
                style={{backgroundColor: "#52c41a"}}
              >
                Download Receipt
              </Button>,
            ]}
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
              {currentItems.map((item, idx) => (
                  <Col span={isMobile ? 24 : 12} key={startIndex + idx}>
                      <Card size="small" hoverable style={{ padding: '16px', height: '100%' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                              {item.image && (
                                  <div style={{ flexShrink: 0 }}>
                                      <img src={item.image} alt={item.name} style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover', border: '1px solid #d9d9d9' }} onError={(e) => { (e.target as HTMLImageElement).src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RUG8G+5BhMlyJFAcxBOJqhE8wQ7kKQQtKSlkZzZnZklBW1KKaUKZhJFM7MpIQ6lJTJKKJGJ6GElJvK5Z+cFklVVr6vr9e/39v3V/e8P"; }} />
                                  </div>
                              )}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                  <Title level={5} style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{item.name || 'Unknown Item'}</Title>
                                  <div style={{ marginBottom: '8px' }}><Text type="secondary" style={{ fontSize: '14px' }}>Quantity: <Text strong>{item.quantity || 0}</Text></Text></div>
                                  <div><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <Text delete style={{ color: '#8c8c8c', fontSize: '14px' }}>₹{((item as any).original_price || 0).toFixed(2)}</Text>
                                      <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>₹{((item as any).discount_price || 0).toFixed(2)}</Text>
                                  </div></div>
                              </div>
                          </div>
                      </Card>
                  </Col>
              ))}
            </Row>

            {totalItems > itemsPerPage && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                <Pagination current={currentPage} total={totalItems} pageSize={itemsPerPage} onChange={handlePageChange} showSizeChanger={false} showQuickJumper={false} size={isMobile ? 'small' : 'default'} />
              </div>
            )}
            <div style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -1 }}>
              <div ref={receiptContentRef} style={{
                  width: '320px',
                  padding: '20px',
                  fontFamily: '"Courier New", Courier, monospace',
                  fontSize: '12px',
                  lineHeight: '1.6',
                  color: '#000',
                  backgroundColor: '#fff',
              }}>
                <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>FoodDelight</h3>
                  <p style={{ margin: 0, fontSize: '11px' }}>1-23 Gourmet Street, Nellore - 524001</p>
                  <p style={{ margin: 0, fontSize: '11px' }}>www.FoodDelight.com</p>
                </div>
                <p style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></p>
                <p style={{ margin: '2px 0' }}><strong>Order ID:</strong> {selectedOrder._id}</p>
                <p style={{ margin: '2px 0' }}><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                <p style={{ margin: '2px 0' }}><strong>Customer:</strong> {selectedOrder.user.name}</p>
                <p style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></p>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', paddingBottom: '5px' }}>ITEM</th>
                      <th style={{ textAlign: 'center', paddingBottom: '5px' }}>QTY</th>
                      <th style={{ textAlign: 'right', paddingBottom: '5px' }}>PRICE</th>
                      <th style={{ textAlign: 'right', paddingBottom: '5px' }}>TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, index) => (
                      <tr key={`receipt-${index}`}>
                        <td style={{ textAlign: 'left', verticalAlign: 'top' }}>{item.name}</td>
                        <td style={{ textAlign: 'center', verticalAlign: 'top' }}>{item.quantity}</td>
                        <td style={{ textAlign: 'right', verticalAlign: 'top' }}>{(item as any).discount_price.toFixed(2)}</td>
                        <td style={{ textAlign: 'right', verticalAlign: 'top' }}>{(item.quantity * (item as any).discount_price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></p>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '2px 0' }}><strong>Subtotal:</strong> ₹{selectedOrder.totalAmount.toFixed(2)}</p>
                  <p style={{ margin: '2px 0', fontSize: '14px', fontWeight: 'bold' }}><strong>TOTAL:</strong> ₹{selectedOrder.totalAmount.toFixed(2)}</p>
                </div>
                <p style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></p>
                <div style={{ textAlign: 'center', marginTop: '15px' }}>
                  <p style={{ margin: 0 }}>Thank you for your order!</p>
                </div>
              </div>
            </div>
          </Modal>
        )}

        {selectedOrderForStatus && (
          <Modal
            title={
              <Space>
                <TruckOutlined />
                <span>Order Status Tracking - {isMobile ? selectedOrderForStatus._id.substring(0, 6) + '...' : selectedOrderForStatus._id}</span>
              </Space>
            }
            open={isStatusModalVisible}
            onCancel={handleStatusModalCancel}
            footer={[
              <Button key="close" onClick={handleStatusModalCancel}>
                Close
              </Button>,
            ]}
            width={isMobile ? '95%' : 600}
            style={isMobile ? { top: 150 } : { top: 175 }}
          >
            <Title level={4} style={{ marginBottom: 16, color: '#52c41a' }}>Delivery Progress</Title>
            <OrderStatusTracker currentStatus={selectedOrderForStatus.deliveryStatus} />
          </Modal>
        )}
      </Content>
    </Layout>
  );
};

export default UserOrders;