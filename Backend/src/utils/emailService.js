import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/*
|--------------------------------------------------------------------------
| Send Password Reset OTP
|--------------------------------------------------------------------------
*/

export const sendPasswordResetOTP = async (email, otp) => {
    const mailOptions = {
        from:
            process.env.SMTP_FROM ||
            process.env.SMTP_USER,

        to: email,

        subject: "CNPS CMS - Password Reset OTP",

        text: `Your CNPS CMS password reset OTP is ${otp}. This OTP is valid for 10 minutes. Do not share this OTP with anyone.`,

        html: `
            <div style="
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: 0 auto;
                padding: 30px;
                background: #f8f9fa;
            ">

                <div style="
                    background: #ffffff;
                    padding: 30px;
                    border-radius: 10px;
                    border: 1px solid #e5e5e5;
                ">

                    <h2 style="
                        margin-top: 0;
                        color: #333333;
                    ">
                        CNPS CMS Password Reset
                    </h2>

                    <p>
                        We received a request to reset your CMS password.
                    </p>

                    <p>
                        Your One-Time Password (OTP) is:
                    </p>

                    <div style="
                        font-size: 32px;
                        font-weight: bold;
                        letter-spacing: 8px;
                        text-align: center;
                        padding: 20px;
                        margin: 20px 0;
                        background: #f1f3f5;
                        border-radius: 8px;
                        color: #222222;
                    ">
                        ${otp}
                    </div>

                    <p>
                        This OTP will expire in
                        <strong>10 minutes</strong>.
                    </p>

                    <p style="color: #777777;">
                        If you did not request a password reset,
                        you can safely ignore this email.
                    </p>

                    <hr style="
                        border: none;
                        border-top: 1px solid #eeeeee;
                        margin: 25px 0;
                    ">

                    <p style="
                        font-size: 13px;
                        color: #999999;
                    ">
                        CNPS School CMS
                    </p>

                </div>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
};