import React, { useState, useEffect, useContext } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Avatar,
  Badge,
  Space,
  Typography,
  message,
  Spin,
  Row,
  Col,
  Upload,
  Modal,
  Tag,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  CrownOutlined,
  CameraOutlined,
  PlusOutlined,
  EditOutlined,
  LockOutlined,
  SafetyOutlined,
  KeyOutlined,
} from '@ant-design/icons';
import { AuthContext } from '../context/AuthContext';

const { Title, Text, Paragraph } = Typography;

interface ShippingAddress {
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  image?: string;
  shippingAddress?: ShippingAddress;
}

const ProfilePage: React.FC = () => {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [hasAddress, setHasAddress] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const authContext = useContext(AuthContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setFetchLoading(true);
      
      const token = authContext?.token || localStorage.getItem('token');
      
      if (!token) {
        messageApi.error('Authentication token not found. Please login again.');
        setFetchLoading(false);
        return;
      }

      const response = await fetch(`${backendUrl}/api/auth/getme`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      if (data.success) {
        setProfileData(data.user);
        setImageUrl(data.user.image || '');

        const hasShippingAddress =
          data.user.shippingAddress &&
          Object.values(data.user.shippingAddress).some((val) => val);

        setHasAddress(hasShippingAddress);

        form.setFieldsValue({
          fullName: data.user.shippingAddress?.fullName || '',
          phone: data.user.shippingAddress?.phone || '',
          addressLine1: data.user.shippingAddress?.addressLine1 || '',
          addressLine2: data.user.shippingAddress?.addressLine2 || '',
          city: data.user.shippingAddress?.city || '',
          state: data.user.shippingAddress?.state || '',
          postalCode: data.user.shippingAddress?.postalCode || '',
          country: data.user.shippingAddress?.country || '',
        });
      } else {
        messageApi.error(data.message || 'Failed to fetch profile');
      }
    } catch (error) {
      messageApi.error('Failed to fetch profile. Please try logging in again.');
      console.error('Fetch profile error:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setImageUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const token = authContext?.token || localStorage.getItem('token');

      const response = await fetch(`${backendUrl}/api/auth/upload-image`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setImageUrl(data.image);
        setProfileData(data.user);
        messageApi.success('Image uploaded successfully');

        if (authContext?.user && authContext.token) {
          authContext.login(data.user, authContext.token);
        }
      } else {
        messageApi.error(data.message || 'Failed to upload image');
      }
    } catch (error) {
      messageApi.error('Failed to upload image');
      console.error('Upload error:', error);
    } finally {
      setImageUploading(false);
    }
  };

  const handleAddressSubmit = async (values: any) => {
    try {
      setLoading(true);
      const token = authContext?.token || localStorage.getItem('token');

      const response = await fetch(`${backendUrl}/api/auth/updateprofile`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shippingAddress: {
            fullName: values.fullName,
            phone: values.phone,
            addressLine1: values.addressLine1,
            addressLine2: values.addressLine2,
            city: values.city,
            state: values.state,
            postalCode: values.postalCode,
            country: values.country,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setProfileData(data.user);
        setHasAddress(true);
        setShowAddressModal(false);
        messageApi.success('Address updated successfully');

        if (authContext?.user && authContext.token) {
          authContext.login(data.user, authContext.token);
        }
      } else {
        messageApi.error(data.message || 'Failed to update address');
      }
    } catch (error) {
      messageApi.error('Failed to update address');
      console.error('Update address error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values: any) => {
    try {
      setPasswordLoading(true);
      const token = authContext?.token || localStorage.getItem('token');

      const response = await fetch(`${backendUrl}/api/auth/update-password`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        messageApi.success('Password changed successfully');
        setShowPasswordModal(false);
        passwordForm.resetFields();
      } else {
        messageApi.error(data.message || 'Failed to change password');
      }
    } catch (error) {
      messageApi.error('Failed to change password');
      console.error('Change password error:', error);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          padding: '20px',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  const displayUser = profileData || authContext?.user;

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '40px 20px',
        backgroundColor: '#f5f5f5',
      }}
    >
      {contextHolder}
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <Card
          style={{
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #baf99aff',
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #f6ffed 0%, #ffffff 100%)'
          }}
        >
          <div
            style={{
              padding: '40px',
              textAlign: 'center',
              borderBottom: '1px solid #e8e8e8',
            }}
          >
            <Badge
              count={
                displayUser?.role === 'admin' ? (
                  <CrownOutlined
                    style={{ color: '#ffd700', fontSize: '24px' }}
                  />
                ) : (0)
              }
              offset={[-10, 10]}
            >
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  size={120}
                  src={imageUrl || undefined}
                  icon={<UserOutlined />}
                  style={{
                    backgroundColor: imageUrl ? 'transparent' : '#52c41a',
                    color: '#fff',
                    fontSize: '48px',
                    border: '4px solid #e8e8e8',
                  }}
                />
                <Upload
                  showUploadList={false}
                  beforeUpload={(file) => {
                    handleImageUpload(file);
                    return false;
                  }}
                  accept="image/*"
                >
                  <Button
                    shape="circle"
                    icon={<CameraOutlined />}
                    loading={imageUploading}
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: '#fff',
                      border: '2px solid #52c41a',
                      color: '#52c41a',
                      width: '44px',
                      height: '44px',
                    }}
                  />
                </Upload>
              </div>
            </Badge>

            <Title
              level={2}
              style={{ marginTop: '20px', marginBottom: '12px' }}
            >
              {displayUser?.name || 'User'}
            </Title>

            <Space direction="vertical" size={8}>
              <Text style={{ fontSize: '18px', color: '#666' }}>
                <MailOutlined style={{ marginRight: '8px' }} />
                {displayUser?.email}
              </Text>
              <div style={{ marginTop: '8px' }}>
                <Tag
                  color={displayUser?.role === 'admin' ? 'gold' : 'blue'}
                  style={{
                    fontSize: '14px',
                    padding: '4px 16px',
                    textTransform: 'capitalize',
                    border: '1px dashed'
                  }}
                >
                  {displayUser?.role}
                </Tag>
              </div>
            </Space>
          </div>
        </Card>

        <Card
          title={
            <span>
              <HomeOutlined /> Shipping Address
            </span>
          }
          style={{
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #a8dadc',
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #e0f2f7 0%, #ffffff 100%)'
          }}
          extra={
            hasAddress && (
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => setShowAddressModal(true)}
              >
                Edit
              </Button>
            )
          }
        >
          {hasAddress ? (
            <div>
              <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: '12px' }}>
                    <Text strong style={{ color: '#666' }}>
                      Full Name
                    </Text>
                    <div>
                      <Text>
                        {profileData?.shippingAddress?.fullName}
                      </Text>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: '12px' }}>
                    <Text strong style={{ color: '#666' }}>
                      Phone
                    </Text>
                    <div>
                      <Text>{profileData?.shippingAddress?.phone}</Text>
                    </div>
                  </div>
                </Col>
              </Row>

              <div style={{ marginBottom: '12px' }}>
                <Text strong style={{ color: '#666' }}>
                  Address Line 1
                </Text>
                <div>
                  <Text>{profileData?.shippingAddress?.addressLine1}</Text>
                </div>
              </div>

              {profileData?.shippingAddress?.addressLine2 && (
                <div style={{ marginBottom: '12px' }}>
                  <Text strong style={{ color: '#666' }}>
                    Address Line 2
                  </Text>
                  <div>
                    <Text>{profileData?.shippingAddress?.addressLine2}</Text>
                  </div>
                </div>
              )}

              <Row gutter={16} style={{ marginBottom: '12px' }}>
                <Col xs={24} sm={12}>
                  <div>
                    <Text strong style={{ color: '#666' }}>
                      City
                    </Text>
                    <div>
                      <Text>{profileData?.shippingAddress?.city}</Text>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div>
                    <Text strong style={{ color: '#666' }}>
                      State
                    </Text>
                    <div>
                      <Text>{profileData?.shippingAddress?.state}</Text>
                    </div>
                  </div>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <div>
                    <Text strong style={{ color: '#666' }}>
                      Postal Code
                    </Text>
                    <div>
                      <Text>{profileData?.shippingAddress?.postalCode}</Text>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div>
                    <Text strong style={{ color: '#666' }}>
                      Country
                    </Text>
                    <div>
                      <Text>{profileData?.shippingAddress?.country}</Text>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '32px',
                color: '#999',
              }}
            >
              <HomeOutlined style={{ fontSize: '32px', marginBottom: '16px' }} />
              <div style={{ marginBottom: '16px' }}>
                <Text>No shipping address added yet</Text>
              </div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setShowAddressModal(true)}
              >
                Add Shipping Address
              </Button>
            </div>
          )}
        </Card>

        <Card
          title={
            <span style={{ color: '#1890ff' }}>
              <SafetyOutlined style={{ marginRight: '8px' }} />
              Security Settings
            </span>
          }
          style={{
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #91d5ff',
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%)'
          }}
        >
          <div>
            <Title level={5} style={{ marginBottom: '8px' }}>
              <KeyOutlined style={{ marginRight: '8px' }} />
              Change Password
            </Title>
            <Paragraph type="secondary" style={{ marginBottom: '16px' }}>
              Keep your account secure by regularly updating your password. Use a strong
              password that includes a mix of letters, numbers, and special characters.
            </Paragraph>
            <Button
              type="primary"
              icon={<LockOutlined />}
              onClick={() => setShowPasswordModal(true)}
            >
              Change Password
            </Button>
          </div>
        </Card>

        <Modal
          title="Shipping Address"
          open={showAddressModal}
          onOk={() => form.submit()}
          onCancel={() => setShowAddressModal(false)}
          confirmLoading={loading}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddressSubmit}
          >
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Full Name"
                  name="fullName"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter full name',
                    },
                  ]}
                >
                  <Input
                    prefix={
                      <UserOutlined style={{ color: '#52c41a' }} />
                    }
                    placeholder="Full name"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Phone Number"
                  name="phone"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter phone number',
                    },
                    {
                      pattern: /^[0-9+\-\s()]+$/,
                      message: 'Please enter valid phone number',
                    },
                  ]}
                >
                  <Input
                    prefix={
                      <PhoneOutlined style={{ color: '#52c41a' }} />
                    }
                    placeholder="+1 (555) 000-0000"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Address Line 1"
              name="addressLine1"
              rules={[
                { required: true, message: 'Please enter address' },
              ]}
            >
              <Input
                prefix={<HomeOutlined style={{ color: '#52c41a' }} />}
                placeholder="Street address"
                size="large"
              />
            </Form.Item>

            <Form.Item label="Address Line 2" name="addressLine2">
              <Input
                prefix={<HomeOutlined style={{ color: '#52c41a' }} />}
                placeholder="Apartment, suite (optional)"
                size="large"
              />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="City"
                  name="city"
                  rules={[
                    { required: true, message: 'Please enter city' },
                  ]}
                >
                  <Input
                    prefix={
                      <EnvironmentOutlined style={{ color: '#52c41a' }} />
                    }
                    placeholder="City"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="State"
                  name="state"
                  rules={[
                    { required: true, message: 'Please enter state' },
                  ]}
                >
                  <Input
                    prefix={
                      <EnvironmentOutlined style={{ color: '#52c41a' }} />
                    }
                    placeholder="State"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Postal Code"
                  name="postalCode"
                  rules={[
                    { required: true, message: 'Please enter postal code' },
                  ]}
                >
                  <Input
                    prefix={
                      <EnvironmentOutlined style={{ color: '#52c41a' }} />
                    }
                    placeholder="Postal Code"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Country"
                  name="country"
                  rules={[
                    { required: true, message: 'Please enter country' },
                  ]}
                >
                  <Input
                    prefix={
                      <EnvironmentOutlined style={{ color: '#52c41a' }} />
                    }
                    placeholder="Country"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>

        <Modal
          title={
            <span>
              <LockOutlined style={{ marginRight: '8px' }} />
              Change Password
            </span>
          }
          open={showPasswordModal}
          onOk={() => passwordForm.submit()}
          onCancel={() => {
            setShowPasswordModal(false);
            passwordForm.resetFields();
          }}
          confirmLoading={passwordLoading}
          width={500}
        >
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handlePasswordChange}
          >
            <Form.Item
              label="Current Password"
              name="currentPassword"
              rules={[
                {
                  required: true,
                  message: 'Please enter your current password',
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#1890ff' }} />}
                placeholder="Enter current password"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="New Password"
              name="newPassword"
              rules={[
                {
                  required: true,
                  message: 'Please enter new password',
                },
                {
                  min: 8,
                  message: 'Password must be at least 8 characters',
                },
              ]}
            >
              <Input.Password
                prefix={<KeyOutlined style={{ color: '#1890ff' }} />}
                placeholder="Enter new password"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Confirm New Password"
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                {
                  required: true,
                  message: 'Please confirm your new password',
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error('The two passwords do not match')
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<KeyOutlined style={{ color: '#1890ff' }} />}
                placeholder="Confirm new password"
                size="large"
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export type { ShippingAddress };
export default ProfilePage;