import { useEffect } from 'react';
import { Modal, Button, Typography } from 'antd';
import { CheckOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface SuccessMessageProps {
  show: boolean;
  onHide: () => void;
  countdownValue: number;
}

export default function SuccessMessage({ show, onHide, countdownValue }: SuccessMessageProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onHide();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [show, onHide]);
  return (
    <Modal
      open={show}
      onCancel={onHide}
      footer={null}
      centered
      closable={false}
      width={400}
      maskClosable={true}
      className="success-modal"
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div className="success-icon-container" style={{ marginBottom: '24px' }}>
          <div 
            className="success-icon" 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '64px',
              width: '64px',
              borderRadius: '50%',
              backgroundColor: '#52c41a',
              margin: '0 auto'
            }}
          >
            <CheckOutlined 
              style={{ 
                fontSize: '32px', 
                color: 'white' 
              }} 
            />
          </div>
        </div>
        
        <Title level={3} style={{ color: '#1f2937', marginBottom: '8px' }}>
          Order Placed Successfully!
        </Title>
        
        <Text style={{ color: '#6b7280', display: 'block', marginBottom: '32px' }}>
          Thank you for your purchase! Your delicious food will be prepared shortly.
        </Text>
        
        <Button 
          type="primary"
          size="large"
          onClick={onHide}
          style={{ 
            backgroundColor: '#52c41a',
            borderColor: '#52c41a',
            paddingLeft: '32px',
            paddingRight: '32px',
            height: '40px'
          }}
        >
          Continue Shopping
        </Button>
        
        <div style={{ marginTop: '16px' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            This window will close in {countdownValue} seconds
          </Text>
        </div>
      </div>

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
        
        .success-icon {
          animation: pulse 2s infinite;
        }

        .success-modal .ant-modal-content {
          border-radius: 8px;
        }
      `}</style>
    </Modal>
  );
}