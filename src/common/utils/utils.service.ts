import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { envConfig } from '../config/env.config';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { convert } from 'html-to-text';
import { JwtService } from '@nestjs/jwt';
import { diskStorage } from 'multer';
import { VALID_FILE_FORMAT } from '../constants';
import * as crypto from 'crypto';

@Injectable()
export class Utilities {
  private pepper = envConfig.BCRYPT_PASSWORD;
  private saltRound = envConfig.SALT_ROUNDS;
  private jwtService: JwtService;

  public async generateHash(plainPassword: string): Promise<string> {
    const hash = await bcrypt.hash(plainPassword + this.pepper, this.saltRound);
    return hash;
  }

  generateRandomCode = (size = 8, alpha = true): number | string => {
    let characters = alpha
      ? '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-'
      : '0123456789';
    let chars = characters.split('');
    let selections = '';
    for (let i = 0; i < size; i++) {
      let index = Math.floor(Math.random() * chars.length);
      selections += chars[index];
      chars.splice(index, 1);
    }
    return selections;
  };

  async createAccessToken(payload: any): Promise<string> {
    return this.jwtService.signAsync(payload, {
      expiresIn: Number(envConfig.ACCESSTOKEN_EXPIRES_IN),
    });
  }

  async createRefreshToken(payload: any): Promise<string> {
    return this.jwtService.signAsync(payload, {
      expiresIn: envConfig.REFRESHTOKEN_EXPIRES_IN,
    });
  }

  async generateOtpCode() {
    const OTP = this.generateRandomCode(6, false);
    return {
      OTP,
      otpExpiresAt: (Date.now() + 10 * 60 * 1000) as number,
    };
  }

  async comparePassword(
    password: string,
    hashPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password + this.pepper, hashPassword);
  }

  public generateUUID(): string {
    const uuid = uuidv4();
    return uuid;
  }

  async convertEmailToText(html: string) {
    const result = convert(html, {
      wordwrap: 130,
    });
    return result;
  }

  Date() {
    let currentdate = new Date();
    let datetime =
      'Last Sync: ' +
      currentdate.getDate() +
      '/' +
      (currentdate.getMonth() + 1) +
      '/' +
      currentdate.getFullYear() +
      ' @ ' +
      currentdate.getHours() +
      ':' +
      currentdate.getMinutes() +
      ':' +
      currentdate.getSeconds();
    return datetime;
  }
}

export const getDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export function processFile(req: any, file: any) {
  const filePath = `https://${req.get('host')}/api/v1/public/files/${file.filename}`;
  return filePath;
}

export const storageConfig = diskStorage({
  destination: 'public/files',
  filename: (req, file, cb) => {
    if (!VALID_FILE_FORMAT.includes(file.mimetype)) {
      return cb(
        new UnprocessableEntityException(
          'Only .html, .doc, .docx, and .pdf files are allowed!',
        ),
        null,
      );
    }
    const fileName = `${Date.now()}--${file.originalname}`;
    cb(null, fileName);
  },
});

// Generate a random string of given length
export function generateRandomString(length: number): string {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
}

// Hash a string securely
export async function hashString(data: string): Promise<string> {
  const salt = await bcrypt.genSalt();
  return bcrypt.hash(data, salt);
}
