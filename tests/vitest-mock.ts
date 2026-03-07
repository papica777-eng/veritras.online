declare const jest: any;

export const describe = (global as any).describe;
export const it = (global as any).it;
export const test = (global as any).test;
export const expect = (global as any).expect;
export const beforeAll = (global as any).beforeAll;
export const afterAll = (global as any).afterAll;
export const beforeEach = (global as any).beforeEach;
export const afterEach = (global as any).afterEach;

export const vi = {
  fn: (...args: any[]) => jest.fn(...args),
  spyOn: (...args: any[]) => jest.spyOn(...args),
  mock: (...args: any[]) => jest.mock(...args),
  useFakeTimers: (...args: any[]) => jest.useFakeTimers(...args),
  useRealTimers: (...args: any[]) => jest.useRealTimers(...args),
};
