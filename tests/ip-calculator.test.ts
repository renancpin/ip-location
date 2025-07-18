import { ipToId } from 'src/utils/ip-calculator';

describe('ipToID', () => {
  it('should return a number', () => {
    const result = ipToId('0.0.0.0');
    expect(typeof result).toBe('number');
  });

  it('should return id 134744072 for ip 8.8.8.8', () => {
    const result = ipToId('8.8.8.8');
    expect(result).toBe(134744072);
  });

  it('should return id 167772161 for ip 10.0.0.1', () => {
    const result = ipToId('10.0.0.1');
    expect(result).toBe(167772161);
  });

  it('should return id 4294967295 for ip 255.255.255.255', () => {
    const result = ipToId('255.255.255.255');
    expect(result).toBe(4294967295);
  });

  it('should return id 5052902700 for ip 300.300.300.300', () => {
    const result = ipToId('300.300.300.300');
    expect(result).toBe(5052902700);
  });

  it('should return id 0 for invalid ip 98dh32ks', () => {
    const result = ipToId('98dh32ks');
    expect(result).toBe(0);
  });
});
