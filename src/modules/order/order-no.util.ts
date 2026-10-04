import { randomInt } from 'node:crypto';

export function generateOrderNo(): string {
  const now = new Date();
  const pad = (n: number, len: number) => String(n).padStart(len, '0');
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1, 2)}${pad(now.getDate(), 2)}`;
  const time = `${pad(now.getHours(), 2)}${pad(now.getMinutes(), 2)}${pad(now.getSeconds(), 2)}${pad(now.getMilliseconds(), 3)}`;
  const rand = String(randomInt(1000, 10000));
  return `${date}${time}${rand}`;
}
