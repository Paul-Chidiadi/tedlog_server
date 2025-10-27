import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { emailConfig } from '../config/env.config';
import { Utilities } from './utils.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as Handlebars from 'handlebars';

export interface Mail {
  email: string;
  firstName?: string;
  OTP?: number | string;
  subject: string;
}

interface WelcomeEmailData {
  firstName: string;
  dashboardUrl: string;
  unsubscribeUrl: string;
  googlePlayUrl: string;
  appleUrl: string;
  twitterUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  logoUrl: string;
}

interface SecurityAlertData {
  firstName: string;
  device: string;
  location: string;
  loginTime: string;
  mapImageUrl: string;
  secureAccountUrl: string;
  unsubscribeUrl: string;
  googlePlayUrl: string;
  appleUrl: string;
  twitterUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  logoUrl: string;
}

@Injectable()
export class EmailService {
  private emailFrom = emailConfig.EMAIL_FROM;
  private baseUrl = emailConfig.BASE_URL;
  private MAIL_HOST = emailConfig.MAIL_HOST;
  private MAIL_USERNAME = emailConfig.MAIL_USERNAME;
  private MAIL_PASSWORD = emailConfig.MAIL_PASSWORD;
  private MAIL_PORT = emailConfig.MAIL_PORT;
  private templatesCache: Map<string, HandlebarsTemplateDelegate> = new Map();

  constructor(private readonly util: Utilities) {}

  private async loadTemplate(
    templateName: string,
  ): Promise<HandlebarsTemplateDelegate> {
    // Check cache first
    if (this.templatesCache.has(templateName)) {
      return this.templatesCache.get(templateName);
    }

    try {
      const templatePath = path.join(
        process.cwd(),
        'src',
        'mail',
        'templates',
        `${templateName}.html`,
      );

      const templateContent = await fs.readFile(templatePath, 'utf-8');
      const compiledTemplate = Handlebars.compile(templateContent);

      // Cache the compiled template
      this.templatesCache.set(templateName, compiledTemplate);

      return compiledTemplate;
    } catch (error) {
      console.error(`Error loading template ${templateName}:`, error);
      throw new Error(`Failed to load email template: ${templateName}`);
    }
  }

  private async renderTemplate(
    templateName: string,
    data: Record<string, any>,
  ): Promise<string> {
    const template = await this.loadTemplate(templateName);
    return template(data);
  }

  async sendWelcomeEmail(
    email: string,
    firstName: string,
    dashboardUrl?: string,
  ): Promise<any> {
    const templateData: WelcomeEmailData = {
      firstName,
      dashboardUrl: dashboardUrl || `${process.env.FRONTEND_URL}`,
      twitterUrl: `${process.env.TWITTER_URL}`,
      facebookUrl: `${process.env.FACEBOOK_URL}`,
      instagramUrl: `${process.env.INSTAGRAM_URL}`,
      googlePlayUrl: `${process.env.GOOGLE_PLAY_URL}`,
      appleUrl: `${process.env.APPLE_URL}`,
      unsubscribeUrl: `${process.env.FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(email)}`,
      logoUrl: `https://wirecartserver.madeinblacc.net/images/logo.png`,
    };

    const htmlContent = await this.renderTemplate('welcome', templateData);

    const mailOptions: Mail = {
      email,
      subject: 'Welcome to MadeInBlacc Factory 🤎',
      firstName,
    };

    return await this.sendMail(mailOptions, htmlContent);
  }

  async sendSecurityAlert(
    email: string,
    firstName: string,
    loginData: {
      device: string;
      location: string;
      loginTime: string;
      latitude?: number;
      longitude?: number;
    },
  ): Promise<any> {
    // Generate static map URL (using Google Maps Static API or similar)
    let mapImageUrl = '';
    if (loginData.latitude && loginData.longitude) {
      mapImageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${loginData.latitude},${loginData.longitude}&zoom=13&size=600x300&maptype=roadmap&markers=color:blue%7C${loginData.latitude},${loginData.longitude}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    }

    const templateData: SecurityAlertData = {
      firstName,
      device: loginData.device,
      location: loginData.location,
      loginTime: loginData.loginTime,
      mapImageUrl,
      secureAccountUrl: `${process.env.FRONTEND_URL}`,
      unsubscribeUrl: `${process.env.FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(email)}`,
      twitterUrl: `${process.env.TWITTER_URL}`,
      facebookUrl: `${process.env.FACEBOOK_URL}`,
      instagramUrl: `${process.env.INSTAGRAM_URL}`,
      googlePlayUrl: `${process.env.GOOGLE_PLAY_URL}`,
      appleUrl: `${process.env.APPLE_URL}`,
      logoUrl: `https://wirecartserver.madeinblacc.net/images/logo.png`,
    };

    const htmlContent = await this.renderTemplate('security', templateData);

    const mailOptions: Mail = {
      email,
      subject: 'Security Alert: New sign-in detected',
      firstName,
    };

    return await this.sendMail(mailOptions, htmlContent);
  }

