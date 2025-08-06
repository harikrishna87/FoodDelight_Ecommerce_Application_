import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Card,
  Table,
  Tag,
  Select,
  Alert,
  Col,
  Typography,
  Button,
  Modal,
  Pagination,
  Descriptions,
  Space,
  message,
  Tooltip,
  Flex,
  Row,
  Spin,
  Statistic
} from 'antd';
import {
  CheckCircleOutlined,
  TruckOutlined,
  ClockCircleOutlined,
  UnorderedListOutlined,
  EyeOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  DownloadOutlined,
  CreditCardOutlined
} from '@ant-design/icons';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { IOrder, OrderDeliveryStatus } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const { Title, Text } = Typography;
const { Option } = Select;

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
          <ShoppingCartOutlined style={{ color: '#52c41a' }} />
          <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
            Order Details - {isMobile ? order._id.substring(0, 6) + '...' : order._id}
          </span>
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
            <UserOutlined style={{ color: '#52c41a' }} />
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
            <Text code style={{ color: '#52c41a' }}>{isMobile ? truncateText(order._id, 15) : order._id}</Text>
          </Tooltip>
        </Descriptions.Item>
        <Descriptions.Item label="Order Date">
          <Space>
            <CalendarOutlined style={{ color: '#52c41a' }} />
            {new Date(order.createdAt).toLocaleDateString()}
          </Space>
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
              <Card size="small" hoverable style={{ 
                padding: '16px', 
                height: '100%',
                border: '2px dashed #b7eb8f',
                borderRadius: '8px'
              }}>
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
                          border: '2px solid #b7eb8f'
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
                      fontSize: '16px',
                      color: '#52c41a'
                    }}>
                      {item.name || 'Unknown Item'}
                    </Title>
                    <div style={{ marginBottom: '8px' }}>
                      <Text type="secondary" style={{ fontSize: '14px' }}>
                        Quantity: <Text strong style={{ color: '#52c41a' }}>{item.quantity || 0}</Text>
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
      return <Tag icon={<ClockCircleOutlined />} style={{border: '1px dashed'}} color="warning">Pending</Tag>;
    case 'Shipped':
      return <Tag icon={<TruckOutlined />}  style={{border: '1px dashed'}} color="processing">Shipped</Tag>;
    case 'Delivered':
      return <Tag icon={<CheckCircleOutlined />}  style={{border: '1px dashed'}} color="success">Delivered</Tag>;
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
    <Row justify="center" align="middle" style={{ minHeight: '60vh' }}>
      <Col>
        <Row justify="center">
          <Col>
            <Spin size="large" />
          </Col>
        </Row>
        <Row justify="center" style={{ marginTop: '16px' }}>
          <Col>
            <Text style={{ color: '#52c41a', fontSize: '16px' }}>
              Loading order data...
            </Text>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

