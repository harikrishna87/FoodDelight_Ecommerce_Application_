import { Row, Col, Layout, Space, Card, Flex, Badge } from 'antd';
import { PercentageOutlined, ShoppingCartOutlined, StarOutlined } from "@ant-design/icons";

const { Content } = Layout;

const LeafIconCustom = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
  </svg>
);

const SkeletonPulse = ({ height = '20px', width = '100%', className = '', style = {} }) => (
  <div
    className={`skeleton-pulse ${className}`}
    style={{
      height,
      width,
      backgroundColor: '#e8f5e8',
      borderRadius: '6px',
      ...style
    }}
  />
);

const ProductCardSkeleton = () => (
  <Card
    hoverable
    style={{
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      backgroundColor: '#fff'
    }}
    bodyStyle={{ padding: '0' }}
  >
    <div style={{ position: 'relative' }}>
      <SkeletonPulse height="200px" style={{ borderRadius: '0', marginBottom: '0' }} />
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '-8px',
        backgroundColor: '#ff4d4f',
        color: 'white',
        padding: '4px 8px',
        fontSize: '12px',
        fontWeight: 'bold',
        width: "75px",
        height: "25px",
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%, 10% 50%)"
      }}>
      </div>
    </div>

    <div style={{ padding: '16px' }}>
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <SkeletonPulse height="23px" width="100px" />
        <SkeletonPulse height="20px" width="150px" />

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
          {Array(3).fill(0).map((_, i) => (
            <StarOutlined key={i} style={{ color: '#faad14', fontSize: '12px' }} />
          ))}
          {Array(2).fill(0).map((_, i) => (
            <StarOutlined key={i} style={{ color: '#d9d9d9', fontSize: '12px' }} />
          ))}
          <SkeletonPulse height="14px" width="30px" style={{ marginLeft: '4px' }} />
        </div>

        <SkeletonPulse height="14px" width="150px" />

        <Flex justify="space-between" align="center" style={{ marginTop: '12px' }}>
          <Flex justify='start' align='center'>
            <SkeletonPulse height="18px" width="60px" style={{ marginRight: "5px" }} />
            <SkeletonPulse height="18px" width="60px" />
          </Flex>
          <div style={{
            backgroundColor: '#52c41a',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 'bold',
            width: "100px",
            height: "25px"
          }}>
          </div>
        </Flex>
      </Space>
    </div>
  </Card>
);

