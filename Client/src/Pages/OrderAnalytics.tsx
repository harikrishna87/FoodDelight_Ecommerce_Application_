import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Card,
  Alert,
  Row,
  Col,
  Typography,
  Statistic,
  message,
  Space,
  Spin,
  Progress,
  List,
  Avatar,
  Button,
  Tag
} from 'antd';
import {
  PieChartOutlined,
  InfoCircleOutlined,
  LineChartOutlined,
  ShoppingCartOutlined,
  TruckOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  RiseOutlined,
  FallOutlined,
  TeamOutlined,
  ReloadOutlined,
  StarOutlined
} from '@ant-design/icons';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { IOrder } from '../types';
import { Line, Column } from '@ant-design/charts';

const { Title, Text } = Typography;

interface OrderStatsProps {
  orders: IOrder[];
}

const OrderStatistics: React.FC<OrderStatsProps> = ({ orders }) => {
  const pendingOrders = orders.filter(o => o.deliveryStatus === 'Pending').length;
  const shippedOrders = orders.filter(o => o.deliveryStatus === 'Shipped').length;
  const deliveredOrders = orders.filter(o => o.deliveryStatus === 'Delivered').length;
  const totalOrders = orders.length;

  const deliveryRate = totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0;

  return (
    <Card
      title={
        <Space>
          <PieChartOutlined style={{ color: '#1890ff' }} />
          <span>Order Statistics</span>
        </Space>
      }
      style={{
        height: '100%',
        border: '2px dashed #b7eb8f',
        boxShadow: '0 4px 16px rgba(183, 235, 143, 0.2)',
        borderRadius: '16px'
      }}
      headStyle={{ borderBottom: '1px solid #f0f0f0' }}
    >
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Progress
            type="circle"
            percent={deliveryRate}
            size={120}
            strokeColor={{
              '0%': '#52c41a',
              '100%': '#87d068',
            }}
            format={() => (
              <Row>
                <Col span={24} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#262626' }}>
                    {deliveryRate}%
                  </div>
                </Col>
                <Col span={24} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '5px' }}>
                    Orders Delivered
                  </div>
                </Col>
              </Row>
            )}
          />
        </Col>

        <Col span={12}>
          <Row gutter={[8, 8]}>
            <Col span={12}>
              <Statistic
                title="Total Orders"
                value={totalOrders}
                valueStyle={{ color: '#1890ff', fontSize: '16px' }}
                prefix={<ShoppingCartOutlined />}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Delivered"
                value={deliveredOrders}
                valueStyle={{ color: '#52c41a', fontSize: '16px' }}
                prefix={<CheckCircleOutlined />}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Shipped"
                value={shippedOrders}
                valueStyle={{ color: '#1890ff', fontSize: '16px' }}
                prefix={<TruckOutlined />}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Pending"
                value={pendingOrders}
                valueStyle={{ color: '#faad14', fontSize: '16px' }}
                prefix={<ClockCircleOutlined />}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  );
};

const WeeklyEarning: React.FC<{ orders: IOrder[] }> = ({ orders }) => {
  const getWeeklyData = () => {
    const weeklyEarnings: { [key: string]: number } = {};
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString();
      weeklyEarnings[dateStr] = 0;
    }

    orders.forEach(order => {
      const orderDate = new Date(order.createdAt).toLocaleDateString();
      if (weeklyEarnings.hasOwnProperty(orderDate)) {
        weeklyEarnings[orderDate] += order.totalAmount;
      }
    });

    return Object.entries(weeklyEarnings).map(([date, amount]) => ({
      date: new Date(date).toLocaleDateString('en', { weekday: 'short' }),
      amount
    }));
  };

  const weeklyData = getWeeklyData();
  const totalWeeklyEarning = weeklyData.reduce((sum, day) => sum + day.amount, 0);
  const averageDailyEarning = totalWeeklyEarning / 7;

  const config = {
    data: weeklyData,
    xField: 'date',
    yField: 'amount',
    columnStyle: {
      radius: [4, 4, 0, 0],
      fill: 'l(270) 0:#1890ff 0.5:#40a9ff 1:#69c0ff',
    },
    meta: {
      amount: {
        alias: 'Earning (₹)',
      },
    },
    columnWidthRatio: 0.6,
  };

  return (
    <Card
      title={
        <Space>
          <span style={{ color: '#52c41a' }}>₹</span>
          <span>Weekly Earnings</span>
        </Space>
      }
      extra={
        <Tag color="green">
          <RiseOutlined /> This Week
        </Tag>
      }
      style={{
        height: '100%',
        border: '2px dashed #b7eb8f',
        boxShadow: '0 4px 16px rgba(183, 235, 143, 0.2)',
        borderRadius: '16px'
      }}
      headStyle={{ borderBottom: '1px solid #f0f0f0' }}
    >
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Statistic
            title="Total Earning"
            value={totalWeeklyEarning}
            precision={2}
            valueStyle={{ color: '#52c41a', fontSize: '18px' }}
            prefix="₹"
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="Daily Average"
            value={averageDailyEarning}
            precision={2}
            valueStyle={{ color: '#1890ff', fontSize: '18px' }}
            prefix="₹"
          />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <div style={{ height: '200px' }}>
            <Column {...config} />
          </div>
        </Col>
      </Row>
    </Card>
  );
};

