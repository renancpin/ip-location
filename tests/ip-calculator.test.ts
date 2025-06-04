import { ipToID } from "../src/utils/ip-calculator.ts";

describe("ipToID", () => {
  it("should return a number", () => {
    const result = ipToID("0.0.0.0");
    expect(typeof result).toBe("number");
  });

  it("should return id 134744072 for ip 8.8.8.8", () => {
    const result = ipToID("8.8.8.8");
    expect(result).toBe(134744072);
  });

  it("should return id 167772161 for ip 10.0.0.1", () => {
    const result = ipToID("10.0.0.1");
    expect(result).toBe(167772161);
  });

  it("should return id 5052902700 for ip 300.300.300.300", () => {
    const result = ipToID("300.300.300.300");
    expect(result).toBe(5052902700);
  });
});
