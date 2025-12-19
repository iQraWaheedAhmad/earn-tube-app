import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Generate a 4-digit code
function generateResetCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (request.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400, headers }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Tell user if email doesn't exist (as requested by user)
      return NextResponse.json(
        {
          success: false,
          error: "No account found with this email address. Please check your email or sign up for a new account.",
        },
        { status: 404, headers }
      );
    }

    // Generate 4-digit reset code
    const resetCode = generateResetCode();
    const resetTokenExp = new Date(Date.now() + 120000); // 2 minutes from now

    // Update user with reset code
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: resetCode,
        resetTokenExp: resetTokenExp,
      },
    });

    // Create reset URL - use NEXT_PUBLIC_APP_URL or fallback to localhost
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?email=${encodeURIComponent(
      email
    )}`;

    // Beautiful email template
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - EarnTube</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container {
            max-width: 600px;
            margin: 20px;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .subtitle {
            font-size: 16px;
            opacity: 0.9;
          }
          .content {
            padding: 40px 30px;
            text-align: center;
          }
          .code-box {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            font-size: 36px;
            font-weight: bold;
            padding: 20px;
            margin: 30px 0;
            border-radius: 15px;
            letter-spacing: 8px;
            box-shadow: 0 10px 20px rgba(245, 87, 108, 0.3);
          }
          .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
            font-size: 14px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 10px;
            font-weight: bold;
            margin: 20px 0;
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
          }
          .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
          }
          .footer a {
            color: #667eea;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🔒 EarnTube</div>
            <div class="subtitle">Secure Password Reset</div>
          </div>

          <div class="content">
            <h1 style="color: #333; margin-bottom: 20px;">Reset Your Password</h1>
            <p style="color: #666; margin-bottom: 30px; line-height: 1.6;">
              We received a request to reset your password. Use the verification code below to complete the process.
            </p>

            <div class="code-box">
              ${resetCode}
            </div>

            <div class="warning">
              ⚠️ This code expires in <strong>2 minutes</strong> for security reasons.
              Please use it immediately.
            </div>

            <a href="${resetUrl}" class="button">Reset Password Now</a>

            <p style="color: #666; margin-top: 30px; font-size: 14px;">
              If you didn't request this password reset, please ignore this email.
              Your account remains secure.
            </p>
          </div>

          <div class="footer">
            <p>
              Need help? Contact our support team at
              <a href="mailto:support@earntube.com">support@earntube.com</a>
            </p>
            <p style="margin-top: 10px;">
              © 2024 EarnTube. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "🔒 Your EarnTube Password Reset Code",
      html: emailHtml,
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "If an account with that email exists, a password reset code has been sent.",
      },
      { headers }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500, headers }
    );
  }
}
