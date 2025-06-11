import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Layout, Table, Tag, Spin, Alert, Typography, Modal, Button } from 'antd';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { IOrder, OrderDeliveryStatus } from '../types';
import { CheckCircleOutlined, TruckOutlined, ClockCircleOutlined, EyeOutlined, CalendarOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const UserOrders: React.FC = () => {
  const auth = useContext(AuthContext);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

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
      toast.error(err.response?.data?.message || 'Failed to fetch your orders.', { position: 'top-right' });
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

  const getStatusBadge = (status: OrderDeliveryStatus) => {
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
      render: (_: any, record: IOrder) => (
        <Button type="link" onClick={() => showModal(record)} style={{ display: 'flex', alignItems: 'center', padding: 0 }}>
          <EyeOutlined style={{ marginRight: '4px' }} /> View Items
        </Button>
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
          <Spin size="large" style={{ color: '#28a745' }} />
          <Paragraph style={{ marginTop: '16px', color: '#28a745' }}>Loading your orders...</Paragraph>
        </Content>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ padding: '50px', textAlign: 'center', width: '1200px', margin: '0 auto' }}>
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
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
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
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
                  style: { 
                    margin: '16px',
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
            title={`Order Details - ${selectedOrder._id}`}
            open={isModalVisible}
            onCancel={handleCancel}
            footer={null}
            width={600}
            style={{ top: 20 }}
            bodyStyle={{ padding: '24px' }}
          >
            <div style={{ marginBottom: '24px' }}>
              <Title level={4} style={{ marginBottom: '16px' }}>User Details</Title>
              <div style={{ border: '1px solid #e8e8e8', borderRadius: '4px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', padding: '8px', borderBottom: '1px solid #e8e8e8' }}>
                  <span style={{ fontWeight: 'bold' }}>Customer Name:</span>
                  <span>{selectedOrder.user?.name || 'N/A'}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', padding: '8px' }}>
                  <span style={{ fontWeight: 'bold' }}>Customer Email:</span>
                  <span>{selectedOrder.user?.email || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <Title level={4} style={{ marginBottom: '16px' }}>Order Information</Title>
              <div style={{ border: '1px solid #e8e8e8', borderRadius: '4px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', padding: '8px', borderBottom: '1px solid #e8e8e8' }}>
                  <span style={{ fontWeight: 'bold' }}>Order ID:</span>
                  <span>{selectedOrder._id}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', padding: '8px', borderBottom: '1px solid #e8e8e8' }}>
                  <span style={{ fontWeight: 'bold' }}>Order Date:</span>
                  <span>{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', padding: '8px', borderBottom: '1px solid #e8e8e8' }}>
                  <span style={{ fontWeight: 'bold' }}>Total Amount:</span>
                  <span>₹{selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', padding: '8px' }}>
                  <span style={{ fontWeight: 'bold' }}>Status:</span>
                  <span style={{width: "fit-content"}}>{getStatusBadge(selectedOrder.deliveryStatus)}</span>
                </div>
              </div>
            </div>

            <Title level={4} style={{ marginBottom: '16px' }}>Order Items</Title>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '8px 0' }}>
                  <img
                    src={item.image || 'https://via.placeholder.com/80'}
                    alt={item.name}
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                  <div>
                    <Paragraph style={{ margin: 0 }}><strong>{item.name}</strong></Paragraph>
                    <Paragraph style={{ margin: 0 }}>Quantity: {item.quantity}</Paragraph>
                    <Paragraph style={{ margin: 0, color: '#28a745' }}>
                      <span style={{ textDecoration: 'line-through', color: '#6c757d', marginRight: '8px' }}>
                        ₹{(item.original_price * 1.1).toFixed(2)}
                      </span>
                      ₹{(item.discount_price || 0).toFixed(2)}
                    </Paragraph>
                  </div>
                </div>
              ))}
            </div>
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
          margin-top: 16px;
          margin-right: 16px;
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