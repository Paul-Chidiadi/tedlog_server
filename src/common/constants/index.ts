export const PASSWORD_RULE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;

export const PASSWORD_RULE_MESSAGE =
  'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';

export const ROLES_KEY = 'roles';

export const MAX_UPLOAD_AMOUNT_ALLOWED = 5;
export const VALID_FILE_FORMAT = [
  'html',
  'text/html',
  'msword',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'png',
  'image/png',
  'image/jpeg',
  'jpeg',
  'jpg',
  'application/pdf',
  'image/jpg',
  'pdf',
  'docx',
];
export type FolderPath =
  | 'investment_memo'
  | 'supporting_document'
  | 'audited_accounts'
  | 'profile_or_pitch_deck';
