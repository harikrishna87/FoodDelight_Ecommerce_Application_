import React, { useState, useContext } from 'react';
import {
  Modal,
  Button,
  Form,
  Input,
  Alert,
  Divider,
  Typography,
  message,
  Steps
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  GoogleOutlined,
  LoginOutlined,
  UserAddOutlined,
  KeyOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const { Title, Text, Link } = Typography;

interface AuthModalProps {
  show: boolean;
  onHide: () => void;
  isLoginMode: boolean;
  onToggleMode: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ show, onHide, isLoginMode, onToggleMode }) => {
  const [form] = Form.useForm();
  const [forgotPasswordForm] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<number>(0);
  const [verifiedEmail, setVerifiedEmail] = useState<string>('');
  const auth = useContext(AuthContext);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  if (!auth) {
    console.error("AuthContext not available. AuthModal must be used within AuthProvider.");
    return null;
  }

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setError(null);

    try {
      const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/register';
      const payload = isLoginMode
        ? { email: values.email, password: values.password }
        : { name: values.name, email: values.email, password: values.password };

      const config = {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      };

      const response = await axios.post(`${backendUrl}${endpoint}`, payload, config);

      if (response.data.success) {
        auth.login(response.data.user, response.data.token);
        messageApi.success({
          content: isLoginMode ? `Welcome back ${response.data.user.email}` : 'Account created successfully!',
          duration: 3,
          style: {
            marginTop: '10vh',
          },
        });
        onHide();
        form.resetFields();
      } else {
        const errorMsg = response.data.message || 'An error occurred.';
        setError(errorMsg);
        messageApi.error({
          content: errorMsg,
          duration: 3,
          style: {
            marginTop: '10vh',
          },
        });
      }
    } catch (err: any) {
      console.error('Auth error:', err);

      let errorMessage = 'An unexpected error occurred.';

      if (err.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check if the server is running.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      messageApi.error({
        content: errorMessage,
        duration: 3,
        style: {
          marginTop: '10vh',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (values: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${backendUrl}/api/auth/verify-email`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: values.email }),
      });

      const data = await response.json();

      if (data.success) {
        setVerifiedEmail(values.email);
        setForgotPasswordStep(1);
        messageApi.success({
          content: 'Email verified. Please enter your new password.',
          duration: 3,
          style: {
            marginTop: '10vh',
          },
        });
      } else {
        setError(data.message || 'Please check your email address.');
        messageApi.error({
          content: data.message || 'Please check your email address.',
          duration: 3,
          style: {
            marginTop: '10vh',
          },
        });
      }
    } catch (err: any) {
      console.error('Verify email error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to verify email. Please try again.';
      setError(errorMessage);
      messageApi.error({
        content: errorMessage,
        duration: 3,
        style: {
          marginTop: '10vh',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (values: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${backendUrl}/api/auth/reset-password`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: verifiedEmail,
          newPassword: values.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        messageApi.success({
          content: 'Password reset successfully. Please login with your new password.',
          duration: 3,
          style: {
            marginTop: '10vh',
          },
        });
        handleCloseForgotPassword();
      } else {
        setError(data.message || 'Failed to reset password.');
        messageApi.error({
          content: data.message || 'Failed to reset password.',
          duration: 3,
          style: {
            marginTop: '10vh',
          },
        });
      }
    } catch (err: any) {
      console.error('Reset password error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to reset password. Please try again.';
      setError(errorMessage);
      messageApi.error({
        content: errorMessage,
        duration: 3,
        style: {
          marginTop: '10vh',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    messageApi.info({
      content: 'Google login is not implemented yet.',
      duration: 3,
      style: {
        marginTop: '10vh',
      },
    });
  };

  const handleModalClose = () => {
    form.resetFields();
    setError(null);
    onHide();
  };

  const handleToggleMode = () => {
    form.resetFields();
    setError(null);
    onToggleMode();
  };

  const handleOpenForgotPassword = () => {
    setShowForgotPassword(true);
    setForgotPasswordStep(0);
    setError(null);
    forgotPasswordForm.resetFields();
    handleModalClose();
  };

  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotPasswordStep(0);
    setVerifiedEmail('');
    setError(null);
    forgotPasswordForm.resetFields();
  };

  return (
    <>
      {contextHolder}
      <Modal
        open={show}
        onCancel={handleModalClose}
        footer={null}
        centered
        width={480}
        closable={true}
        styles={{
          body: { padding: '32px' },
          content: {
            boxShadow: "none",
            border: "1px solid #e0e0e0",
            borderRadius: "20px"
          },
          mask: { backgroundColor: 'rgba(0, 0, 0, 0.45)' }
        }}
        destroyOnClose
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={3} style={{ color: '#52c41a', margin: '0 0 8px 0', fontWeight: 600 }}>
            {isLoginMode ? 'Login to FoodDelights' : 'Register for FoodDelights'}
          </Title>
          <Text style={{ color: '#8c8c8c', fontSize: '14px' }}>
            {isLoginMode ? 'Sign in to your account' : 'Create your account today'}
          </Text>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{
              marginBottom: '24px',
              borderRadius: '6px',
              boxShadow: 'none'
            }}
          />
        )}

        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          requiredMark={false}
          size="large"
        >
          {!isLoginMode && (
            <Form.Item
              name="name"
              label={<Text strong>Full Name</Text>}
              rules={[{ required: true, message: 'Please enter your name' }]}
              style={{ marginBottom: '20px' }}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#52c41a' }} />}
                placeholder="Enter your name"
                style={{
                  borderRadius: '6px',
                  borderColor: '#52c41a',
                  boxShadow: 'none'
                }}
                className="no-hover-effect"
              />
            </Form.Item>
          )}

          <Form.Item
            name="email"
            label={<Text strong>Email address</Text>}
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
            style={{ marginBottom: '20px' }}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#52c41a' }} />}
              placeholder="Enter email"
              style={{
                borderRadius: '6px',
                borderColor: '#52c41a',
                boxShadow: 'none'
              }}
              className="no-hover-effect"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={<Text strong>Password</Text>}
            rules={[{ required: true, message: 'Please enter your password' }]}
            style={{ marginBottom: '8px' }}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#52c41a' }} />}
              placeholder="Password"
              style={{
                borderRadius: '6px',
                borderColor: '#52c41a',
                boxShadow: 'none'
              }}
              className="no-hover-effect"
            />
          </Form.Item>

          {isLoginMode && (
            <div style={{ textAlign: 'right', marginBottom: '24px' }}>
              <Link
                onClick={handleOpenForgotPassword}
                style={{
                  color: '#52c41a',
                  fontWeight: 500,
                  textDecoration: 'none',
                  fontSize: '14px'
                }}
                className="no-hover-effect"
              >
                Forgot Password?
              </Link>
            </div>
          )}

          <Form.Item style={{ marginBottom: '20px', marginTop: !isLoginMode ? '24px' : '0' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              icon={isLoginMode ? <LoginOutlined /> : <UserAddOutlined />}
              style={{
                height: '44px',
                borderRadius: '6px',
                backgroundColor: '#52c41a',
                borderColor: '#52c41a',
                fontSize: '16px',
                fontWeight: 500,
                boxShadow: 'none'
              }}
              className="no-hover-effect"
            >
              {isLoginMode ? 'Login' : 'Register'}
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ margin: '20px 0', color: '#8c8c8c' }}>
          <Text type="secondary" style={{ fontSize: '14px' }}>or continue with</Text>
        </Divider>

        <Button
          block
          size="large"
          icon={<GoogleOutlined />}
          onClick={handleGoogleLogin}
          style={{
            height: '44px',
            borderRadius: '6px',
            border: '1px solid #1890ff',
            fontSize: '16px',
            fontWeight: 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '24px',
            boxShadow: 'none',
            color: '#1890ff'
          }}
          className="no-hover-effect"
        >
          {isLoginMode ? 'Login with Google' : 'Register with Google'}
        </Button>

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: '14px' }}>
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
          </Text>
          <Link
            onClick={handleToggleMode}
            style={{
              color: '#52c41a',
              fontWeight: 500,
              textDecoration: 'none',
              fontSize: '14px'
            }}
            className="no-hover-effect"
          >
            {isLoginMode ? 'Register' : 'Login'}
          </Link>
        </div>

        <style>{`
        .no-hover-effect:hover {
          border-color: inherit !important;
          box-shadow: none !important;
        }
        .no-hover-effect:focus {
          border-color: inherit !important;
          box-shadow: none !important;
        }
        .ant-btn.no-hover-effect:hover {
          background-color: inherit !important;
          border-color: inherit !important;
          box-shadow: none !important;
        }
        .ant-btn-primary.no-hover-effect:hover {
          background-color: #28a745 !important;
          border-color: #28a745 !important;
        }
      `}</style>
      </Modal>

      <Modal
        open={showForgotPassword}
        onCancel={handleCloseForgotPassword}
        footer={null}
        centered
        width={480}
        closable={true}
        styles={{
          body: { padding: '32px' },
          content: {
            boxShadow: "none",
            border: "1px solid #e0e0e0",
            borderRadius: "20px"
          },
          mask: { backgroundColor: 'rgba(0, 0, 0, 0.45)' }
        }}
        destroyOnClose
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={3} style={{ color: '#52c41a', margin: '0 0 8px 0', fontWeight: 600 }}>
            Reset Password
          </Title>
          <Text style={{ color: '#8c8c8c', fontSize: '14px' }}>
            {forgotPasswordStep === 0 ? 'Enter your email to verify' : 'Enter your new password'}
          </Text>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <Steps
            current={forgotPasswordStep}
            size="small"
            items={[
              {
                title: 'Verify Email',
                icon: <MailOutlined />,
              },
              {
                title: 'Reset Password',
                icon: <KeyOutlined />,
              },
            ]}
          />
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{
              marginBottom: '24px',
              borderRadius: '6px',
              boxShadow: 'none'
            }}
          />
        )}

        {forgotPasswordStep === 0 ? (
          <Form
            form={forgotPasswordForm}
            onFinish={handleVerifyEmail}
            layout="vertical"
            requiredMark={false}
            size="large"
          >
            <Form.Item
              name="email"
              label={<Text strong>Email Address</Text>}
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
              style={{ marginBottom: '24px' }}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#52c41a' }} />}
                placeholder="Enter your email"
                style={{
                  borderRadius: '6px',
                  borderColor: '#52c41a',
                  boxShadow: 'none'
                }}
                className="no-hover-effect"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: '0' }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                style={{
                  height: '44px',
                  borderRadius: '6px',
                  backgroundColor: '#52c41a',
                  borderColor: '#52c41a',
                  fontSize: '16px',
                  fontWeight: 500,
                  boxShadow: 'none'
                }}
                className="no-hover-effect"
              >
                Verify Email
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <Form
            form={forgotPasswordForm}
            onFinish={handleResetPassword}
            layout="vertical"
            requiredMark={false}
            size="large"
          >
            <Form.Item
              name="newPassword"
              label={<Text strong>New Password</Text>}
              rules={[
                { required: true, message: 'Please enter new password' },
                { min: 8, message: 'Password must be at least 8 characters' }
              ]}
              style={{ marginBottom: '20px' }}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#52c41a' }} />}
                placeholder="Enter new password"
                style={{
                  borderRadius: '6px',
                  borderColor: '#52c41a',
                  boxShadow: 'none'
                }}
                className="no-hover-effect"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label={<Text strong>Confirm New Password</Text>}
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Please confirm your new password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords do not match'));
                  },
                }),
              ]}
              style={{ marginBottom: '24px' }}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#52c41a' }} />}
                placeholder="Confirm new password"
                style={{
                  borderRadius: '6px',
                  borderColor: '#52c41a',
                  boxShadow: 'none'
                }}
                className="no-hover-effect"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: '0' }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                style={{
                  height: '44px',
                  borderRadius: '6px',
                  backgroundColor: '#52c41a',
                  borderColor: '#52c41a',
                  fontSize: '16px',
                  fontWeight: 500,
                  boxShadow: 'none'
                }}
                className="no-hover-effect"
              >
                Reset Password
              </Button>
            </Form.Item>
          </Form>
        )}

        <style>{`
        .no-hover-effect:hover {
          border-color: inherit !important;
          box-shadow: none !important;
        }
        .no-hover-effect:focus {
          border-color: inherit !important;
          box-shadow: none !important;
        }
        .ant-btn.no-hover-effect:hover {
          background-color: inherit !important;
          border-color: inherit !important;
          box-shadow: none !important;
        }
        .ant-btn-primary.no-hover-effect:hover {
          background-color: #28a745 !important;
          border-color: #28a745 !important;
        }
      `}</style>
      </Modal>
    </>
  );
};

export default AuthModal;