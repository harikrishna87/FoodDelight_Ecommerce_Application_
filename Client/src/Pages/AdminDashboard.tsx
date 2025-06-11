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
  Image,
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
  InfoCircleOutlined
} from '@ant-design/icons';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { IOrder, OrderDeliveryStatus } from '../types';
import { Pie } from '@ant-design/charts';

const { Title, Text } = Typography;
const { Option } = Select;

interface OrderStatsProps {
  orders: IOrder[];
}

const OrderStatistics: React.FC<OrderStatsProps> = ({ orders }) => {
  const totalOrders = orders.length;
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
        content: `Total\nOrders`,
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
        <Col span={6}>
          <Statistic
            title="Total"
            value={totalOrders}
            valueStyle={{ color: '#1890ff', fontSize: '24px' }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Pending"
            value={pendingOrders}
            valueStyle={{ color: '#faad14', fontSize: '24px' }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Shipped"
            value={shippedOrders}
            valueStyle={{ color: '#13c2c2', fontSize: '24px' }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Delivered"
            value={deliveredOrders}
            valueStyle={{ color: '#52c41a', fontSize: '24px' }}
          />
        </Col>
      </Row>
      <div style={{ height: 300 }}>
        {totalOrders > 0 ? (
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

interface PaymentSectionProps {
  orders: IOrder[];
}

const PaymentSection: React.FC<PaymentSectionProps> = ({ orders }) => {
  const totalPaymentReceived = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  const columns = [
    {
      title: 'Payment ID',
      dataIndex: '_id',
      key: 'paymentId',
      render: (id: string) => id.substring(0, 8) + '...',
    },
    {
      title: 'Order ID',
      dataIndex: '_id',
      key: 'orderId',
      render: (id: string) => id.substring(0, 8) + '...',
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
      render: (date: string) => new Date(date).toLocaleDateString(),
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
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="_id"
            size="small"
            pagination={false}
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
  if (!order || !order._id) {
    return (
      <Modal
        title="Order Details"
        open={visible}
        onCancel={onClose}
        footer={null}
        width={800}
      >
        <Alert message="No order data available" type="warning" showIcon />
      </Modal>
    );
  }

  return (
    <Modal
      title={
        <Space>
          <ShoppingCartOutlined />
          <span>Order Details - {order._id.substring(0, 8)}...</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
        <Descriptions.Item label="Order ID">{order._id}</Descriptions.Item>
        <Descriptions.Item label="Order Date">
          {new Date(order.createdAt).toLocaleDateString()}
        </Descriptions.Item>
        <Descriptions.Item label="Customer Name">
          <Space>
            <UserOutlined />
            {order.user?.name || 'N/A'}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Customer Email">
          {order.user?.email || 'N/A'}
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

      <Title level={4}>Order Items</Title>
      <Row gutter={[16, 16]}>
        {order.items && order.items.length > 0 ? (
          order.items.map((item, idx) => (
            <Col span={12} key={idx}>
              <Card size="small" hoverable style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  {item.image && (
                    <div style={{ marginRight: 20, flexShrink: 0 }}>
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={80}
                        height={80}
                        style={{ borderRadius: 8, objectFit: 'cover' }}
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RUG8G+5BhMlyJFAcxBOJqhE8wQ7kKQQtKSlkZzZnZklBW1KKaUKZhJFM7MpIQ6lJTJKKJGJ6GElJvK5Z+cFklVVr6vr9e/39v3V/e8P"
                      />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Title level={5} style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
                      {item.name || 'Unknown Item'}
                    </Title>
                    <div style={{ marginBottom: '8px' }}>
                      <Text type="secondary" style={{ fontSize: '14px' }}>
                        Quantity: <Text strong>{item.quantity || 0}</Text>
                      </Text>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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

const AdminDashboard: React.FC = () => {
  const auth = useContext(AuthContext);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const fetchOrders = useCallback(async () => {
    if (!auth?.token) {
      setError('Not authenticated.');
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
      const response = await axios.get(`${backendUrl}/api/orders`, config);
      if (response.data.success) {
        setOrders(response.data.orders);
        setError(null);
      } else {
        setError(response.data.message || 'Failed to fetch orders.');
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || 'Failed to fetch orders.');
      toast.error(err.response?.data?.message || 'Failed to fetch orders.', { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  }, [auth?.token, backendUrl]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: OrderDeliveryStatus) => {
    if (!auth?.token) {
      message.error('You are not authenticated to perform this action.');
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      };
      const response = await axios.patch(`${backendUrl}/api/orders/${orderId}/status`, { status: newStatus }, config);
      if (response.data.success) {
        message.success(`Order status updated to ${newStatus}`);
        setOrders(prevOrders =>
          prevOrders.map(order => (order._id === orderId ? { ...order, deliveryStatus: newStatus } : order))
        );
      } else {
        message.error(response.data.message || 'Failed to update status.');
      }
    } catch (err: any) {
      console.error('Error updating order status:', err);
      message.error(err.response?.data?.message || 'Failed to update order status.');
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
      render: (id: string) => (
        <Tooltip title={id}>
          <Text code>{id}</Text>
        </Tooltip>
      ),
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
          <CalendarOutlined />
          <Text>{new Date(date).toLocaleDateString()}</Text>
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
        return (
          <Tooltip title={record.deliveryStatus === 'Delivered' ? 'Order is already delivered' : ''}>
            <Select
              value={record.deliveryStatus}
              onChange={(value) => handleStatusChange(record._id, value)}
              style={{ width: 120 }}
              size="small"
              disabled={record.deliveryStatus === 'Delivered'}
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
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        flexDirection: 'column'
      }}>
        <Spin size="large" />
        <Text style={{ marginTop: 16, color: '#52c41a' }}>Loading dashboard data...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center' }}>
        <Alert
          message="Access Denied or Error!"
          description={
            <div>
              <p>{error}</p>
              <p>Please ensure you are logged in as an administrator.</p>
            </div>
          }
          type="error"
          showIcon
          icon={<InfoCircleOutlined />}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 24px', maxWidth: 1250, margin: '0 auto' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 40, color: "#52c41a" }}>
        Admin Dashboard
      </Title>

      <Row gutter={[24, 24]} style={{ marginBottom: 40 }}>
        <Col lg={12} xs={24}>
          <OrderStatistics orders={orders} />
        </Col>
        <Col lg={12} xs={24}>
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
              <Alert message="No orders found." type="info" showIcon />
            ) : (
              <Table
                columns={columns}
                dataSource={orders}
                rowKey="_id"
                scroll={{ x: 1000 }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} orders`,
                }}
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