import React from 'react';
import { Card, Typography, Avatar, Rate } from 'antd';

const { Title, Text } = Typography;

interface Testimonial {
    id: number;
    name: string;
    role: string;
    text: string;
    avatar?: string;
    rating: number;
}

const testimonials: Testimonial[] = [
    {
        id: 1,
        name: "Haarini",
        role: "Regular Customer",
        text: "The quality of products is exceptional. I've been shopping here for years!",
        avatar: "https://images.unsplash.com/photo-1663893364107-a6ecd06cf615?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        rating: 5
    },
     {
        id: 2,
        name: "Srikanth",
        role: "Food Blogger",
        text: "The flavors are authentic and the service is always exceptional!",
        avatar: "https://images.unsplash.com/photo-1641288883869-c463bc6c2a58?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        rating: 4.5
    },
    {
        id: 3,
        name: "Mahitha",
        role: "Food Critic",
        text: "Their selection never fails to impress. A must-visit for food enthusiasts.",
        avatar: "https://plus.unsplash.com/premium_photo-1691784781482-9af9bce05096?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        rating: 4.5
    },
    {
        id: 4,
        name: "Revanth",
        role: "Nutritionist",
        text: "I recommend these products to all my clients. Premium quality and great value.",
        avatar: "https://images.unsplash.com/photo-1654110455429-cf322b40a906?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        rating: 4
    },
    {
        id: 5,
        name: "Indu Priya",
        role: "Chef",
        text: "The freshness and variety of products have transformed my cooking experience.",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        rating: 5
    }
];

const Testimonials: React.FC = () => {
    return (
        <div style={{ marginBottom: '48px' }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: '24px' }} className="section-title">
                What Our Customers Say
            </Title>
            <div className="marquee-container" style={{ overflow: 'hidden', position: 'relative' }}>
                <div className="marquee-content-slow" style={{ display: 'flex' }}>
                    {[...testimonials, ...testimonials].map((testimonial, index) => (
                        <Card
                            key={`${testimonial.id}-${index}`}
                            style={{ 
                                minWidth: '300px', 
                                maxWidth: '300px',
                                marginLeft: '8px',
                                marginRight: '8px',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)'
                            }}
                        >
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'flex-start', 
                                marginBottom: '12px' 
                            }}>
                                <div style={{ width: '40%'}}>
                                    <Avatar 
                                        src={testimonial.avatar}
                                        shape="square"
                                        style={{ 
                                            backgroundColor: '#52c41a',
                                            width: '70px',
                                            height: '70px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '20px'
                                        }}
                                    >
                                        {testimonial.name.charAt(0)}
                                    </Avatar>
                                </div>
                                <div style={{ width: '60%' }}>
                                    <Title level={5} style={{ marginBottom: '4px', marginTop: '10px' }}>
                                        {testimonial.name}
                                    </Title>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                        {testimonial.role}
                                    </Text>
                                </div>
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <Rate 
                                    disabled 
                                    value={testimonial.rating} 
                                    allowHalf
                                    style={{ 
                                        color: '#faad14',
                                        fontSize: '16px',
                                        marginRight: '8px'
                                    }}
                                />
                                <Text style={{ fontSize: '14px', color: '#666' }}>
                                    ({testimonial.rating})
                                </Text>
                            </div>
                            <Text 
                                style={{ 
                                    fontStyle: 'italic',
                                    display: '-webkit-box',
                                    WebkitBoxOrient: 'vertical',
                                    WebkitLineClamp: 3,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    lineHeight: '1.4'
                                }}
                            >
                                "{testimonial.text}"
                            </Text>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Testimonials;