  async sendPaymentConfirmation(
    email: string,
    firstName: string,
    paymentData: {
      amount: string;
      transactionId: string;
      transactionDate: string;
    },
  ): Promise<any> {
    const templateData = {
      firstName,
      amount: paymentData.amount,
      transactionId: paymentData.transactionId,
      transactionDate: paymentData.transactionDate,
      receiptUrl: `${process.env.FRONTEND_URL}/receipts/${paymentData.transactionId}`,
      unsubscribeUrl: `${process.env.FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(email)}`,
      twitterUrl: `${process.env.TWITTER_URL}`,
      facebookUrl: `${process.env.FACEBOOK_URL}`,
      instagramUrl: `${process.env.INSTAGRAM_URL}`,
      googlePlayUrl: `${process.env.GOOGLE_PLAY_URL}`,
      appleUrl: `${process.env.APPLE_URL}`,
      logoUrl: `https://wirecartserver.madeinblacc.net/images/logo.png`,
    };

    const htmlContent = await this.renderTemplate('payment', templateData);

    const mailOptions: Mail = {
      email,
      subject: 'Payment Confirmation - Transaction Successful 💸',
      firstName: firstName,
    };

    return await this.sendMail(mailOptions, htmlContent);
  }

  async sendProductNews(
    email: string,
    firstName: string,
    updates?: string[],
  ): Promise<any> {
    const templateData = {
      firstName,
      updatesUrl: `${process.env.FRONTEND_URL}`,
      unsubscribeUrl: `${process.env.FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(email)}`,
      twitterUrl: `${process.env.TWITTER_URL}`,
      facebookUrl: `${process.env.FACEBOOK_URL}`,
      instagramUrl: `${process.env.INSTAGRAM_URL}`,
      googlePlayUrl: `${process.env.GOOGLE_PLAY_URL}`,
      appleUrl: `${process.env.APPLE_URL}`,
      logoUrl: `https://wirecartserver.madeinblacc.net/images/logo.png`,
    };

    const htmlContent = await this.renderTemplate('productnews', templateData);

    const mailOptions: Mail = {
      email,
      subject: 'Something New Just Dropped from the Factory 🏭',
      firstName,
    };

    return await this.sendMail(mailOptions, htmlContent);
  }

  async sendDeliveryTracking(
    email: string,
    firstName: string,
    trackingData: {
      trackingId: string;
      pickupPoint: string;
      expectedDelivery: string;
    },
  ): Promise<any> {
    const templateData = {
      firstName,
      trackingId: trackingData.trackingId,
      pickupPoint: trackingData.pickupPoint,
      expectedDelivery: trackingData.expectedDelivery,
      trackingUrl: `${process.env.WIRECART_URL}/track?id=${trackingData.trackingId}`,
      unsubscribeUrl: `${process.env.FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(email)}`,
      twitterUrl: `${process.env.TWITTER_URL}`,
      facebookUrl: `${process.env.FACEBOOK_URL}`,
      instagramUrl: `${process.env.INSTAGRAM_URL}`,
      googlePlayUrl: `${process.env.GOOGLE_PLAY_URL}`,
      appleUrl: `${process.env.APPLE_URL}`,
      logoUrl: `https://wirecartserver.madeinblacc.net/images/logo.png`,
    };

    const htmlContent = await this.renderTemplate('tracking', templateData);

    const mailOptions: Mail = {
      email,
      subject: 'Your Delivery is On the Move 📦',
      firstName: firstName,
    };

    return await this.sendMail(mailOptions, htmlContent);
  }

  async sendMonthlyEditorial(
    email: string,
    firstName: string,
    month: string,
  ): Promise<any> {
    const templateData = {
      firstName,
      month,
      editorialUrl: `${process.env.FRONTEND_URL}}`,
      unsubscribeUrl: `${process.env.FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(email)}`,
      twitterUrl: `${process.env.TWITTER_URL}`,
      facebookUrl: `${process.env.FACEBOOK_URL}`,
      instagramUrl: `${process.env.INSTAGRAM_URL}`,
      googlePlayUrl: `${process.env.GOOGLE_PLAY_URL}`,
      appleUrl: `${process.env.APPLE_URL}`,
      logoUrl: `https://wirecartserver.madeinblacc.net/images/logo.png`,
    };

    const htmlContent = await this.renderTemplate('editorial', templateData);

    const mailOptions: Mail = {
      email,
      subject: `${month} Issue: Awka Stories That Keep Moving 📖`,
      firstName,
    };

    return await this.sendMail(mailOptions, htmlContent);
  }