const CampaignStatistic: React.FC<{ orders: IOrder[] }> = ({ orders }) => {
  const getMonthlyData = () => {
    const monthlyData: { [key: string]: number } = {};

    orders.forEach(order => {
      const date = new Date(order.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });

    const last6Months = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en', { month: 'short' });

      last6Months.push({
        month: monthName,
        orders: monthlyData[monthKey] || 0
      });
    }

    return last6Months;
  };

  const monthlyData = getMonthlyData();
  const totalMonthlyOrders = monthlyData.reduce((sum, month) => sum + month.orders, 0);
  const averageMonthlyOrders = Math.round(totalMonthlyOrders / 6);

  const config = {
    data: monthlyData,
    xField: 'month',
    yField: 'orders',
    smooth: true,
    color: '#722ed1',
    point: {
      size: 5,
      style: {
        fill: '#722ed1',
        stroke: '#fff',
        lineWidth: 2,
      },
    },
    area: {
      fill: 'l(270) 0:#722ed1 1:rgba(114,46,209,0.1)',
    },
  };

  return (
    <Card
      title={
        <Space>
          <LineChartOutlined style={{ color: '#722ed1' }} />
          <span>Campaign Statistics</span>
        </Space>
      }
      extra={
        <Space>
          <Text type="secondary">Last 6 Months</Text>
        </Space>
      }
      style={{
        height: '100%',
        border: '2px dashed #b7eb8f',
        boxShadow: '0 4px 16px rgba(183, 235, 143, 0.2)',
        borderRadius: '16px'
      }}
      headStyle={{ borderBottom: '1px solid #f0f0f0' }}
    >
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Statistic
            title="Total Orders"
            value={totalMonthlyOrders}
            valueStyle={{ color: '#722ed1', fontSize: '18px' }}
            prefix={<ShoppingCartOutlined />}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="Monthly Average"
            value={averageMonthlyOrders}
            valueStyle={{ color: '#1890ff', fontSize: '18px' }}
            prefix={<CalendarOutlined />}
          />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <div style={{ height: '250px' }}>
            <Line {...config} />
          </div>
        </Col>
      </Row>
    </Card>
  );
};

