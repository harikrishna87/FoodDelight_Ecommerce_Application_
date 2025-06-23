import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Card,
  Table,
  Tag,
  Select,
  Spin,
  Alert,
  Row,
  Col,
  Typography,
  Button,
  Modal,
  Pagination,
  Descriptions,
  Space,
  Statistic,
  message,
  Tooltip
} from 'antd';
import {
  CheckCircleOutlined,
  TruckOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  PieChartOutlined,
  UnorderedListOutlined,
  EyeOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { IOrder, OrderDeliveryStatus } from '../types';
import { Pie, Line } from '@ant-design/charts';

const { Title, Text } = Typography;
const { Option } = Select;

interface OrderStatsProps {
  orders: IOrder[];
}

const OrderStatistics: React.FC<OrderStatsProps> = ({ orders }) => {
  const pendingOrders = orders.filter(o => o.deliveryStatus === 'Pending').length;
  const shippedOrders = orders.filter(o => o.deliveryStatus === 'Shipped').length;
  const deliveredOrders = orders.filter(o => o.deliveryStatus === 'Delivered').length;

  const data = [
    { type: 'Pending', value: pendingOrders },
    { type: 'Shipped', value: shippedOrders },
    { type: 'Delivered', value: deliveredOrders },
  ];

  const config: any = {
    data,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
    interactions: [{ type: 'element-active' }],
    statistic: {
      title: false,
      content: {
        style: {
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
        content: `Order\nStatus`,
      },
    },
    color: ({ type }: { type: string }) => {
      if (type === 'Pending') return '#faad14';
      if (type === 'Shipped') return '#13c2c2';
      if (type === 'Delivered') return '#52c41a';
      return '#8c8c8c';
    },
  };

  return (
    <Card
      title={
        <Space>
          <PieChartOutlined style={{ color: '#52c41a' }} />
          <span style={{ color: '#52c41a', fontWeight: 'bold' }}>Order Statistics</span>
        </Space>
      }
      style={{ height: '100%' }}
    >
      <Row gutter={16} style={{ marginBottom: 24, textAlign: 'center' }}>
        <Col span={8}>
          <Statistic
            title="Pending"
            value={pendingOrders}
            valueStyle={{ color: 'violet', fontSize: '24px' }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Shipped"
            value={shippedOrders}
            valueStyle={{ color: '#13c2c2', fontSize: '24px' }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Delivered"
            value={deliveredOrders}
            valueStyle={{ color: '#52c41a', fontSize: '24px' }}
          />
        </Col>
      </Row>
      <div style={{ height: 300 }}>
        {orders.length > 0 ? (
          <Pie {...config} />
        ) : (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: '#8c8c8c'
          }}>
            No order data available for chart.
          </div>
        )}
      </div>
    </Card>
  );
};

interface OrderGraphProps {
  orders: IOrder[];
}

const OrderGraph: React.FC<OrderGraphProps> = ({ orders }) => {
  const getOrdersPerDay = () => {
    const orderCounts: { [key: string]: number } = {};
    
    orders.forEach(order => {
      const date = new Date(order.createdAt).toLocaleDateString();
      orderCounts[date] = (orderCounts[date] || 0) + 1;
    });

    return Object.entries(orderCounts)
      .map(([date, count]) => ({
        date,
        orders: count
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const data = getOrdersPerDay();

  const config = {
    data,
    xField: 'date',
    yField: 'orders',
    point: {
      size: 5,
      shape: 'diamond',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
    smooth: true,
    color: '#52c41a',
  };

  return (
    <Card
      title={
        <Space>
          <LineChartOutlined style={{ color: '#52c41a' }} />
          <span style={{ color: '#52c41a', fontWeight: 'bold' }}>Orders Per Day</span>
        </Space>
      }
      style={{ height: '100%' }}
    >
      <div style={{ height: 350 }}>
        {data.length > 0 ? (
          <Line {...config} />
        ) : (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: '#8c8c8c'
          }}>
            No order data available for graph.
          </div>
        )}
      </div>
    </Card>
  );
};

interface PaymentSectionProps {
  orders: IOrder[];
}

const PaymentSection: React.FC<PaymentSectionProps> = ({ orders }) => {
  const totalPaymentReceived = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  const columns = [
    {
      title: 'Order ID',
      dataIndex: '_id',
      key: 'orderId',
      render: (id: string) => <Tag color="blue">{id}</Tag>,
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (record: IOrder) => (
        <Space>
          <div>
            <div>{record.user?.name || 'N/A'}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.user?.email || 'N/A'}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      key: 'amount',
      render: (amount: number) => `₹${amount.toFixed(2)}`,
    },
    {
      title: 'Status',
      key: 'status',
      render: () => <Tag color="success">Paid</Tag>,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date: string) => (
        <Space>
          <CalendarOutlined />
          {new Date(date).toLocaleDateString()}
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={
        <Space>
          <DollarOutlined style={{ color: '#52c41a' }} />
          <span style={{ color: '#52c41a', fontWeight: 'bold' }}>Payment Overview</span>
        </Space>
      }
      style={{ height: '100%' }}
    >
      <div style={{
        textAlign: 'center',
        marginBottom: 24,
        padding: 16,
        backgroundColor: '#f6ffed',
        borderRadius: 8
      }}>
        <Text type="secondary">Total Payment Received</Text>
        <div>
          <Text strong style={{ fontSize: '32px', color: '#52c41a' }}>
            ₹ {totalPaymentReceived.toFixed(2)}
          </Text>
        </div>
      </div>

      <Title level={5} style={{ color: '#8c8c8c', marginBottom: 16 }}>Recent Payments</Title>
      {orders.length === 0 ? (
        <Alert message="No payments recorded yet." type="info" showIcon />
      ) : (
        <div style={{ maxHeight: 525, overflowY: 'auto' }}>
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="_id"
            size="large"
            pagination={{
              pageSize: 5,
              showSizeChanger: true,
            }}
          />
        </div>
      )}
    </Card>
  );
};

interface ProductDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  order: IOrder | null;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ visible, onClose, order }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

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
  }, [visible, order]);

  if (!order || !order._id) {
    return (
      <Modal
        title="Order Details"
        open={visible}
        onCancel={onClose}
        footer={null}
        width={isMobile ? '95%' : 800}
        style={isMobile ? { top: 15 } : { top: 15 }}
      >
        <Alert message="No order data available" type="warning" showIcon />
      </Modal>
    );
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const totalItems = order.items?.length || 0;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = order.items?.slice(startIndex, endIndex) || [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Modal
      title={
        <Space>
          <ShoppingCartOutlined />
          <span>Order Details - {isMobile ? order._id.substring(0, 6) + '...' : order._id}</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
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
            {order.user?.name || 'N/A'}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Customer Email">
          <Tooltip title={order.user?.email || 'N/A'}>
            <Text>{isMobile ? truncateText(order.user?.email || 'N/A', 20) : (order.user?.email || 'N/A')}</Text>
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
          <Tooltip title={order._id}>
            <Text code>{isMobile ? truncateText(order._id, 15) : order._id}</Text>
          </Tooltip>
        </Descriptions.Item>
        <Descriptions.Item label="Order Date">
          {new Date(order.createdAt).toLocaleDateString()}
        </Descriptions.Item>
        <Descriptions.Item label="Total Amount">
          <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
            ₹{order.totalAmount.toFixed(2)}
          </Text>
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          {getStatusTag(order.deliveryStatus)}
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
    </Modal>
  );
};

const getStatusTag = (status: OrderDeliveryStatus) => {
  switch (status) {
    case 'Pending':
      return <Tag icon={<ClockCircleOutlined />} color="warning">Pending</Tag>;
    case 'Shipped':
      return <Tag icon={<TruckOutlined />} color="processing">Shipped</Tag>;
    case 'Delivered':
      return <Tag icon={<CheckCircleOutlined />} color="success">Delivered</Tag>;
    default:
      return <Tag color="default">{status}</Tag>;
  }
};

const getAvailableStatusOptions = (currentStatus: OrderDeliveryStatus) => {
  const statusFlow = {
    'Pending': ['Pending', 'Shipped'],
    'Shipped': ['Shipped', 'Delivered'],
    'Delivered': ['Delivered']
  };
  return statusFlow[currentStatus] || ['Pending'];
};

const LoadingSpinner: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      flexDirection: 'column'
    }}>
      <Spin size="large" />
      <div style={{ marginTop: 16, color: '#52c41a' }}>
        Loading dashboard data...
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const auth = useContext(AuthContext);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<string | null>(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const fetchOrders = useCallback(async () => {
    if (!auth?.token) {
      setError('Not authenticated.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1000));
      
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        withCredentials: true,
      };
      
      const [response] = await Promise.all([
        axios.get(`${backendUrl}/api/orders`, config),
        minLoadingTime
      ]);
      
      if (response.data.success) {
        setOrders(response.data.orders);
        setError(null);
      } else {
        setError(response.data.message || 'Failed to fetch orders.');
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      const errorMessage = err.response?.data?.message || 'Failed to fetch orders.';
      setError(errorMessage);
      messageApi.error({
        content: errorMessage,
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
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: OrderDeliveryStatus) => {
    if (!auth?.token) {
      message.error('You are not authenticated to perform this action.');
      return;
    }

    try {
      setStatusUpdateLoading(orderId);
      
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      };
      
      const response = await axios.patch(
        `${backendUrl}/api/orders/${orderId}/status`, 
        { status: newStatus }, 
        config
      );
      
      if (response.data.success) {
        message.success(`Order status updated to ${newStatus}`);
        setOrders(prevOrders =>
          prevOrders.map(order => 
            order._id === orderId 
              ? { ...order, deliveryStatus: newStatus } 
              : order
          )
        );
      } else {
        message.error(response.data.message || 'Failed to update status.');
      }
    } catch (err: any) {
      console.error('Error updating order status:', err);
      message.error(err.response?.data?.message || 'Failed to update order status.');
    } finally {
      setStatusUpdateLoading(null);
    }
  };

  const handleViewOrder = (order: IOrder) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: '_id',
      key: 'orderId',
      render: (id: string) => <Tag color="blue">{id}</Tag>,
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (record: IOrder) => (
        <Space direction="vertical" size="small">
          <Text strong>{record.user?.name || 'N/A'}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.user?.email || 'N/A'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => (
        <Text strong style={{ color: '#52c41a' }}>₹{amount.toFixed(2)}</Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'deliveryStatus',
      key: 'status',
      render: (status: OrderDeliveryStatus) => getStatusTag(status),
    },
    {
      title: 'Order Date',
      dataIndex: 'createdAt',
      key: 'orderDate',
      render: (date: string) => (
        <Space>
          <CalendarOutlined />{new Date(date).toLocaleDateString()}
        </Space>
      ),
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items: any, record: IOrder) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewOrder(record)}
        >
          View Items ({items?.length || 0})
        </Button>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (record: IOrder) => {
        const availableOptions = getAvailableStatusOptions(record.deliveryStatus);
        const isUpdating = statusUpdateLoading === record._id;
        
        return (
          <Tooltip title={record.deliveryStatus === 'Delivered' ? 'Order is already delivered' : ''}>
            <Select
              value={record.deliveryStatus}
              onChange={(value) => handleStatusChange(record._id, value)}
              style={{ width: 120 }}
              size="small"
              disabled={record.deliveryStatus === 'Delivered' || isUpdating}
              loading={isUpdating}
              suffixIcon={isUpdating ? <LoadingOutlined /> : undefined}
            >
              {availableOptions.map(status => (
                <Option key={status} value={status}>
                  {status}
                </Option>
              ))}
            </Select>
          </Tooltip>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: '40px 24px', maxWidth: 1250, margin: '0 auto' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px 24px', maxWidth: 1250, margin: '0 auto' }}>
        {contextHolder}
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <Alert
            message="Access Denied or Error!"
            description={
              <div>
                <p>{error}</p>
                <p>Please ensure you are logged in as an administrator.</p>
                <Button 
                  type="primary" 
                  onClick={fetchOrders}
                  style={{ marginTop: 16 }}
                >
                  Retry
                </Button>
              </div>
            }
            type="error"
            showIcon
            icon={<InfoCircleOutlined />}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 24px', maxWidth: 1250, margin: '0 auto' }}>
      {contextHolder}
      
      <Title level={2} style={{ textAlign: 'center', marginBottom: 40, color: "#52c41a" }}>
        Admin Dashboard
      </Title>

      <Row gutter={[24, 24]} style={{ marginBottom: 40 }}>
        <Col lg={12} xs={24}>
          <OrderStatistics orders={orders} />
        </Col>
        <Col lg={12} xs={24}>
          <OrderGraph orders={orders} />
        </Col>
      </Row>

      <Row style={{ marginBottom: 40 }}>
        <Col span={24}>
          <PaymentSection orders={orders} />
        </Col>
      </Row>

      <Row style={{ marginBottom: 40 }}>
        <Col span={24}>
          <Card
            title={
              <Space>
                <UnorderedListOutlined style={{ color: '#52c41a' }} />
                <span style={{ color: '#52c41a', fontWeight: 'bold' }}>Order Management</span>
              </Space>
            }
          >
            {orders.length === 0 ? (
              <Alert 
                message="No orders found." 
                description="Orders will appear here once customers start placing orders."
                type="info" 
                showIcon 
              />
            ) : (
              <Table
                columns={columns}
                dataSource={orders}
                rowKey="_id"
                scroll={{ x: 1000 }}
                pagination={{
                  pageSize: 5,
                  showSizeChanger: true,
                }}
                loading={statusUpdateLoading !== null}
              />
            )}
          </Card>
        </Col>
      </Row>

      <ProductDetailsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        order={selectedOrder}
      />
    </div>
  );
};

export default AdminDashboard;