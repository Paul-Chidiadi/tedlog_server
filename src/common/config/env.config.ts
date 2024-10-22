import { config } from 'dotenv';

config();

export const dbConfig = {
  DB_URL: process.env.DB_URL,
  DB_DRIVER: process.env.DB_DRIVER as 'postgres',
  DB_HOST: process.env.DB_HOST,
  DB_PORT: Number(process.env.DB_PORT),
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_DATABASE: process.env.DB_DATABASE,
  DB_SSL: process.env.DB_SSL,
};

export const envConfig = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  BCRYPT_PASSWORD: String(process.env.BCRYPT_PASSWORD),
  SALT_ROUNDS: Number(process.env.SALT_ROUNDS),
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRATION: process.env.JWT_EXPIRATION,
  ACCESSTOKEN_EXPIRES_IN: process.env.ACCESSTOKEN_EXPIRES_IN,
  REFRESHTOKEN_EXPIRES_IN: process.env.REFRESHTOKEN_EXPIRES_IN,
  COOKIE_EXPIRES_IN:
    Date.now() +
    Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000,
  LOCAL_URL: process.env.LOCAL_URL,
  CLIENT_URL: process.env.CLIENT_URL,
};

export const emailConfig = {
  BASE_URL: process.env.BASE_URL,
  MAIL_PASSWORD: process.env.MAIL_PASSWORD,
  MAIL_USERNAME: process.env.MAIL_USERNAME,
  MAIL_HOST: process.env.MAIL_HOST,
  MAIL_PORT: process.env.MAIL_PORT,
  EMAIL_FROM: process.env.EMAIL_FROM,
};

export const awsConfig = {
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION,
  BUCKET_NAME: process.env.BUCKET_NAME,
};

export const paystackConfig = {
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
  PAYSTACK_BASE_URL: process.env.PAYSTACK_BASE_URL,
};