const LatestCampaign: React.FC<{ orders: IOrder[] }> = ({ orders }) => {
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 7);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'Shipped': return 'processing';
      case 'Delivered': return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <ClockCircleOutlined />;
      case 'Shipped': return <TruckOutlined />;
      case 'Delivered': return <CheckCircleOutlined />;
      default: return <InfoCircleOutlined />;
    }
  };

  return (
    <Card
      title={
        <Space>
          <CalendarOutlined style={{ color: '#fa8c16' }} />
          <span>Latest Orders</span>
        </Space>
      }
      style={{
        height: '100%',
        border: '2px dashed #b7eb8f',
        boxShadow: '0 4px 16px rgba(183, 235, 143, 0.2)',
        borderRadius: '16px'
      }}
      headStyle={{ borderBottom: '1px solid #f0f0f0' }}
      bodyStyle={{ padding: '16px 24px' }}
    >
      <List
        dataSource={recentOrders}
        renderItem={(order, index) => (
          <List.Item
            style={{
              padding: '12px 0',
              borderBottom: index === recentOrders.length - 1 ? 'none' : '1px solid #f0f0f0'
            }}
          >
            <div style={{ width: '100%' }}>
              <Row justify="space-between" align="middle" style={{ width: '100%' }}>
                <Col flex="1" style={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    style={{
                      backgroundColor: '#f6ffed',
                      color: '#52c41a',
                      border: '1px solid #b7eb8f',
                      marginRight: '12px'
                    }}
                    icon={<UserOutlined />}
                  />
                  <div>
                    <div>
                      <Text strong style={{ fontSize: '14px' }}>
                        {order.user?.name || 'Unknown Customer'}
                      </Text>
                    </div>
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </Text>
                    </div>
                  </div>
                </Col>

                <Col style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Text strong style={{ fontSize: '14px', color: 'black', marginBottom: '4px' }}>Payment Status</Text>
                  <Tag
                    color="success"
                    icon={<CheckCircleOutlined />}
                    style={{
                      border: '1px dashed #52c41a',
                      fontWeight: '500'
                    }}
                  >
                    Paid
                  </Tag>
                </Col>

                <Col flex="1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <div style={{ textAlign: 'right', marginBottom:'4px' }}>
                    <div>
                      <Text strong style={{ color: '#52c41a', fontSize: '14px' }}>
                        ₹{order.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </Text>
                    </div>
                    <div>
                      <Tag
                        color={getStatusColor(order.deliveryStatus)}
                        icon={getStatusIcon(order.deliveryStatus)}
                        style={{ marginRight: 0, border: '1px dashed'}}
                      >
                        {order.deliveryStatus}
                      </Tag>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
};

const CustomerInsights: React.FC<{ orders: IOrder[] }> = ({ orders }) => {
  const topCustomers = orders.reduce((acc, order) => {
    const email = order.user?.email || 'unknown@example.com';
    const name = order.user?.name || 'Unknown Customer';

    if (!acc[email]) {
      acc[email] = {
        name,
        email,
        totalSpent: 0,
        orderCount: 0
      };
    }

    acc[email].totalSpent += order.totalAmount;
    acc[email].orderCount += 1;

    return acc;
  }, {} as Record<string, { name: string; email: string; totalSpent: number; orderCount: number }>);

  const topCustomersList = Object.values(topCustomers)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 3);

  const averageOrderValue = orders.length > 0
    ? orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length
    : 0;

  return (
    <Card
      title={
        <Space>
          <StarOutlined style={{ color: '#722ed1' }} />
          <span>Customer Insights</span>
        </Space>
      }
      style={{
        height: '100%',
        border: '2px dashed #b7eb8f',
        boxShadow: '0 4px 16px rgba(183, 235, 143, 0.2)'
      }}
      headStyle={{ borderBottom: '1px solid #f0f0f0' }}
      bodyStyle={{ padding: '16px 24px' }}
    >
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col span={12}>
          <Statistic
            title="Avg Order Value"
            value={averageOrderValue}
            precision={2}
            valueStyle={{ color: '#722ed1', fontSize: '16px' }}
            prefix="₹"
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="Top Customers"
            value={topCustomersList.length}
            valueStyle={{ color: '#1890ff', fontSize: '16px' }}
            prefix={<TeamOutlined />}
          />
        </Col>
      </Row>

      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: '14px', color: '#262626' }}>
          Top Spending Customers
        </Text>
      </div>

      <List
        dataSource={topCustomersList}
        size="small"
        renderItem={(customer, index) => (
          <List.Item
            style={{
              padding: '8px 0',
              borderBottom: index === topCustomersList.length - 1 ? 'none' : '1px solid #f5f5f5'
            }}
          >
            <List.Item.Meta
              avatar={
                <Avatar
                  size="small"
                  style={{
                    backgroundColor: '#f0f2ff',
                    color: '#722ed1',
                    fontSize: '12px'
                  }}
                >
                  {customer.name.charAt(0).toUpperCase()}
                </Avatar>
              }
              title={
                <Row justify="space-between" align="middle">
                  <Col flex="1">
                    <Text strong style={{ fontSize: '13px' }}>
                      {customer.name}
                    </Text>
                  </Col>
                  <Col>
                    <Text style={{ color: '#52c41a', fontSize: '13px', fontWeight: 500 }}>
                      ₹{customer.totalSpent.toLocaleString('en-IN')}
                    </Text>
                  </Col>
                </Row>
              }
              description={
                <Row justify="space-between" align="middle">
                  <Col flex="1">
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                      {customer.orderCount} orders
                    </Text>
                  </Col>
                  <Col>
                    <Tag color="blue">
                      #{index + 1}
                    </Tag>
                  </Col>
                </Row>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

const MyCampaign: React.FC<{ orders: IOrder[] }> = ({ orders }) => {
  const totalOrders = orders.length;
  const totalUsers = new Set(orders.map(order => order.user?.email).filter(Boolean)).size;
  const activeUsers = new Set(
    orders
      .filter(order =>
        new Date(order.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      )
      .map(order => order.user?.email || order.user?._id)
      .filter(Boolean)
  ).size;
  const allSpend = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  const stats = [
    {
      title: 'Total Orders',
      value: totalOrders,
      change: '+2.6%',
      trend: 'up',
      color: '#52c41a',
      icon: <ShoppingCartOutlined />
    },
    {
      title: 'Total Users',
      value: totalUsers,
      change: '+4.6%',
      trend: 'up',
      color: '#1890ff',
      icon: <TeamOutlined />
    },
    {
      title: 'Active Users',
      value: activeUsers,
      change: '+1.8%',
      trend: 'up',
      color: '#722ed1',
      icon: <UserOutlined />
    },
    {
      title: 'Total Revenue',
      value: `₹${allSpend.toLocaleString('en-IN')}`,
      change: '+7.2%',
      trend: 'up',
      color: '#fa8c16',
      icon: <span style={{ fontSize: '16px' }}>₹</span>
    }
  ];

  return (
    <Row gutter={[24, 16]}>
      {stats.map((stat, index) => (
        <Col xs={24} sm={12} md={6} key={index}>
          <Card
            style={{
              textAlign: 'center',
              height: '100%',
              border: '2px dashed #b7eb8f',
              boxShadow: '0 4px 16px rgba(183, 235, 143, 0.2)',
              borderRadius: '16px'
            }}
            bodyStyle={{ padding: '24px 16px' }}
          >
            <Row justify="center" style={{ marginBottom: 16 }}>
              <Col>
                <Avatar
                  size={48}
                  style={{
                    backgroundColor: `${stat.color}15`,
                    color: stat.color,
                    marginBottom: 8
                  }}
                  icon={stat.icon}
                />
              </Col>
            </Row>
            <Row justify="center">
              <Col span={24}>
                <Statistic
                  title={stat.title}
                  value={typeof stat.value === 'number' ? stat.value : stat.value.replace('₹', '')}
                  precision={typeof stat.value === 'string' && stat.value.includes('₹') ? 0 : undefined}
                  prefix={typeof stat.value === 'string' && stat.value.includes('₹') ? '₹' : undefined}
                  valueStyle={{
                    color: '#262626',
                    fontSize: '24px',
                    fontWeight: 'bold'
                  }}
                />
              </Col>
            </Row>
            <Row justify="center" align="middle" gutter={4} style={{ marginTop: 8 }}>
              <Col>
                {stat.trend === 'up' ? (
                  <RiseOutlined style={{ color: '#52c41a', fontSize: '12px' }} />
                ) : (
                  <FallOutlined style={{ color: '#ff4d4f', fontSize: '12px' }} />
                )}
              </Col>
              <Col>
                <Text style={{
                  color: stat.trend === 'up' ? '#52c41a' : '#ff4d4f',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {stat.change}
                </Text>
              </Col>
              <Col>
                <Text type="secondary" style={{ fontSize: '12px' }}>vs last month</Text>
              </Col>
            </Row>
          </Card>
        </Col>
      ))}
    </Row>
  );
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
              Loading analytics data...
            </Text>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

const OrderAnalytics: React.FC = () => {
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
      <div style={{ padding: '40px 24px', maxWidth: 1250, margin: '0 auto' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px 24px', maxWidth: 1250, margin: '0 auto' }}>
        {contextHolder}
        <Row justify="center" style={{ padding: '40px 0' }}>
          <Col xs={24} sm={20} md={16} lg={12}>
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
              action={
                <Button
                  size="small"
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={fetchOrders}
                >
                  Retry
                </Button>
              }
            />
          </Col>
        </Row>
      </div>
    );
  }

  return (
    <div style={{
      padding: '24px',
      maxWidth: 1250,
      margin: '0 auto',
      minHeight: '100vh'
    }}>
      {contextHolder}

      <Row justify="space-between" align="middle" style={{ marginBottom: '32px' }} gutter={[16, 16]}>
        <Col xs={24} md={12} lg={16}>
          <Title level={1} style={{
            margin: 0,
            color: "#52c41a",
            fontSize: 'clamp(24px, 4vw, 32px)',
            lineHeight: 1.2
          }}>
            Analytics Dashboard
          </Title>
          <Text type="secondary" style={{
            fontSize: 'clamp(14px, 2vw, 16px)',
            display: 'block',
            marginTop: '4px'
          }}>
            Monitor your business performance and growth
          </Text>
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Row justify="end" gutter={[16, 16]}>
            <Col>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={fetchOrders}
                loading={loading}
              >
                Refresh Data
              </Button>
            </Col>
            <Col>
              <Row justify="end">
                <Col span={24}>
                  <Text type="secondary" style={{ display: 'block', fontSize: '12px', textAlign: 'right' }}>
                    Content Management
                  </Text>
                </Col>
                <Col>
                  <Space>
                    <UserOutlined style={{ color: '#1890ff' }} />
                    <Text strong>Manager</Text>
                  </Space>
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>

      <Row style={{ marginBottom: '32px' }}>
        <Col span={24}>
          <MyCampaign orders={orders} />
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <CampaignStatistic orders={orders} />
        </Col>
        <Col xs={24} lg={8}>
          <WeeklyEarning orders={orders} />
        </Col>
      </Row>

      <Row gutter={[16, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24} md={12}>
          <LatestCampaign orders={orders} />
        </Col>
        <Col xs={24} md={12}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <OrderStatistics orders={orders} />
            </Col>
            <Col span={24}>
              <CustomerInsights orders={orders} />
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default OrderAnalytics;