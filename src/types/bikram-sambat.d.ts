declare module "bikram-sambat" {
  export function daysInMonth(year: number, month: number): number;
  export function toBik(greg: string): { year: number; month: number; day: number };
  export function toBik_euro(greg: string): string;
  export function toBik_dev(greg: string): string;
  export function toBik_text(greg: string): string;
  export function toGreg(year: number, month: number, day: number): { year: number; month: number; day: number };
  export function toGreg_text(year: number, month: number, day: number): string;
  export function toDev(year: number, month: number, day: number): { day: string; month: string; year: string };
  const _default: {
    daysInMonth: typeof daysInMonth;
    toBik: typeof toBik;
    toBik_euro: typeof toBik_euro;
    toBik_dev: typeof toBik_dev;
    toBik_text: typeof toBik_text;
    toGreg: typeof toGreg;
    toGreg_text: typeof toGreg_text;
    toDev: typeof toDev;
  };
  export default _default;
}
