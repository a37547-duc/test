// emailService.js
const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const juice = require("juice"); // Nếu bạn muốn sử dụng inline CSS tự động

// Cấu hình transporter với Gmail
const transporter = nodemailer.createTransport({
  service: "gmail", // Sử dụng dịch vụ Gmail SMTP
  auth: {
    user: "anhtupeo1234@gmail.com", // Địa chỉ email người gửi
    pass: "oloq mijp kwdq qzdh", // Mật khẩu ứng dụng, không phải mật khẩu tài khoản Gmail
  },
});

// Mẫu email với Handlebars
const emailTemplate = `
  <html>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 20px;">
        <tr>
          <td style="text-align: center; padding-bottom: 20px;">
            <h1 style="font-size: 24px; color: #333333; margin: 0;">Thông Báo Xác Nhận Thanh Toán</h1>
          </td>
        </tr>
        <tr>
          <td style="font-size: 16px; color: #333333;">
            <p>Xin chào <strong>{{name}}</strong>,</p>
            <p>Cảm ơn bạn đã thanh toán thành công cho đơn hàng của chúng tôi. Dưới đây là thông tin chi tiết về đơn hàng của bạn:</p>
          </td>
        </tr>
        <tr>
          <td>
            <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
              <tr>
                <th style="padding: 10px; background-color: #f1f1f1; text-align: left; font-weight: bold; color: #333333;">Mã đơn hàng</th>
                <td style="padding: 10px; border: 1px solid #dddddd; color: #333333;">{{orderId}}</td>
              </tr>
              <tr>
                <th style="padding: 10px; background-color: #f1f1f1; text-align: left; font-weight: bold; color: #333333;">Tổng tiền</th>
                <td style="padding: 10px; border: 1px solid #dddddd; color: #333333;">{{totalAmount}} VND</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding-top: 20px; font-size: 14px; color: #777777;">
            <p>Trân trọng,</p>
            <p>Đội ngũ hỗ trợ khách hàng</p>
          </td>
        </tr>
      </table>
    </body>
  </html>
`;

// Hàm gửi email
async function sendEmail(to, name, orderId, totalAmount) {
  try {
    // Biên dịch template với Handlebars
    const template = handlebars.compile(emailTemplate);
    const emailContent = template({ name, orderId, totalAmount });

    // Nếu bạn sử dụng juice để inline CSS
    const finalEmailContent = juice(emailContent);

    // Gửi email
    const info = await transporter.sendMail({
      from: '"Tech4k" <anhtupeo1234@gmail.com>',
      to, // Người nhận
      subject: "Xác nhận thanh toán", // Tiêu đề email
      html: finalEmailContent, // Nội dung email
    });

    console.log("Message sent: %s", info.messageId); // In ra id của email đã gửi
  } catch (error) {
    console.error("Error sending email:", error); // Bắt lỗi và in ra nếu có lỗi
  }
}

// Xuất hàm sendEmail để sử dụng trong các file khác
module.exports = { sendEmail };
