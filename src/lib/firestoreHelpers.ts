import { Timestamp } from "firebase/firestore";

export const nowTs = () => Timestamp.now();

export function toNumber(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}
