import { get } from 'env-var';
import { loadEnv } from './env';

loadEnv();

export const getRequired = (key: string) => get(key).required();

export const config = {
  get jwtSecret() {
    return getRequired('JWT_SECRET').asString();
  },
  get baseUrl() {
    return getRequired('BASE_URL').asString();
  },
  get serviceEmail() {
    return getRequired('SERVICE_EMAIL').asString();
  },
  get servicePassword() {
    return getRequired('SERVICE_PASSWORD').asString();
  },
};
