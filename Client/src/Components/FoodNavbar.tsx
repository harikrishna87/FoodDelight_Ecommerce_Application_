import React, { useState, useEffect, useContext } from 'react';
import {
  Layout,
  Menu,
  Button,
  Badge,
  Drawer,
  Card,
  Image,
  Tag,
  Typography,
  Space,
  Modal,
  Avatar,
  Grid
} from 'antd';
import {
  ShoppingCartOutlined,
  PlusOutlined,
  MinusOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  LogoutOutlined,
  LoginOutlined,
  DashboardOutlined,
  UnorderedListOutlined,
  MenuOutlined,
  CheckCircleOutlined,
  HomeOutlined,
  ContactsOutlined
} from '@ant-design/icons';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from "axios";
import confetti from "canvas-confetti";
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import AuthModal from './AuthModal';

declare const Razorpay: any;

const { Header } = Layout;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

interface CartItem {
  _id: string;
  name: string;
  image: string;
  original_price: number;
  discount_price: number;
  quantity: number;
  category: string;
  description?: string;
}

const FoodNavbar: React.FC = () => {
  const [showCart, setShowCart] = useState<boolean>(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [cartCount, setCartCount] = useState<number>(0);
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const [countdownValue, setCountdownValue] = useState<number>(10);
  const [mobileMenuVisible, setMobileMenuVisible] = useState<boolean>(false);
  
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);

  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const screens = useBreakpoint();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const fetchCartItems = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/cart/get_cart_items`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (data && data.Cart_Items) {
        setCartItems(data.Cart_Items);
        const count = data.Cart_Items.reduce((total: number, item: CartItem) => total + item.quantity, 0);
        setCartCount(count);
      }
    } catch (error) {
      console.error('Failed to fetch cart items:', error);
    }
  };

  const clearCart = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/cart/clear_cart`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setCartItems([]);
        setCartCount(0);
      } else {
        console.error('Failed to clear cart');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  useEffect(() => {
    fetchCartItems();
    
    const pollingInterval = setInterval(() => {
      fetchCartItems();
    }, 2000);
    
    const handleCartUpdate = () => {
      fetchCartItems();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.updateCartCount = fetchCartItems;
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      clearInterval(pollingInterval);
      delete window.updateCartCount;
    };
  }, []);

  const logout = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        if (auth?.logout) {
          auth.logout();
        }
        
        setCartItems([]);
        setCartCount(0);
        setShowCart(false);
        setMobileMenuVisible(false);
        
        toast.success("Logged out successfully", { position: "top-right" });
        
        setTimeout(() => {
          navigate("/")
        }, 1000);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Logout failed', { position: "top-right" });
      }
    } catch (err) {
      console.error('Error logging out:', err);
      toast.error('Logout failed. Please try again.', { position: "top-right" });
    }
  };

  useEffect(() => {
    const count = cartItems.reduce((total, item) => total + item.quantity, 0);
    setCartCount(count);
  }, [cartItems]);

  const totalPrice = cartItems.reduce((sum, item) => sum + item.discount_price * item.quantity, 0).toFixed(2);

  const handleCartToggle = (): void => {
    setShowCart(!showCart);
    if (!showCart) {
      fetchCartItems();
    }
  };

  const handleDeleteItem = async (name: string) => {
    try {
      const res = await fetch(`${backendUrl}/api/cart/delete_cart_item/${encodeURIComponent(name)}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setCartItems(prevItems => prevItems.filter(item => item.name !== name));
        toast.success("Item removed from cart", { position: "top-right" });
      } else {
        toast.error("Failed to remove item", { position: "top-right" });
      }
    } catch (error) {
      console.error('Error deleting item from cart:', error);
      toast.error("Failed to remove item", { position: "top-right" });
    }
  };

  const handleUpdateQuantity = async (_id: string, quantity: number) => {
    if (quantity < 1) return;
    
    const updatedItems = cartItems.map(item =>
      item._id === _id ? { ...item, quantity } : item
    );
    setCartItems(updatedItems);
    
    try {
      const res = await fetch(`${backendUrl}/api/cart/update_cart_quantity`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ _id, quantity }),
      });
      if (!res.ok) {
        throw new Error('Failed to update item quantity');
      }
      toast.success("Quantity updated", { position: "top-right", autoClose: 1500 });
    } catch (error) {
      console.error('Error updating item quantity:', error);
      toast.error("Failed to update quantity", { position: "top-right" });
      fetchCartItems();
    }
  };

  const toggleItemDescription = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const getCategoryColor = (category: string): string => {
    switch (category.toLowerCase()) {
      case 'appetizer':
        return 'blue';
      case 'main course':
        return 'red';
      case 'dessert':
        return 'orange';
      case 'beverage':
        return 'cyan';
      default:
        return 'green';
    }
  };

  const triggerConfetti = () => {
    const duration = 10 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1060 };
    
    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;
    
    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      
      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  const handleOrderSuccess = async () => {
    try {
        const createOrderResponse = await axios.post(`${backendUrl}/api/orders`, {}, {
            headers: {
                Authorization: `Bearer ${auth?.token}`
            },
            withCredentials: true
        });

        if (createOrderResponse.data.success) {
            toast.success(createOrderResponse.data.message, { position: "top-right" });
            clearCart();
            setShowCart(false);
            setShowSuccessMessage(true);
            setCountdownValue(10);
            triggerConfetti();
        } else {
            toast.error(createOrderResponse.data.message || "Failed to create order", { position: "top-right" });
        }
    } catch (error: any) {
        console.error("Error creating order:", error);
        toast.error(error.response?.data?.message || "Failed to finalize order", { position: "top-right" });
    }
  };
  
  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;
    
    if (showSuccessMessage && countdownValue > 0) {
      countdownInterval = setInterval(() => {
        setCountdownValue(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setShowSuccessMessage(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [showSuccessMessage, countdownValue]);

  const checkoutHandler = async (amount: number | string) => {
    if (!auth?.isAuthenticated) {
        toast.error("You need to login to proceed to checkout", { position: "top-right" });
        setShowAuthModal(true);
        setIsLoginMode(true);
        return;
    }
    
    if (cartItems.length === 0) {
        toast.info("Your cart is empty!", { position: "top-right" });
        return;
    }

    try {
      const { data: keyData } = await axios.get(`${backendUrl}/razorpay/getkey`);
      const { key } = keyData;

      const { data: orderData } = await axios.post(`${backendUrl}/razorpay/payment/process`, {
        amount: Number(amount)
      });
      const { order } = orderData;

      const options = {
        key,
        amount: order.amount,
        currency: 'INR',
        name: 'FoodDelights',
        description: 'Food Order Payment',
        order_id: order.id,
        prefill: {
          name: auth.user?.name || "Customer",
          email: auth.user?.email || "customer@example.com",
          contact: ''
        },
        theme: {
          color: '#52c41a'
        },
        handler: function(response: any) {
          if (response.razorpay_payment_id) {
            handleOrderSuccess();
          } else {
            toast.error("Payment failed or cancelled.", { position: "top-right" });
          }
        },
        modal: {
            ondismiss: function() {
                toast.info("Payment window closed.", { position: "top-right" });
            }
        }
      };

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.response?.data?.message || "Failed to initiate payment", { position: "top-right" });
    }
  };

  const handleLogoutClick = () => {
    setMobileMenuVisible(false);
    logout();
  };

  const isAdmin = auth?.user?.role === 'admin';

  const getMenuItems = () => {
    if (auth?.isAuthenticated) {
      if (isAdmin) {
        return [
          {
            key: 'admin',
            icon: <DashboardOutlined />,
            label: <span onClick={() => { setMobileMenuVisible(false); navigate('/admin'); }}>Admin Dashboard</span>,
          },
          {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: <span onClick={handleLogoutClick}>Logout</span>,
            style: { color: '#1890ff' }
          }
        ];
      } else {
        return [
          {
            key: 'home',
            icon: <HomeOutlined/>,
            label: <span onClick={() => { setMobileMenuVisible(false); navigate('/'); }}>Home</span>,
          },
          {
            key: 'menu',
            icon: <MenuOutlined/>,
            label: <span onClick={() => { setMobileMenuVisible(false); navigate('/menu-items'); }}>Menu</span>,
          },
          {
            key: 'contact',
            icon: <ContactsOutlined/>,
            label: <span onClick={() => { setMobileMenuVisible(false); navigate('/contact'); }}>Contact</span>,
          },
          {
            key: 'orders',
            icon: <UnorderedListOutlined />,
            label: <span onClick={() => { setMobileMenuVisible(false); navigate('/my-orders'); }}>My Orders</span>,
          },
          {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: <span onClick={handleLogoutClick}>Logout</span>,
            style: { color: '#1890ff' }
          }
        ];
      }
    } else {
      return [
        {
          key: 'home',
          icon: <HomeOutlined />,
          label: <span onClick={() => { setMobileMenuVisible(false); navigate('/'); }}>Home</span>,
        },
        {
          key: 'menu',
          icon: <MenuOutlined />,
          label: <span onClick={() => { setMobileMenuVisible(false); navigate('/menu-items'); }}>Menu</span>,
        },
        {
          key: 'contact',
          icon: <ContactsOutlined />,
          label: <span onClick={() => { setMobileMenuVisible(false); navigate('/contact'); }}>Contact</span>,
        },
        {
          key: 'login',
          icon: <LoginOutlined />,
          label: <span onClick={() => { setMobileMenuVisible(false); setShowAuthModal(true); setIsLoginMode(true); }}>Login / Register</span>,
          style: { color: '#52c41a' }
        }
      ];
    }
  };

  return (
    <>
      <Header 
        style={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 1000, 
          width: '100%', 
          background: '#fff', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          padding: '0 16px',
          height: 'auto',
          lineHeight: 'normal'
        }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '8px 0'
        }}>
          <Title 
            level={3} 
            style={{ 
              margin: 0, 
              color: '#52c41a', 
              fontWeight: 'bold',
              fontSize: screens.xs ? '20px' : '28px'
            }}
          >
            <NavLink to="/" style={{ color: '#52c41a', textDecoration: 'none' }}>
              FoodDelights
            </NavLink>
          </Title>

          {screens.md && (
            <Menu
              mode="horizontal"
              style={{ 
                border: 'none', 
                background: 'transparent',
                flex: 1,
                justifyContent: 'center'
              }}
              items={getMenuItems()}
            />
          )}

          <Space size="middle">
            {!isAdmin && (
              <Badge count={cartCount} size="small">
                <Button
                  type="text"
                  icon={<ShoppingCartOutlined style={{ fontSize: '24px' }} />}
                  onClick={handleCartToggle}
                  size="large"
                />
              </Badge>
            )}

            {!screens.md && (
              <Button
                type="text"
                icon={<MenuOutlined style={{ fontSize: '20px' }} />}
                onClick={() => setMobileMenuVisible(true)}
                size="large"
              />
            )}
          </Space>
        </div>
      </Header>

      <Drawer
        title="Menu"
        placement="left"
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
        width={screens.xs ? '80%' : 300}
      >
        <Menu
          mode="vertical"
          style={{ border: 'none' }}
          items={getMenuItems()}
        />
      </Drawer>

      {!isAdmin && (
        <Drawer
          title="Your Cart"
          placement="right"
          onClose={() => setShowCart(false)}
          open={showCart}
          width={screens.xs ? '100%' : 400}
          bodyStyle={{ padding: 0 }}
        >
          {cartItems.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '50vh'
            }}>
              <ShoppingCartOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
              <Title level={4} style={{ marginBottom: '16px' }}>Your cart is empty</Title>
              <Button type="primary" onClick={() => setShowCart(false)}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ 
                flex: 1, 
                overflowY: 'auto', 
                padding: '16px',
                maxHeight: 'calc(100vh - 200px)'
              }}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {cartItems.map(item => (
                    <Card
                      key={item._id}
                      size="small"
                      style={{ 
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s ease-in-out'
                      }}
                      bodyStyle={{ padding: '12px' }}
                      hoverable
                    >
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={80}
                          height={80}
                          style={{ 
                            borderRadius: '8px',
                            objectFit: 'cover',
                            flexShrink: 0
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'flex-start',
                            marginBottom: '8px'
                          }}>
                            <Title level={5} style={{ margin: 0, fontSize: '14px' }}>
                              {item.name}
                            </Title>
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              size="small"
                              onClick={() => handleDeleteItem(item.name)}
                            />
                          </div>
                          
                          <div style={{ marginBottom: '8px' }}>
                            <Tag color={getCategoryColor(item.category)} style={{ borderRadius: '12px' }}>
                              {item.category}
                            </Tag>
                            <Button
                              type="link"
                              size="small"
                              icon={<InfoCircleOutlined />}
                              onClick={() => toggleItemDescription(item._id || '')}
                              style={{ padding: '0 4px', height: 'auto', fontSize: '12px' }}
                            >
                              {expandedItems[item._id || ''] ? 'Hide details' : 'Show details'}
                            </Button>
                          </div>

                          {expandedItems[item._id || ''] && (
                            <div style={{
                              background: '#f5f5f5',
                              padding: '8px',
                              borderRadius: '6px',
                              marginBottom: '8px',
                              fontSize: '12px'
                            }}>
                              {item.description || "A delicious dish made with fresh ingredients and authentic spices."}
                            </div>
                          )}

                          <div style={{ marginBottom: '8px' }}>
                            <Text delete style={{ color: '#999', marginRight: '8px' }}>
                              ₹{item.original_price}
                            </Text>
                            <Text strong style={{ color: '#52c41a' }}>
                              ₹{item.discount_price.toFixed(2)}
                            </Text>
                          </div>

                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center'
                          }}>
                            <Space>
                              <Button
                                type="primary"
                                shape="circle"
                                size="small"
                                icon={<MinusOutlined />}
                                onClick={() => handleUpdateQuantity(item._id || '', item.quantity - 1)}
                              />
                              <Text strong>{item.quantity}</Text>
                              <Button
                                type="primary"
                                shape="circle"
                                size="small"
                                icon={<PlusOutlined />}
                                onClick={() => handleUpdateQuantity(item._id || '', item.quantity + 1)}
                              />
                            </Space>
                            <Text strong>
                              ₹{(item.discount_price * item.quantity).toFixed(2)}
                            </Text>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </Space>
              </div>

              {cartItems.length > 0 && (
                <div style={{ 
                  padding: '16px', 
                  borderTop: '1px solid #f0f0f0',
                  background: '#fff'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '16px'
                  }}>
                    <Title level={4} style={{ margin: 0 }}>Total:</Title>
                    <Title level={4} style={{ margin: 0 }}>₹{totalPrice}</Title>
                  </div>
                  <Button 
                    type="primary" 
                    size="large"
                    block
                    onClick={() => checkoutHandler(totalPrice)}
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              )}
            </div>
          )}
        </Drawer>
      )}

      <Modal
        open={showSuccessMessage}
        onCancel={() => setShowSuccessMessage(false)}
        footer={[
          <Button key="continue" type="primary" onClick={() => setShowSuccessMessage(false)}>
            Continue Shopping
          </Button>
        ]}
        centered
        closable={false}
        width={screens.xs ? '90%' : 500}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ marginBottom: '24px' }}>
            <Avatar
              size={80}
              icon={<CheckCircleOutlined />}
              style={{
                backgroundColor: '#52c41a',
                animation: 'pulse 2s infinite'
              }}
            />
          </div>
          <Title level={2} style={{ color: '#52c41a', marginBottom: '16px' }}>
            Thank You For Your Purchase!
          </Title>
          <Text style={{ fontSize: '16px', display: 'block', marginBottom: '16px' }}>
            Your delicious food will be prepared shortly. We appreciate your order!
          </Text>
          <Text type="secondary">
            This window will close in {countdownValue} seconds
          </Text>
        </div>
      </Modal>

      <AuthModal
        show={showAuthModal}
        onHide={() => setShowAuthModal(false)}
        isLoginMode={isLoginMode}
        onToggleMode={() => setIsLoginMode(prev => !prev)}
      />

      <style>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(82, 196, 26, 0.7);
          }
          70% {
            box-shadow: 0 0 0 15px rgba(82, 196, 26, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(82, 196, 26, 0);
          }
        }

        .ant-menu-horizontal {
          border-bottom: none !important;
        }

        .ant-menu-horizontal > .ant-menu-item {
          font-size: 18px !important;
          font-weight: 600;
          border-bottom: none !important;
        }

        .ant-menu-horizontal > .ant-menu-item:hover {
          background-color: transparent !important;
          color: inherit !important;
          border-bottom: none !important;
        }

        .ant-menu-horizontal > .ant-menu-item::after {
          display: none !important;
        }

        .ant-menu-horizontal > .ant-menu-item:hover::after {
          display: none !important;
        }

        .ant-menu-horizontal > .ant-menu-item-selected {
          background-color: transparent !important;
          color: #333 !important;
          font-weight: 700 !important;
          border-bottom: none !important;
        }

        .ant-menu-horizontal > .ant-menu-item-selected::after {
          display: none !important;
        }

        .ant-menu-horizontal > .ant-menu-item-selected:hover {
          background-color: transparent !important;
          color: #333 !important;
          border-bottom: none !important;
        }

        .ant-menu-horizontal > .ant-menu-item-selected:hover::after {
          display: none !important;
        }

        .ant-menu-horizontal .ant-menu-item-active {
          background-color: transparent !important;
          border-bottom: none !important;
        }

        .ant-menu-horizontal .ant-menu-item-active::after {
          display: none !important;
        }

        .ant-menu-vertical > .ant-menu-item {
          font-size: 18px !important;
          font-weight: 600;
        }

        .ant-menu-vertical > .ant-menu-item:hover {
          background-color: transparent !important;
          color: inherit !important;
        }

        .ant-menu-vertical > .ant-menu-item-selected {
          background-color: transparent !important;
          color: #333 !important;
          font-weight: 700 !important;
        }

        .ant-menu-vertical > .ant-menu-item-selected:hover {
          background-color: transparent !important;
          color: #333 !important;
        }

        .ant-drawer-body::-webkit-scrollbar {
          width: 6px;
        }

        .ant-drawer-body::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .ant-drawer-body::-webkit-scrollbar-thumb {
          background: #52c41a;
          border-radius: 10px;
        }

        .ant-drawer-body::-webkit-scrollbar-thumb:hover {
          background: #389e0d;
        }

        .ant-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        }

        @media (max-width: 768px) {
          .ant-layout-header {
            padding: 0 12px !important;
          }
        }
      `}</style>
    </>
  );
};

export default FoodNavbar;