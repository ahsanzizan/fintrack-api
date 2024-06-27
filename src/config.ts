import { get } from 'env-var';
import { loadEnv } from './env';

loadEnv();

export const getRequired = (key: string) => get(key).required();

export const config = {
  get jwtSecret() {
    return getRequired('JWT_SECRET').asString();
  },
};
