import nodemailer from "nodemailer";

const sendEmail = async (email: string) => {
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.zoho.in",
      port: 465,
      secure: true,
      tls: {
        rejectUnauthorized: false,
      },
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
      disableFileAccess: true,
      disableUrlAccess: true,
    });

    await transporter.sendMail({
      from: `${process.env.EMAIL}`,
      to: email,
      subject: "Thank You for Contacting Us",
      html: `
            <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
            <div style="margin:40px auto;width:90%;padding:20px 0">
              <pre>
                Hi,

                    Thanks for reaching out. Our help team will get back to you shortly.

                Regards,
                Aman
              </pre>
            </div>
          </div>
            `,
    });

    await transporter.sendMail({
      from: `${process.env.EMAIL}`,
      to: `${process.env.EMAIL}`,
      subject: "New Contact Query",
      html: `
            <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
            <div style="margin:40px auto;width:90%;padding:20px 0">
              <pre>
                Hi, 
                    A new user has contacted us. Please find the details below:
                    User's email: ${email}
              </pre>
            </div>
          </div>
            `,
    });
  } catch (error: any) {
    console.error("Error while sending the email.", error.message);
    throw new Error("Error in sending the mail.");
  }
};

module.exports = sendEmail;