  async sendTemplateEmail(
    email: string,
    subject: string,
    templateName: string,
    templateData: Record<string, any>,
  ): Promise<any> {
    const htmlContent = await this.renderTemplate(templateName, templateData);

    const mailOptions: Mail = {
      email,
      subject,
      firstName: templateData.firstName,
    };

    return await this.sendMail(mailOptions, htmlContent);
  }

  clearTemplateCache() {
    this.templatesCache.clear();
  }

  async sendMail(options: Mail, template: string): Promise<any> {
    const text = await this.util.convertEmailToText(template);
    const msg: any = {
      to: options.email,
      from: this.emailFrom, // Use the email address or domain you verified above
      subject: options.subject,
      text,
      html: template,
    };

    try {
      if (process.env.NODE_ENV === 'production') {
        const transporter = nodemailer.createTransport({
          host: this.MAIL_HOST,
          port: Number(this.MAIL_PORT),
          auth: {
            user: this.MAIL_USERNAME,
            pass: this.MAIL_PASSWORD,
          },
        });
        // send the email with nodemailer
        try {
          const result = await transporter.sendMail(msg);
          return result;
        } catch (error: any) {
          console.log(error);
          if (error.response) {
            console.error(error.response.body);
          }
        }
      }
      const transporter = nodemailer.createTransport({
        host: this.MAIL_HOST,
        port: Number(this.MAIL_PORT),
        secure: true,
        auth: {
          user: this.MAIL_USERNAME,
          pass: this.MAIL_PASSWORD,
        },
      });
      // send the email with nodemailer
      const result = await transporter.sendMail(msg);
      return result;
    } catch (err) {
      console.log(err);
    }
  }

  async sendOTP(options: Mail) {
    if (options.OTP !== undefined && options.OTP.toString().length === 6) {
      const message = `<p>Hello ${options.firstName},</p>
      <p>Welcome to Blacc Theddi. Please verify your 
      email address with the OTP code below. It would expire after 10mins.<p>
      <p>OTP: <b>${options.OTP}</b></p>
      <p>Team Blacc Theddi</p>`;
      return await this.sendMail(options, message);
    }
  }

  async accountActivationMail(options: Mail) {
    const message = `<p>Welcome to MADEINBLACC ${options.firstName},
    your account have been activated. Kindly login to continue<p>`;
    return await this.sendMail(options, message);
  }

  async logInMail(options: Mail) {
    const message = `Welcome to MADEINBLACC ${options.firstName},
        <p>We notice you just login your account at time: ${this.util.Date()}</p>
        If you didn't initiate this login attempt, Please click <a href='#'>here</a> to change your password, someone may be trying to gain access to your account. <br>Team Blacc Theddi
        `;
    return await this.sendMail(options, message);
  }

  async forgotPasswordMail(options: Mail) {
    if (options.OTP !== undefined && options.OTP.toString().length === 6) {
      const title = 'password-reset/';
      const link = `${this.baseUrl}${title}${options.OTP}`;
      const message = `<p> Hi
        ${options.firstName}, <br> 
        We received a request to reset your password.<br>
        To reset your password, use the code below and follow the instructions.<br> 
        Code: ${options.OTP}<br>
        or copy and paste the link below into your browser:<br>
        ${link}
        <br> 
        If you didn't request this, please ignore this email. Your password won't change until you access the link above and create a new one.
        <br> 
        Thanks,  <br> 
        Team MADEINBLACC <p/>`;
      return await this.sendMail(options, message);
    }
  }
  async resetPasswordMail(options: Mail) {
    const message = `<p>
    Hi ${options.firstName}, <br> 
    You have successfully reset your password.
      <br> 
    Team MADEINBLACC <p/>`;
    return await this.sendMail(options, message);
  }

  async sendWaitlistEmail(options: Mail) {
    const message = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #D23559;">Welcome to MADEINBLACC!</h2>
        <p>Thank you for joining our waitlist. We're thrilled to have you as part our community.</p>
        <p>You'll be the first to know when we launch.</p>
        <p>Until then, feel free to connect with us on social media.</p>
  
        <hr style="margin: 20px 0;" />
  
        <p>With appreciation,</p>
        <p><strong>Team MADEINBLACC</strong></p>
  
        <p style="font-size: 12px; color: #777;">If you did not sign up for this, you can ignore this email.</p>
      </div>
    `;

    return await this.sendMail(options, message);
  }
}
