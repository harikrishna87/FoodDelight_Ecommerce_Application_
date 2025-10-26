import nodemailer from 'nodemailer';
import { IOrder, IOrderItem, IShippingAddress } from '../Types';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const config: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    };

    this.transporter = nodemailer.createTransport(config);
  }

  private generateOrderEmailHTML(
    order: IOrder,
    userEmail: string,
    userName: string
  ): string {
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const orderDateShort = new Date(order.createdAt).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
    });

    const itemsHTML = order.items
      .map(
        (item: IOrderItem) => `
        <tr>
          <td style="padding: 16px 0; border-bottom: 1px solid #e8e8e8;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td width="80" style="padding-right: 16px;">
                  <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 16px; display: block; border: 1px solid #f0f0f0;" />
                </td>
                <td valign="top">
                  <div style="font-weight: 600; color: #1a1a1a; margin-bottom: 6px; font-size: 15px;">${item.name}</div>
                  <div style="color: #666; font-size: 14px; margin-bottom: 6px;">Qty: ${item.quantity}</div>
                  <div style="color: #52c41a; font-weight: 700; font-size: 16px;">₹${item.discount_price.toFixed(2)}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `
      )
      .join('');

    const addressHTML = order.shippingAddress
      ? `
        <div style="padding: 30px; background-color: #fafafa;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td>
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td valign="top" style="padding-right: 12px;">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#ff6b35"/>
                      </svg>
                    </td>
                    <td valign="top">
                      <div style="font-weight: 600; color: #1a1a1a; margin-bottom: 12px; font-size: 16px;">Delivery Address</div>
                      <div style="color: #4a4a4a; line-height: 1.7; font-size: 14px;">
                        <div style="font-weight: 600; margin-bottom: 4px;">${order.shippingAddress.fullName}</div>
                        <div style="margin-bottom: 2px;">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-right: 6px;">
                            <path d="M20.01 15.38C18.78 15.38 17.59 15.18 16.48 14.82C16.13 14.7 15.74 14.79 15.47 15.06L13.9 17.03C11.07 15.68 8.42 13.13 7.01 10.2L8.96 8.54C9.23 8.26 9.31 7.87 9.2 7.52C8.83 6.41 8.64 5.22 8.64 3.99C8.64 3.45 8.19 3 7.65 3H4.19C3.65 3 3 3.24 3 3.99C3 13.28 10.73 21 20.01 21C20.72 21 21 20.37 21 19.82V16.37C21 15.83 20.55 15.38 20.01 15.38Z" fill="#666"/>
                          </svg>
                          ${order.shippingAddress.phone}
                        </div>
                        <div style="margin-top: 8px;">${order.shippingAddress.addressLine1}</div>
                        ${order.shippingAddress.addressLine2 ? `<div>${order.shippingAddress.addressLine2}</div>` : ''}
                        <div>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}</div>
                        <div>${order.shippingAddress.country}</div>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
      `
      : '';

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5; padding: 20px 0;">
        <tr>
          <td align="center">
            <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-radius: 16px; overflow: hidden;">
              
              <tr>
                <td style="background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%); padding: 40px 30px; text-align: center;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td align="center">
                        <table cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td align="center" style="width: 70px; height: 70px; background: rgba(255, 255, 255, 0.2); border-radius: 50%;" valign="middle">
                              <img src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Check%20mark%20button/3D/check_mark_button_3d.png" alt="✓" width="40" height="40" style="display: block; margin: 0 auto;" />
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding-top: 16px;">
                        <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Order Confirmed!</h1>
                        <p style="color: rgba(255, 255, 255, 0.95); margin: 0; font-size: 16px;">Thank you for your order, ${userName}!</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding: 30px; border-bottom: 1px solid #e8e8e8;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td style="padding-bottom: 20px;">
                        <table cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td valign="middle" style="padding-right: 10px;">
                              <img src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Clipboard/3D/clipboard_3d.png" alt="📋" width="24" height="24" style="display: block;" />
                            </td>
                            <td valign="middle">
                              <span style="font-size: 18px; font-weight: 600; color: #1a1a1a;">Order Details</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 10px;">
                    <tr>
                      <td style="padding: 14px 0; border-bottom: 1px solid #f0f0f0;">
                        <div style="color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px;">Order ID</div>
                        <div style="color: #1a1a1a; font-weight: 600; font-size: 15px;">#${order._id}</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 14px 0; border-bottom: 1px solid #f0f0f0;">
                        <div style="color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px;">Order Date</div>
                        <div style="color: #1a1a1a; font-weight: 600; font-size: 15px;">${orderDate}</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 14px 0; border-bottom: 1px solid #f0f0f0;">
                        <div style="color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px;">Payment Method</div>
                        <div style="color: #1a1a1a; font-weight: 600; font-size: 15px;">${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 14px 0;">
                        <div style="color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px;">Total Amount</div>
                        <div style="color: #52c41a; font-weight: 700; font-size: 26px;">₹${order.totalAmount.toFixed(2)}</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding: 30px; border-bottom: 1px solid #e8e8e8;">
                  <h2 style="color: #1a1a1a; font-size: 18px; margin: 0 0 20px 0; font-weight: 600;">Your Items</h2>
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    ${itemsHTML}
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding: 30px; background: linear-gradient(135deg, #f6ffed 0%, #ffffff 100%); border-bottom: 1px solid #b7eb8f;">
                  <div style="margin-bottom: 24px;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td valign="middle" style="padding-right: 10px;">
                          <img src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Package/3D/package_3d.png" alt="🚀" width="22" height="22" style="display: block;" />
                        </td>
                        <td valign="middle">
                          <span style="font-size: 18px; font-weight: 600; color: #1a1a1a;">Delivery Status</span>
                        </td>
                      </tr>
                    </table>
                  </div>
                  
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td align="center" style="padding: 30px 20px; background: #ffffff; border-radius: 16px; border: 1px solid #d9f7be;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                          <tr>
                            <td align="center" width="33.33%" valign="top">
                              <table cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                  <td align="center" style="width: 48px; height: 48px; background: #52c41a; border-radius: 50%; box-shadow: 0 0 0 4px rgba(82, 196, 26, 0.15);" valign="middle">
                                    <img src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Check%20mark/3D/check_mark_3d.png" alt="✓" width="24" height="24" style="display: block; margin: 0 auto;" />
                                  </td>
                                </tr>
                              </table>
                              <div style="margin-top: 12px; font-size: 13px; font-weight: 600; color: #52c41a; letter-spacing: 0.5px;">ORDERED</div>
                              <div style="margin-top: 4px; font-size: 12px; color: #666;">${orderDateShort}</div>
                            </td>
                            <td align="center" width="33.33%" valign="top">
                              <table cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                  <td align="center" style="width: 48px; height: 48px; background: #e8e8e8; border-radius: 50%;" valign="middle">
                                    <img src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Package/3D/package_3d.png" alt="📦" width="24" height="24" style="display: block; margin: 0 auto;" />
                                  </td>
                                </tr>
                              </table>
                              <div style="margin-top: 12px; font-size: 13px; font-weight: 600; color: #999; letter-spacing: 0.5px;">SHIPPED</div>
                              <div style="margin-top: 4px; font-size: 12px; color: #999;">Pending</div>
                            </td>
                            <td align="center" width="33.33%" valign="top">
                              <table cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                  <td align="center" style="width: 48px; height: 48px; background: #e8e8e8; border-radius: 50%;" valign="middle">
                                    <img src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Wrapped%20gift/3D/wrapped_gift_3d.png" alt="🎁" width="24" height="24" style="display: block; margin: 0 auto;" />
                                  </td>
                                </tr>
                              </table>
                              <div style="margin-top: 12px; font-size: 13px; font-weight: 600; color: #999; letter-spacing: 0.5px;">DELIVERED</div>
                              <div style="margin-top: 4px; font-size: 12px; color: #999;">Pending</div>
                            </td>
                          </tr>
                        </table>
                        
                        <div style="margin-top: 24px; padding: 14px; background: linear-gradient(135deg, #f6ffed 0%, #ffffff 100%); border-radius: 16px; border: 1px solid #d9f7be;">
                          <span style="color: #52c41a; font-weight: 600; font-size: 14px;">✓ Your order is confirmed and being prepared</span>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              ${addressHTML}

              <tr>
                <td style="background: linear-gradient(135deg, #fff9e6 0%, #ffffff 100%); padding: 30px; text-align: center; border-top: 1px solid #ffd666;">
                  <h2 style="color: #d48806; margin: 0 0 8px 0; font-size: 20px; font-weight: 600;">Thank You!</h2>
                  <p style="color: #666; margin: 0; font-size: 15px; line-height: 1.6;">We appreciate your order and look forward to serving you again.<br/>Your delicious meal will be delivered fresh to your door!</p>
                </td>
              </tr>

              <tr>
                <td style="background: #2c2c2c; padding: 24px 30px; text-align: center;">
                  <p style="color: #999; margin: 0 0 8px 0; font-size: 13px;">Need help? Contact our support team</p>
                  <p style="color: #666; margin: 0; font-size: 12px;">This is an automated email, please do not reply to this message.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;
  }

  async sendOrderConfirmation(
    userEmail: string,
    userName: string,
    order: IOrder
  ): Promise<boolean> {
    try {
      const emailHTML = this.generateOrderEmailHTML(order, userEmail, userName);

      const mailOptions = {
        from: `"FoodDelights Store" <${process.env.SMTP_USER}>`,
        to: userEmail,
        subject: `Order Confirmation - Order #${order._id}`,
        html: emailHTML,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Order confirmation email sent to ${userEmail}`);
      return true;
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      return false;
    }
  }

  async sendOrderStatusUpdate(
    userEmail: string,
    userName: string,
    order: IOrder,
    newStatus: string
  ): Promise<boolean> {
    try {
      let statusMessage = '';
      let statusColor = '';

      switch (newStatus) {
        case 'Shipped':
          statusMessage = 'Your order has been shipped!';
          statusColor = '#1890ff';
          break;
        case 'Delivered':
          statusMessage = 'Your order has been delivered!';
          statusColor = '#52c41a';
          break;
        default:
          statusMessage = `Your order has been ${newStatus}`;
          statusColor = '#8c8c8c';
      }

      const emailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5; padding: 20px 0;">
            <tr>
              <td align="center">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden;">
                  <tr>
                    <td style="background: ${statusColor}; padding: 40px 30px; text-align: center;">
                      <h1 style="color: white; margin: 0 0 10px 0; font-size: 28px;">Order Update</h1>
                      <p style="color: white; margin: 0; font-size: 16px;">${statusMessage}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 30px;">
                      <p style="margin: 0 0 16px 0;">Hi ${userName},</p>
                      <p style="margin: 0 0 20px 0;">Your order #${order._id} status has been updated to <strong>${newStatus}</strong>.</p>
                      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #fafafa; border-radius: 16px;">
                        <tr>
                          <td style="padding: 20px;">
                            <p style="margin: 0 0 10px 0;"><strong>Order ID:</strong> ${order._id}</p>
                            <p style="margin: 0;"><strong>Total Amount:</strong> ₹${order.totalAmount.toFixed(2)}</p>
                          </td>
                        </tr>
                      </table>
                      <p style="margin: 20px 0 0 0;">Thank you for shopping with us!</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background: #fafafa; padding: 20px; text-align: center; color: #8c8c8c; font-size: 14px;">
                      <p style="margin: 0;">This is an automated email, please do not reply.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"FoodDelights Store" <${process.env.SMTP_USER}>`,
        to: userEmail,
        subject: `Order Update - ${newStatus} - Order #${order._id}`,
        html: emailHTML,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Order status update email sent to ${userEmail}`);
      return true;
    } catch (error) {
      console.error('Error sending order status update email:', error);
      return false;
    }
  }
}

export default new EmailService();