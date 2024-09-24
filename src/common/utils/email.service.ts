import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { emailConfig } from '../config/env.config';
import { Utilities } from './utils.service';

export interface Mail {
  email: string;
  firstName?: string;
  OTP?: number | string;
  subject: string;
}

@Injectable()
export class EmailService {
  private emailFrom = emailConfig.EMAIL_FROM;
  private baseUrl = emailConfig.BASE_URL;
  private MAIL_HOST = emailConfig.MAIL_HOST;
  private MAIL_USERNAME = emailConfig.MAIL_USERNAME;
  private MAIL_PASSWORD = emailConfig.MAIL_PASSWORD;
  private MAIL_PORT = emailConfig.MAIL_PORT;

  constructor(private readonly util: Utilities) {}

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
    const message = `<p>Welcome to Blacc Theddi ${options.firstName},
    your account have been activated. Kindly login to continue<p>`;
    return await this.sendMail(options, message);
  }

  async logInMail(options: Mail) {
    const message = `Welcome to Blacc Theddi ${options.firstName},
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
        Team Blacc Theddi <p/>`;
      return await this.sendMail(options, message);
    }
  }
  async resetPasswordMail(options: Mail) {
    const message = `<p>
    Hi ${options.firstName}, <br> 
    You have successfully reset your password.
      <br> 
    Team Blacc Theddi <p/>`;
    return await this.sendMail(options, message);
  }
}
