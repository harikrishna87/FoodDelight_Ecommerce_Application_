import React, { useState, useEffect, useContext } from 'react';
import {
  Layout,
  Menu,
  Button,
  Badge,
  Drawer,
  Card,
  Tag,
  Typography,
  Space,
  Grid,
  message,
  Input
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
  HomeOutlined,
  ContactsOutlined,
  ProductOutlined,
} from '@ant-design/icons';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import axios from "axios";
import confetti from "canvas-confetti";
import { AuthContext } from '../context/AuthContext';
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

interface Coupon {
  code: string;
  type: 'percentage' | 'flat';
  value: number;
  minOrder: number;
  validTill: string;
  description: string;
}

const availableCoupons: Coupon[] = [
  { code: 'FIRST20', type: 'percentage', value: 20, minOrder: 500, validTill: '2025-12-31', description: '20% OFF' },
  { code: 'SAVE100', type: 'flat', value: 100, minOrder: 750, validTill: '2025-11-30', description: '₹100 OFF' },
  { code: 'WELCOME50', type: 'flat', value: 50, minOrder: 1000, validTill: '2026-01-31', description: '₹50 OFF' },
  { code: 'FEAST25', type: 'percentage', value: 25, minOrder: 1500, validTill: '2025-12-15', description: '25% OFF' },
];

