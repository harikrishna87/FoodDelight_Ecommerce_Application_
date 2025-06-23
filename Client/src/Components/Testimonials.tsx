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
        name: "Hari Krishna",
        role: "Regular Customer",
        text: "The quality of products is exceptional. I've been shopping here for years!",
        rating: 5
    },
    {
        id: 2,
        name: "Mahitha",
        role: "Food Critic",
        text: "Their selection never fails to impress. A must-visit for food enthusiasts.",
        rating: 4.5
    },
    {
        id: 3,
        name: "Indu Priya",
        role: "Chef",
        text: "The freshness and variety of products have transformed my cooking experience.",
        rating: 5
    },
    {
        id: 4,
        name: "Revanth",
        role: "Nutritionist",
        text: "I recommend these products to all my clients. Premium quality and great value.",
        rating: 4
    },
    {
        id: 5,
        name: "Srikanth",
        role: "Food Blogger",
        text: "The flavors are authentic and the service is always exceptional!",
        rating: 4.5
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
                            <div style={{ marginBottom: '12px' }}>
                                <Rate 
                                    disabled 
                                    value={testimonial.rating} 
                                    allowHalf
                                    style={{ 
                                        color: '#faad14',
                                        fontSize: '16px'
                                    }}
                                />
                            </div>
                            <Text 
                                style={{ 
                                    fontStyle: 'italic',
                                    display: 'block',
                                    marginBottom: '12px'
                                }}
                            >
                                "{testimonial.text}"
                            </Text>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                marginTop: '12px' 
                            }}>
                                <Avatar 
                                    style={{ 
                                        backgroundColor: '#52c41a',
                                        marginRight: '12px',
                                        width: '40px',
                                        height: '40px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {testimonial.name.charAt(0)}
                                </Avatar>
                                <div>
                                    <Title level={5} style={{ marginBottom: '0' }}>
                                        {testimonial.name}
                                    </Title>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                        {testimonial.role}
                                    </Text>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Testimonials;