const OrderManagement: React.FC = () => {
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

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    doc.setFont('times', 'bold');
    doc.setFontSize(22);
    doc.setTextColor('#52c41a');
    doc.text('FoodDelights - Order Management Report', 14, 22);

    const tableColumns = ["Order ID", "Customer", "Amount(₹)", "Status", "Date", "Items"];
    const tableRows: (string | number)[][] = [];

    orders.forEach(order => {
        const itemsList = order.items.map((item, index) => 
            `${index + 1}. ${item.name} (Qty: ${item.quantity})`
        ).join('\n');

        const amountString = `${order.totalAmount.toFixed(2)}`;

        const orderData = [
            order._id,
            `${order.user.name}\n${order.user.email}`,
            amountString,
            order.deliveryStatus,
            new Date(order.createdAt).toLocaleDateString(),
            itemsList
        ];
        tableRows.push(orderData);
    });

    autoTable(doc, {
        head: [tableColumns],
        body: tableRows,
        startY: 30,
        theme: 'grid',
        headStyles: { 
            fillColor: [82, 196, 26],
            textColor: [255, 255, 255],
            font: 'times',
            fontStyle: 'bold'
        },
        styles: {
            font: 'times',
            fontSize: 8,
            cellPadding: 2,
            valign: 'middle',
        },
        columnStyles: {
            0: { cellWidth: 35 },
            1: { cellWidth: 40 },
            2: { cellWidth: 20 },
            3: { cellWidth: 18 },
            4: { cellWidth: 20 },
            5: { cellWidth: 'auto' },
        }
    });

    doc.save('order-management-report.pdf');
  };

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
                  style={{ marginTop: 16, backgroundColor: '#52c41a', borderColor: '#52c41a' }}
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

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const pendingOrders = orders.filter(order => order.deliveryStatus === 'Pending').length;
  const shippedOrders = orders.filter(order => order.deliveryStatus === 'Shipped').length;
  const deliveredOrders = orders.filter(order => order.deliveryStatus === 'Delivered').length;

  const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const columns = [
    {
      title: <span style={{color: "#52c41a", fontWeight: 600}}>Order ID</span>,
      dataIndex: '_id',
      key: 'orderId',
      render: (id: string) => <Tag color="blue">{id}</Tag>,
      width: 150,
    },
    {
      title: <span style={{color: "#52c41a", fontWeight: 600}}>Customer</span>,
      key: 'customer',
      render: (record: IOrder) => (
        <Space direction="vertical" size="small">
          <Space>
            <UserOutlined style={{ color: '#52c41a' }} />
            <Text strong>{record.user?.name || 'N/A'}</Text>
          </Space>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.user?.email || 'N/A'}
          </Text>
        </Space>
      ),
      width: 200,
    },
    {
      title: <span style={{color: "#52c41a", fontWeight: 600}}>Amount</span>,
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => (
        <Text strong style={{ color: '#52c41a', fontSize: '14px' }}>
          ₹ {amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Text>
      ),
      width: 120,
    },
    {
      title: <span style={{color: "#52c41a", fontWeight: 600}}>Status</span>,
      dataIndex: 'deliveryStatus',
      key: 'status',
      render: (status: OrderDeliveryStatus) => getStatusTag(status),
      width: 120,
    },
    {
      title: <span style={{color: "#52c41a", fontWeight: 600}}>Order Date</span>,
      dataIndex: 'createdAt',
      key: 'orderDate',
      render: (date: string) => (
        <Space>
          <CalendarOutlined style={{ color: '#52c41a' }} />
          {new Date(date).toLocaleDateString()}
        </Space>
      ),
      width: 140,
    },
    {
      title: <span style={{color: "#52c41a", fontWeight: 600}}>Items</span>,
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
      width: 130,
    },
    {
      title: <span style={{color: "#52c41a", fontWeight: 600}}>Actions</span>,
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
      width: 140,
    },
  ];

  return (
    <div style={{ padding: '40px 24px', maxWidth: 1250, margin: '0 auto' }}>
      {contextHolder}
      
      <Title level={2} style={{ textAlign: 'center', marginBottom: 40, color: "#52c41a" }}>
        Order Management Dashboard
      </Title>

      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} md={6}>
          <Card 
            style={{ 
              borderRadius: '12px',
              border: '2px dashed #b7eb8f',
              boxShadow: '0 4px 12px rgba(183, 235, 143, 0.2)',
              background: 'white',
              color: 'white',
              height: '140px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
            bodyStyle={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}
          >
            <Statistic
              title={<span style={{ color: '#8c8c8c', fontSize: '14px' }}>Total Orders</span>}
              value={totalOrders}
              valueStyle={{ 
                color: '#52c41a', 
                fontSize: '25px', 
                fontWeight: 700 
              }}
            />
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center' }}>
              <ShoppingCartOutlined style={{ marginRight: 4, fontSize: '16px', color: '#52c41a' }} />
              <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
                All time orders
              </Text>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card 
            style={{ 
              borderRadius: '12px',
              border: '2px dashed #b7eb8f',
              boxShadow: '0 4px 12px rgba(183, 235, 143, 0.2)',
              background: 'white',
              height: '140px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
            bodyStyle={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}
          >
            <Statistic
              title={<span style={{ color: '#8c8c8c', fontSize: '14px' }}>Total Revenue</span>}
              value={totalRevenue}
              precision={2}
              prefix="₹"
              valueStyle={{ 
                color: '#52c41a', 
                fontSize: '25px', 
                fontWeight: 700 
              }}
            />
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center' }}>
              <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
                <span style={{color:'#52c41a', fontSize: '16px'}}>₹ </span>Total earnings
              </Text>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card 
            style={{ 
              borderRadius: '12px',
              border: '2px dashed #b7eb8f',
              boxShadow: '0 4px 12px rgba(183, 235, 143, 0.2)',
              background: 'white',
              height: '140px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
            bodyStyle={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}
          >
            <Statistic
              title={<span style={{ color: '#8c8c8c', fontSize: '14px' }}>Average Order</span>}
              value={averageOrderValue}
              precision={2}
              prefix="₹"
              valueStyle={{ 
                color: '#52c41a', 
                fontSize: '25px', 
                fontWeight: 700 
              }}
            />
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center' }}>
              <CreditCardOutlined style={{ marginRight: 4, fontSize: '16px', color: '#52c41a' }} />
              <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
                Per order value
              </Text>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card 
            style={{ 
              borderRadius: '12px',
              border: '2px dashed #b7eb8f',
              boxShadow: '0 4px 12px rgba(183, 235, 143, 0.2)',
              background: 'white',
              height: '140px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
            bodyStyle={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}
          >
            <div style={{ marginBottom: 8 }}>
              <Text style={{ color: '#8c8c8c', fontSize: '14px', display: 'block' }}>Order Status</Text>
            </div>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: '12px' }}>Pending:</Text>
                <Text strong style={{ color: '#faad14', fontSize: '12px' }}>{pendingOrders}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: '12px' }}>Shipped:</Text>
                <Text strong style={{ color: '#1890ff', fontSize: '12px' }}>{shippedOrders}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: '12px' }}>Delivered:</Text>
                <Text strong style={{ color: '#52c41a', fontSize: '12px' }}>{deliveredOrders}</Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card
        title={
            <Flex justify='space-between' align='center' wrap gap={10}>
                <Space>
                    <UnorderedListOutlined style={{ color: '#52c41a' }} />
                    <span style={{ color: '#52c41a', fontWeight: 'bold' }}>Order Management</span>
                </Space>
                <Tag 
                    icon={<DownloadOutlined />} 
                    onClick={handleDownloadPDF}
                    color='green'
                    style={{
                      cursor: 'pointer',
                      padding: "5px 10px",
                      fontSize: "15px"
                    }}
                >
                    Download Order Report
                </Tag>
            </Flex>
        }
        style={{ 
          borderRadius: '12px',
          border: '2px dashed #b7eb8f',
          boxShadow: '0 4px 12px rgba(183, 235, 143, 0.2)',
          background: 'white'
        }}
      >
        {orders.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            background: '#f6ffed',
            borderRadius: '12px',
            border: '1px dashed #d9f7be'
          }}>
            <InfoCircleOutlined style={{ fontSize: '64px', color: '#52c41a', marginBottom: '16px' }} />
            <Title level={4} style={{ color: '#52c41a', margin: 0 }}>No orders found</Title>
            <Text style={{ color: '#8c8c8c' }}>Orders will appear here once customers start placing orders</Text>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={sortedOrders}
            rowKey="_id"
            scroll={{ x: 'max-content' }}
            pagination={{
              pageSize: 10,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} orders`,
            }}
            loading={statusUpdateLoading !== null}
            rowClassName={(_, index) => 
              index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
            }
          />
        )}
      </Card>

      <ProductDetailsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        order={selectedOrder}
      />
      
      <style>{`
        .table-row-light {
          background-color: #fafafa;
        }
        .table-row-dark {
          background-color: #ffffff;
        }
        .table-row-light:hover,
        .table-row-dark:hover {
          background-color: #f6ffed !important;
        }
      `}</style>
    </div>
  );
};

export default OrderManagement;