const FoodNavbar: React.FC = () => {
  const [showCart, setShowCart] = useState<boolean>(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [cartCount, setCartCount] = useState<number>(0);
  const [mobileMenuVisible, setMobileMenuVisible] = useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const getActiveKey = (pathname: string): string => {
    if (pathname === '/') return 'home';
    if (pathname === '/menu-items') return 'menu';
    if (pathname === '/contact') return 'contact';
    if (pathname === '/my-orders') return 'orders';
    if (pathname === '/admin/orderanalytics') return 'orderanalytics';
    if (pathname === '/admin/productspage') return 'products';
    if (pathname === '/admin/ordermanagement') return 'ordermanagement';
    if (pathname === '/admin/paymentoverview') return 'paymentoverview';
    return '';
  };

  const activeKey = getActiveKey(location.pathname);

  const isLargeScreen = () => {
    return window.innerWidth > 900;
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log('Razorpay SDK loaded successfully');
    };
    script.onerror = (error) => {
      console.error('Failed to load Razorpay SDK:', error);
      messageApi.error({
        content: "Failed to load payment gateway. Please check your internet connection.",
        duration: 5,
        style: {
          marginTop: '10vh',
        },
      });
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const fetchCartItems = async () => {
    if (!auth?.isAuthenticated || !auth?.token) {
      setCartItems([]);
      setCartCount(0);
      return;
    }

    try {
      const res = await fetch(`${backendUrl}/api/cart/get_cart_items`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (res.status === 401) {
        if (auth?.logout) {
          auth.logout();
        }
        setCartItems([]);
        setCartCount(0);
        return;
      }

      const data = await res.json();
      if (data && data.Cart_Items) {
        setCartItems(data.Cart_Items);
        const count = data.Cart_Items.reduce((total: number, item: CartItem) => total + item.quantity, 0);
        setCartCount(count);
      } else if (!data.success && data.message === "Not authorized, please log in") {
        if (auth?.logout) {
          auth.logout();
        }
        setCartItems([]);
        setCartCount(0);
      }
    } catch (error) {
      console.error('Failed to fetch cart items:', error);
      setCartItems([]);
      setCartCount(0);
    }
  };

  const clearCart = async () => {
    if (!auth?.isAuthenticated || !auth?.token) {
      messageApi.error({
        content: "Please log in to clear your cart.",
        duration: 3,
        style: { marginTop: '10vh' },
      });
      return;
    }
    try {
      const response = await fetch(`${backendUrl}/api/cart/clear_cart`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.status === 401) {
        if (auth?.logout) {
          auth.logout();
        }
        return;
      }

      if (response.ok) {
        setCartItems([]);
        setCartCount(0);
        handleRemoveCoupon();
      } else {
        const errorData = await response.json();
        messageApi.error({
          content: errorData.message || 'Failed to clear cart',
          duration: 3,
          style: { marginTop: '10vh' },
        });
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      messageApi.error({
        content: "Error occurred while clearing cart.",
        duration: 3,
        style: { marginTop: '10vh' },
      });
    }
  };

  useEffect(() => {
    let pollingInterval: NodeJS.Timeout | null = null;

    if (auth?.isAuthenticated && auth?.token) {
      fetchCartItems();

      pollingInterval = setInterval(() => {
        fetchCartItems();
      }, 10000);
    } else {
      setCartItems([]);
      setCartCount(0);
    }

    const handleCartUpdate = () => {
      if (auth?.isAuthenticated && auth?.token) {
        fetchCartItems();
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    (window as any).updateCartCount = fetchCartItems;

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
      delete (window as any).updateCartCount;
    };
  }, [auth?.isAuthenticated, auth?.token]);

  const logout = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${auth?.token}`,
          'Content-Type': 'application/json',
        }
      });

      if (auth?.logout) {
        auth.logout();
      }

      setCartItems([]);
      setCartCount(0);
      setShowCart(false);
      setMobileMenuVisible(false);

      if (response.ok) {
        messageApi.success({
          content: "User Logged Out successfully",
          duration: 3,
          style: {
            marginTop: '10vh',
          },
        });
      }

      setTimeout(() => {
        navigate("/")
      }, 1000);
    } catch (err) {
      console.error('Error logging out:', err);
      if (auth?.logout) {
        auth.logout();
      }
      messageApi.error({
        content: "Logout failed. Please try again.",
        duration: 3,
        style: {
          marginTop: '10vh',
        },
      });
    }
  };

  useEffect(() => {
    const count = cartItems.reduce((total, item) => total + item.quantity, 0);
    setCartCount(count);
  }, [cartItems]);

  const numericTotalPrice = cartItems.reduce((sum, item) => sum + item.discount_price * item.quantity, 0);
  const totalPrice = numericTotalPrice.toFixed(2);
  const finalPrice = (numericTotalPrice - discountAmount).toFixed(2);

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode('');
  };

  const handleApplyCoupon = () => {
    if (appliedCoupon) {
      messageApi.warning('A coupon is already applied. Remove it to apply a new one.');
      return;
    }

    const coupon = availableCoupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase());

    if (!coupon) {
      messageApi.error('Invalid coupon code.');
      return;
    }

    const today = new Date();
    const expiryDate = new Date(coupon.validTill);
    expiryDate.setHours(23, 59, 59, 999);

    if (today > expiryDate) {
      messageApi.error(`Coupon "${coupon.code}" has expired.`);
      return;
    }

    if (numericTotalPrice < coupon.minOrder) {
      messageApi.error(`A minimum order of ₹${coupon.minOrder} is required for this coupon.`);
      return;
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (numericTotalPrice * coupon.value) / 100;
    } else {
      discount = coupon.value;
    }

    setDiscountAmount(discount);
    setAppliedCoupon(coupon);
    messageApi.success({
      content: `Coupon "${coupon.code}" applied successfully!`,
      style: { marginTop: '10vh' }
    });
  };

  useEffect(() => {
    if (appliedCoupon) {
      if (numericTotalPrice < appliedCoupon.minOrder) {
        messageApi.warning(`Order total is now below the minimum of ₹${appliedCoupon.minOrder}. Coupon removed.`);
        handleRemoveCoupon();
      } else if (appliedCoupon.type === 'percentage') {
        const newDiscount = (numericTotalPrice * appliedCoupon.value) / 100;
        setDiscountAmount(newDiscount);
      }
    }
  }, [numericTotalPrice, appliedCoupon]);

  const handleCartToggle = (): void => {
    if (!auth?.isAuthenticated) {
      setShowAuthModal(true);
      setIsLoginMode(true);
      return;
    }
    setShowCart(!showCart);
    if (!showCart) {
      fetchCartItems();
    }
  };

  const handleDeleteItem = async (name: string) => {
    if (!auth?.isAuthenticated || !auth?.token) {
      messageApi.error({
        content: "Please log in to remove items from your cart.",
        duration: 3,
        style: { marginTop: '10vh' },
      });
      return;
    }
    try {
      const res = await fetch(`${backendUrl}/api/cart/delete_cart_item/${encodeURIComponent(name)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (res.status === 401) {
        if (auth?.logout) {
          auth.logout();
        }
        return;
      }

      if (res.ok) {
        setCartItems(prevItems => prevItems.filter(item => item.name !== name));
        messageApi.success({
          content: "Item removed from cart",
          duration: 3,
          style: {
            marginTop: '10vh',
          },
        });
        if ((window as any).updateCartCount) {
          (window as any).updateCartCount();
        }
      } else {
        const errorData = await res.json();
        messageApi.error({
          content: errorData.message || "Failed to remove item",
          duration: 3,
          style: {
            marginTop: '10vh',
          },
        });
      }
    } catch (error) {
      console.error('Error deleting item from cart:', error);
      messageApi.error({
        content: "Failed to remove item",
        duration: 3,
        style: {
          marginTop: '10vh',
        },
      });
    }
  };

  const handleUpdateQuantity = async (_id: string, quantity: number) => {
    if (!auth?.isAuthenticated || !auth?.token) {
      messageApi.error({
        content: "Please log in to update cart item quantity.",
        duration: 3,
        style: { marginTop: '10vh' },
      });
      return;
    }
    if (quantity < 1) return;

    const updatedItems = cartItems.map(item =>
      item._id === _id ? { ...item, quantity } : item
    );
    setCartItems(updatedItems);

    try {
      const res = await fetch(`${backendUrl}/api/cart/update_cart_quantity`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ _id, quantity }),
      });

      if (res.status === 401) {
        if (auth?.logout) {
          auth.logout();
        }
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to update item quantity');
      }
      messageApi.success({
        content: "Quantity updated successfully",
        duration: 3,
        style: {
          marginTop: '10vh'
        },
      });
      if ((window as any).updateCartCount) {
        (window as any).updateCartCount();
      }
    } catch (error) {
      console.error('Error updating item quantity:', error);
      messageApi.error({
        content: "Failed to update quantity",
        duration: 3,
        style: {
          marginTop: '10vh',
        },
      });
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
    const duration = 3 * 1000;
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
        messageApi.success({
          content: createOrderResponse.data.message || "Order created successfully",
          duration: 3,
          style: {
            marginTop: '10vh',
          },
        });
        clearCart();
        setShowCart(false);
        triggerConfetti();
      } else {
        messageApi.error({
          content: createOrderResponse.data.message || "Failed to finalize order",
          duration: 3,
          style: {
            marginTop: '10vh',
          },
        });
      }
    } catch (error: any) {
      console.error("Error creating order:", error);
      if (error.response?.status === 401 && auth?.logout) {
        auth.logout();
      }
      messageApi.error({
        content: error.response?.data?.message || "Failed to finalize order",
        duration: 3,
        style: {
          marginTop: '10vh',
        },
      });
    }
  };

  const checkoutHandler = async (amount: number | string) => {
    if (!auth?.isAuthenticated || !auth?.token) {
      setShowAuthModal(true);
      setIsLoginMode(true);
      return;
    }

    if (cartItems.length === 0) {
      messageApi.info({
        content: "Your cart is empty! Please add items to your cart before proceeding.",
        duration: 3,
        style: {
          marginTop: '10vh',
        },
      });
      return;
    }

    if (typeof Razorpay === 'undefined') {
      messageApi.error({
        content: "Payment gateway not loaded. Please try again or refresh the page.",
        duration: 5,
        style: {
          marginTop: '10vh',
        },
      });
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
          contact: '+91 9550172687'
        },
        theme: {
          color: '#52c41a'
        },
        handler: function (response: any) {
          if (response.razorpay_payment_id) {
            handleOrderSuccess();
          } else {
            messageApi.error({
              content: "Payment failed or cancelled.",
              duration: 3,
              style: {
                marginTop: '10vh',
              },
            });
          }
        },
        modal: {
          ondismiss: function () {
            messageApi.info({
              content: "Payment window closed without completing the transaction.",
              duration: 3,
              style: {
                marginTop: '10vh',
              },
            });
          }
        }
      };

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error("Checkout error:", error);
      if (error.response?.status === 401 && auth?.logout) {
        auth.logout();
      }
      messageApi.error({
        content: "Apply Coupon Before Proceeding to CheckOut",
        duration: 3,
        style: {
          marginTop: '10vh',
        },
      });
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
            key: 'orderanalytics',
            icon: <DashboardOutlined style={{ color: activeKey === 'orderanalytics' ? '#52c41a' : 'inherit' }} />,
            label: <span onClick={() => { setMobileMenuVisible(false); navigate('/admin/orderanalytics'); }} style={{ color: activeKey === 'orderanalytics' ? '#52c41a' : 'inherit' }}>Order Analytics</span>,
          },
          {
            key: 'products',
            icon: <ProductOutlined style={{ color: activeKey === 'products' ? '#52c41a' : 'inherit' }} />,
            label: <span onClick={() => { setMobileMenuVisible(false); navigate('/admin/productspage'); }} style={{ color: activeKey === 'products' ? '#52c41a' : 'inherit' }}>Products</span>,
          },
          {
            key: 'ordermanagement',
            icon: <UnorderedListOutlined style={{ color: activeKey === 'ordermanagement' ? '#52c41a' : 'inherit' }} />,
            label: <span onClick={() => { setMobileMenuVisible(false); navigate('/admin/ordermanagement'); }} style={{ color: activeKey === 'ordermanagement' ? '#52c41a' : 'inherit' }}>Order Management</span>,
          },
          {
            key: 'paymentoverview',
            label: <span onClick={() => { setMobileMenuVisible(false); navigate('/admin/paymentoverview'); }} style={{ color: activeKey === 'paymentoverview' ? '#52c41a' : 'inherit' }}> ₹ Payment Overview</span>,
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
            icon: <HomeOutlined style={{ color: activeKey === 'home' ? '#52c41a' : 'inherit' }} />,
            label: <span onClick={() => { setMobileMenuVisible(false); navigate('/'); }} style={{ color: activeKey === 'home' ? '#52c41a' : 'inherit' }}>Home</span>,
          },
          {
            key: 'menu',
            icon: <MenuOutlined style={{ color: activeKey === 'menu' ? '#52c41a' : 'inherit' }} />,
            label: <span onClick={() => { setMobileMenuVisible(false); navigate('/menu-items'); }} style={{ color: activeKey === 'menu' ? '#52c41a' : 'inherit' }}>Menu</span>,
          },
          {
            key: 'contact',
            icon: <ContactsOutlined style={{ color: activeKey === 'contact' ? '#52c41a' : 'inherit' }} />,
            label: <span onClick={() => { setMobileMenuVisible(false); navigate('/contact'); }} style={{ color: activeKey === 'contact' ? '#52c41a' : 'inherit' }}>Contact</span>,
          },
          {
            key: 'orders',
            icon: <UnorderedListOutlined style={{ color: activeKey === 'orders' ? '#52c41a' : 'inherit' }} />,
            label: <span onClick={() => { setMobileMenuVisible(false); navigate('/my-orders'); }} style={{ color: activeKey === 'orders' ? '#52c41a' : 'inherit' }}>My Orders</span>,
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
          icon: <HomeOutlined style={{ color: activeKey === 'home' ? '#52c41a' : 'inherit' }} />,
          label: <span onClick={() => { setMobileMenuVisible(false); navigate('/'); }} style={{ color: activeKey === 'home' ? '#52c41a' : 'inherit' }}>Home</span>,
        },
        {
          key: 'menu',
          icon: <MenuOutlined style={{ color: activeKey === 'menu' ? '#52c41a' : 'inherit' }} />,
          label: <span onClick={() => { setMobileMenuVisible(false); navigate('/menu-items'); }} style={{ color: activeKey === 'menu' ? '#52c41a' : 'inherit' }}>Menu</span>,
        },
        {
          key: 'contact',
          icon: <ContactsOutlined style={{ color: activeKey === 'contact' ? '#52c41a' : 'inherit' }} />,
          label: <span onClick={() => { setMobileMenuVisible(false); navigate('/contact'); }} style={{ color: activeKey === 'contact' ? '#52c41a' : 'inherit' }}>Contact</span>,
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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <img
              src="/logo.png"
              alt="Logo"
              style={{
                height: screens.xs ? '32px' : '40px',
                width: 'auto',
                objectFit: 'contain'
              }}
            />
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
          </div>

          {isLargeScreen() && (
            <Menu
              mode="horizontal"
              selectedKeys={[activeKey]}
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

            {!isLargeScreen() && (
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
          selectedKeys={[activeKey]}
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
              <ShoppingCartOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
              <Title level={4} style={{ marginBottom: '16px' }}>Your cart is empty</Title>
              <Button style={{ color: "#52c41a", backgroundColor: "white", border: "1px solid #52c41a" }} onClick={() => setShowCart(false)}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                maxHeight: 'calc(100vh - 250px)'
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
                        <img
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
                            <Tag color={getCategoryColor(item.category)} style={{ borderRadius: '5px' }}>
                              {item.category}
                            </Tag>
                            <Button
                              type="link"
                              size="small"
                              icon={<InfoCircleOutlined />}
                              onClick={() => toggleItemDescription(item._id || '')}
                              style={{ padding: '0 4px', height: 'auto', fontSize: '12px', color: "#52c41a" }}
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
                              fontSize: '12px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              display: 'block',
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
                                style={{
                                  color: "white",
                                  backgroundColor: "#52c41a",
                                  border: "1px solid #52c41a"
                                }}
                                shape="circle"
                                size="small"
                                icon={<MinusOutlined />}
                                onClick={() => handleUpdateQuantity(item._id || '', item.quantity - 1)}
                              />
                              <Text strong>{item.quantity}</Text>
                              <Button
                                style={{
                                  color: "white",
                                  backgroundColor: "#52c41a",
                                  border: "1px solid #52c41a"
                                }}
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
                  <div style={{ marginBottom: '16px' }}>
                    {!appliedCoupon ? (
                      <Space.Compact style={{ width: '100%' }}>
                        <Input
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          onPressEnter={handleApplyCoupon}
                        />
                        <Button type="primary" onClick={handleApplyCoupon} style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}>Apply</Button>
                      </Space.Compact>
                    ) : (
                      <div style={{
                        padding: '8px 12px',
                        background: '#f6ffed',
                        border: '1px solid #b7eb8f',
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <Text>
                          Coupon <Tag color="green">{appliedCoupon.code}</Tag> applied!
                        </Text>
                        <Button type="text" danger size="small" onClick={() => { handleRemoveCoupon(); messageApi.info('Coupon removed.'); }}>Remove</Button>
                      </div>
                    )}
                  </div>
                  <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Subtotal</Text>
                      <Text>₹{totalPrice}</Text>
                    </div>
                    {appliedCoupon && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text style={{ color: '#52c41a' }}>Discount ({appliedCoupon.description})</Text>
                        <Text style={{ color: '#52c41a' }}>- ₹{discountAmount.toFixed(2)}</Text>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #ccc', paddingTop: '8px' }}>
                      <Title level={4} style={{ margin: 0 }}>Grand Total</Title>
                      <Title level={4} style={{ margin: 0 }}>₹{finalPrice}</Title>
                    </div>
                  </div>
                  <Button
                    style={{
                      backgroundColor: "#52c41a",
                      color: "white",
                      border: "1px solid #52c41a",
                    }}
                    size="large"
                    block
                    onClick={() => checkoutHandler(finalPrice)}
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              )}
            </div>
          )}
        </Drawer>
      )}

      {contextHolder}
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
          color: #52c41a !important;
          font-weight: 700 !important;
          border-bottom: none !important;
        }

        .ant-menu-horizontal > .ant-menu-item-selected::after {
          display: none !important;
        }

        .ant-menu-horizontal > .ant-menu-item-selected:hover {
          background-color: transparent !important;
          color: #52c41a !important;
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
          color: #52c41a !important;
          font-weight: 700 !important;
        }

        .ant-menu-vertical > .ant-menu-item-selected:hover {
          background-color: transparent !important;
          color: #52c41a !important;
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