// import { Resend } from "resend";
// const resend = new Resend(process.env.RESENDKEY);
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to, subject, username, verifyCode,titles = "Verify Your Email",Content=`To complete your registration, please use the verification code below. <br />
                                This code expires in <strong>1 minutes</strong>.`, CTA=`verification/${verifyCode}` ) => {
    const codeDigits = verifyCode.split('');
  const digitsRow = codeDigits.map((digit, index) => `
    <td class="code-digit"
        style="font-size:28px; font-weight:700; color:#059669; font-family:'Courier New', monospace; text-align:center; width:45px; height:45px; background:#ffffff; border:2px solid #d1fae5; border-radius:8px; margin:0 3px; vertical-align:middle; text-transform:uppercase;">
      ${digit}
    </td>
  `).join('');

    const html = `
<!DOCTYPE html>
<html lang="en"
    style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin:0; padding:0; background-color:#f8fafc;">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${titles}</title>
    <style>
        @media only screen and (max-width: 600px) {
            .container {
                width: 100% !important;
                padding: 10px !important;
            }

            .code-digit {
                font-size: 24px !important;
                width: 35px !important;
                height: 35px !important;
                margin: 0 2px !important;
            }

            .button {
                padding: 12px 24px !important;
                font-size: 16px !important;
            }
        }
    </style>
</head>

<body style="margin:0; padding:0; background-color:#f8fafc;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0; background-color:#f8fafc;">
        <tr>
            <td align="center" class="container" style="padding:0 10px;">
                <!-- Main Card -->
                <table width="600" cellpadding="0" cellspacing="0"
                    style="background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 20px rgba(16,185,129,0.1); max-width:100%;">

                    <!-- Header with Subtle Green Gradient -->
                    <tr>
                        <td
                            style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding:25px; text-align:center;">
                            <h1
                                style="margin:0; font-size:22px; font-weight:600; color:#ffffff; letter-spacing:-0.25px;">
                               ${titles}</h1>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td
                            style="padding:40px 30px; text-align:center; color:#374151; font-size:16px; line-height:1.6;">

                            <p style="margin:0 0 30px; color:#6b7280; font-size:15px;">
                         Hello <strong style="font-weight: 700; color: #000000;">${username}</strong>, <br />
                             ${Content}
                            </p>

                            <!-- Enhanced Verification Code: Individual Digit Boxes -->
                           

                            <!-- CTA Button -->
                            <div style="margin-bottom:25px;">
                                <a href="https://healthmate-gray.vercel.app/${CTA}" class="button"
                                    style="background:linear-gradient(135deg, #10b981 0%, #059669 100%); color:#ffffff; padding:12px 28px; text-decoration:none; border-radius:8px; display:inline-block; font-weight:600; font-size:16px; box-shadow:0 2px 8px rgba(16,185,129,0.3);">
                                    ${verifyCode ? "Verify Email" : "Reset Password"}
                                </a>
                            </div>

                        </td>
                    </tr>



                </table>
            </td>
        </tr>
    </table>
</body>

</html>


  `;
  try {
    await transporter.sendMail({
      from: `<${process.env.EMAIL_USER}>`,
       to,
      subject,
      html,
    });
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
  }
};
