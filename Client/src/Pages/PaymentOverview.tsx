import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Card,
  Table,
  Tag,
  Alert,
  Typography,
  Space,
  message,
  Spin,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  CalendarOutlined,
  InfoCircleOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { IOrder } from '../types';

const { Title, Text } = Typography;

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
        Loading payment data...
      </div>
    </div>
  );
};

const PaymentOverview: React.FC = () => {
  const auth = useContext(AuthContext);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

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

  if (loading) {
    return (
      <div style={{ padding: '40px 24px', maxWidth: 1400, margin: '0 auto' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px 24px', maxWidth: 1400, margin: '0 auto' }}>
        {contextHolder}
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
      </div>
    );
  }

  const totalPaymentReceived = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalPaymentReceived / totalOrders : 0;
  const sortedPaymentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const columns = [
    {
      title: <span style={{color: "#52c41a", fontWeight: 600}}>Order ID</span>,
      dataIndex: '_id',
      key: 'orderId',
      render: (id: string) => <Tag color="blue">{id}</Tag>,
      width: 120,
    },
    {
      title: <span style={{color: "#52c41a", fontWeight: 600}}>Customer</span>,
      key: 'customer',
      render: (record: IOrder) => (
        <div>
          <div style={{ fontWeight: 500, color: '#262626' }}>{record.user?.name || 'N/A'}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.user?.email || 'N/A'}
          </Text>
        </div>
      ),
      width: 200,
    },
    {
      title: <span style={{color: "#52c41a", fontWeight: 600}}>Amount</span>,
      dataIndex: 'totalAmount',
      key: 'amount',
      render: (amount: number) => (
        <Text strong style={{ color: '#52c41a', fontSize: '14px' }}>
          ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Text>
      ),
      width: 120,
    },
    {
      title: <span style={{color: "#52c41a", fontWeight: 600}}>Status</span>,
      key: 'status',
      render: () => (
        <Tag color="success" icon={<CheckCircleOutlined />} style={{border: '1px dashed'}}>
          Paid
        </Tag>
      ),
      width: 130,
    },
    {
      title: <span style={{color: "#52c41a", fontWeight: 600}}>Date</span>,
      dataIndex: 'createdAt',
      key: 'date',
      render: (date: string) => (
        <Space>
          <CalendarOutlined style={{ color: '#52c41a' }} />
          <span>{new Date(date).toLocaleDateString('en-IN')}</span>
        </Space>
      ),
      width: 140,
    },
  ];

  return (
    <div style={{ 
      padding: '32px 24px', 
      maxWidth: 1250, 
      margin: '0 auto'
    }}>
      {contextHolder}
      
      <div style={{ 
        textAlign: 'center',
        marginBottom: 32
      }}>
        <Title level={1} style={{ 
          margin: 0, 
          color: '#52c41a',
          fontSize: '30px',
          fontWeight: 700
        }}>
          Payment Overview Dashboard
        </Title>
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={8}>
          <Card 
            style={{ 
              borderRadius: '16px',
              border: '2px dashed #b7eb8f',
              boxShadow: '0 4px 16px rgba(183, 235, 143, 0.2)',
              background: 'white',
              color: 'white'
            }}
          >
            <Statistic
              title={<span style={{ color: '#8c8c8c', fontSize: '14px' }}>Total Revenue</span>}
              value={totalPaymentReceived}
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
                <span style={{color:'#52c41a', fontSize: '16px'}}>₹ </span>All time earnings
              </Text>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={8}>
          <Card 
            style={{ 
              borderRadius: '16px',
              border: '2px dashed #b7eb8f',
              boxShadow: '0 4px 16px rgba(183, 235, 143, 0.2)',
              background: 'white'
            }}
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
              <CreditCardOutlined style={{ marginRight: 4, fontSize: '16px', color: '#52c41a' }} />
              <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
                Successful transactions
              </Text>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={8}>
          <Card 
            style={{ 
              borderRadius: '16px',
              border: '2px dashed #b7eb8f',
              boxShadow: '0 4px 16px rgba(183, 235, 143, 0.2)',
              background: 'white'
            }}
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
              <CheckCircleOutlined style={{ marginRight: 4, fontSize: '16px', color: '#52c41a' }} />
              <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
                Per transaction value
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            fontSize: '20px',
            fontWeight: 600,
            color: '#52c41a'
          }}>
            <CreditCardOutlined style={{ marginRight: 12, fontSize: '24px', color: '#52c41a' }} />
            Recent Payments
          </div>
        }
        style={{ 
          borderRadius: '16px',
          border: '2px dashed #b7eb8f',
          boxShadow: '0 4px 16px rgba(183, 235, 143, 0.2)',
          background: 'white'
        }}
        bodyStyle={{ padding: '24px' }}
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
            <Title level={4} style={{ color: '#52c41a', margin: 0 }}>No payments recorded yet</Title>
            <Text style={{ color: '#8c8c8c' }}>Payments will appear here once customers start making purchases</Text>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={sortedPaymentOrders}
            rowKey="_id"
            size="large"
            scroll={{ x: 1000 }}
            pagination={{
              pageSize: 10,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} payments`,
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default PaymentOverview;