const MobileSkeletonLoadingState = () => {
  return (
    <Layout style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div
        style={{
          position: 'absolute',
          left: -50,
          bottom: -50,
          width: '200px',
          height: '200px',
          opacity: 0.15,
          zIndex: -1,
          display: window.innerWidth >= 768 ? 'block' : 'none'
        }}
      >
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.61,5.51a15.2,15.2,0,0,1,12.7-1.21c4,1.72,6.3,5.66,8.38,9.47,4.33,7.94,8.64,16,15.73,21.37s17.48,7.35,25.25,2.57c3.8-2.34,6.6-6.07,9-10s4.36-8,7-11.53c10-13.78,32.33-14.35,47.68-5.77,7.56,4.22,14.33,10.86,17.35,19.18s1.79,18.61-5,24c-5.38,4.25-13.12,4.78-19.78,2.66s-12.45-6.59-17.53-11.46C87.86,31.17,71.53,16.84,51.22,13.15c-5.35-1-10.8-1.15-16.22-1.68A92.7,92.7,0,0,1,3.61,5.51Z" fill="#52c41a" />
        </svg>
      </div>

      <div
        style={{
          position: 'absolute',
          right: -50,
          bottom: -50,
          width: '220px',
          height: '220px',
          opacity: 0.15,
          zIndex: -1,
          display: window.innerWidth >= 768 ? 'block' : 'none'
        }}
      >
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M196.39,5.51a15.2,15.2,0,0,0-12.7-1.21c-4,1.72-6.3,5.66-8.38,9.47-4.33,7.94-8.64,16-15.73,21.37s-17.48,7.35-25.25,2.57c-3.8-2.34-6.6-6.07-9-10s-4.36-8-7-11.53c-10-13.78-32.33-14.35-47.68-5.77-7.56,4.22-14.33,10.86-17.35,19.18s-1.79,18.61,5,24c5.38,4.25,13.12,4.78,19.78,2.66s12.45-6.59,17.53-11.46c15.51-14.65,31.84-29,52.15-32.67,5.35-1,10.8-1.15,16.22-1.68A92.7,92.7,0,0,0,196.39,5.51Z" transform="translate(-100 0)" fill="#52c41a" />
        </svg>
      </div>

      <Content style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px',
        width: '90%'
      }}>
        <div style={{
          backgroundColor: 'rgba(82, 196, 26, 0.1)',
          borderRadius: '10px',
          padding: '32px 0',
          marginBottom: '40px',
          marginTop: "40px",
          position: 'relative'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '32px 24px'
          }}>
            <SkeletonPulse height="48px" width="80%" style={{ margin: '0 auto 16px', backgroundColor: 'rgba(84, 178, 36, 0.2)' }} />
            <SkeletonPulse height="24px" width="60%" style={{ margin: '0 auto 24px', backgroundColor: 'rgba(82, 196, 26, 0.15)' }} />
            <SkeletonPulse height="40px" width="150px" style={{ margin: '0 auto', backgroundColor: 'rgba(82, 196, 26, 0.25)' }} />

            <div style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'white',
              opacity: 0.5
            }}>
              <LeafIconCustom />
            </div>
            <div style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'white',
              opacity: 0.5
            }}>
              <ShoppingCartOutlined style={{ fontSize: '24px' }} />
            </div>
          </div>
        </div>

        <Card
          style={{
            marginBottom: '32px',
            backgroundColor: 'rgba(82, 196, 26, 0.1)',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            position: 'relative',
            overflow: 'hidden',
            padding: '12px 24px'
          }}
          bodyStyle={{ padding: '0' }}
        >
          <div style={{ position: 'relative', zIndex: 2 }}>
            <Flex align="center" gap="small" style={{ marginBottom: '12px' }}>
              <PercentageOutlined style={{ color: '#52c41a' }} />
              <SkeletonPulse height="20px" width="180px" style={{ backgroundColor: 'rgba(82, 196, 26, 0.2)' }} />
            </Flex>
            <Space wrap size="small">
              {Array(6).fill(0).map((_, index) => (
                <div
                  key={index}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    backgroundColor: '#fff',
                    border: '1px solid #52c41a',
                    borderRadius: '5px',
                    padding: '4px 12px',
                    fontSize: '13px'
                  }}
                >
                  <SkeletonPulse height="16px" width={`${Math.floor(Math.random() * 30) + 60}px`} style={{ marginRight: '6px' }} />
                  <Badge
                    count={<SkeletonPulse height="12px" width="35px" />}
                    style={{
                      backgroundColor: '#ff4d4f',
                      fontSize: '10px',
                      height: '18px',
                      lineHeight: '18px',
                      minWidth: '45px',
                      borderRadius: "5px"
                    }}
                  />
                </div>
              ))}
            </Space>
          </div>
          <div style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            opacity: 0.15,
            fontSize: '60px',
            color: '#52c41a',
            zIndex: 1
          }}>
            <PercentageOutlined />
          </div>
        </Card>

        <div style={{ marginBottom: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <SkeletonPulse height="32px" width="220px" style={{ margin: '0 auto' }} />
          </div>
          <Row gutter={[16, 16]} justify="center">
            {Array(4).fill(0).map((_, index) => (
              <Col xl={6} lg={8} md={12} sm={24} xs={24} key={index}>
                <ProductCardSkeleton />
              </Col>
            ))}
          </Row>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <SkeletonPulse height="32px" width="200px" style={{ margin: '0 auto' }} />
          </div>
          <Row gutter={[16, 16]} justify="center">
            {Array(6).fill(0).map((_, index) => (
              <Col xl={8} lg={8} md={12} sm={24} xs={24} key={index}>
                <Card
                  hoverable
                  style={{
                    textAlign: 'center',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(82, 196, 26, 0.05)',
                    border: '2px solid rgba(82, 196, 26, 0.2)',
                    height: '180px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '20px'
                  }}
                  bodyStyle={{ padding: '0', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                >
                  <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    <SkeletonPulse height="24px" width="50px" style={{ borderRadius: '12px' }} />
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    <SkeletonPulse height="28px" width="60%" style={{ margin: '0 auto' }} />
                  </div>
                  <div style={{ margin: '20px 0' }}>
                    <SkeletonPulse height="16px" width="40%" style={{ margin: '0 auto' }} />
                  </div>
                  <div style={{ marginTop: 'auto' }}>
                    <SkeletonPulse height="36px" width="80px" style={{ margin: '0 auto', borderRadius: '18px' }} />
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <SkeletonPulse height="32px" width="180px" style={{ marginBottom: '24px' }} />
          <Row gutter={[24, 24]}>
            {Array(8).fill(0).map((_, index) => (
              <Col xl={6} lg={8} md={12} sm={24} xs={24} key={index}>
                <ProductCardSkeleton />
              </Col>
            ))}
          </Row>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <SkeletonPulse height="32px" width="200px" style={{ marginBottom: '24px' }} />
          <Row gutter={[16, 16]}>
            {Array(3).fill(0).map((_, index) => (
              <Col xl={8} lg={8} md={12} sm={24} xs={24} key={index}>
                <Card
                  style={{
                    height: '100%',
                    borderRadius: '12px',
                    backgroundColor: '#fafafa',
                    border: '1px solid #f0f0f0'
                  }}
                >
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                      {Array(5).fill(0).map((_, i) => (
                        <StarOutlined key={i} style={{ color: '#faad14', fontSize: '16px' }} />
                      ))}
                    </div>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <SkeletonPulse height="16px" width="100%" />
                      <SkeletonPulse height="16px" width="90%" />
                      <SkeletonPulse height="16px" width="75%" />
                    </Space>
                    <Flex align="center" gap="middle">
                      <SkeletonPulse height="48px" width="48px" style={{ borderRadius: '50%' }} />
                      <div>
                        <SkeletonPulse height="18px" width="120px" style={{ marginBottom: '4px' }} />
                        <SkeletonPulse height="14px" width="80px" />
                      </div>
                    </Flex>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Content>

      <style>
        {`
          @keyframes pulse {
            0% {
              opacity: 0.4;
            }
            50% {
              opacity: 0.8;
            }
            100% {
              opacity: 0.4;
            }
          }
          .skeleton-pulse {
            background: linear-gradient(90deg, rgba(82, 196, 26, 0.1) 25%, rgba(82, 196, 26, 0.2) 50%, rgba(82, 196, 26, 0.1) 75%);
            background-size: 200% 100%;
            animation: pulse-bg 2s ease-in-out infinite;
          }
          @keyframes pulse-bg {
            0% {
              background-position: 0% 0%;
            }
            100% {
              background-position: -200% 0%;
            }
          }
        `}
      </style>
    </Layout>
  );
};

export default MobileSkeletonLoadingState;