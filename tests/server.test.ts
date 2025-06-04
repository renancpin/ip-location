import { start, stop } from 'src/server';

describe('integration tests', () => {
  const PORT = 3999;
  const PATH = 'ip/location';

  beforeAll(() => {
    start(PORT);
  });

  afterAll(() => {
    stop();
  });

  it('should return 200 when the ip is found', async () => {
    const inputIp = '8.8.8.8';
    const expectedResult = {
      city: 'Mountain View',
      country: 'United States of America',
      countryCode: 'US',
    };
    const result = await fetch(
      `http://localhost:${PORT}/${PATH}?ip=${inputIp}`,
    );
    const resultBody = await result.json();

    expect(result.status).toBe(200);
    expect(resultBody).toMatchObject(expectedResult);
  });

  it("should return 404 when the ip doesn't exist", async () => {
    const inputIp = '256.256.256.256';
    const result = await fetch(
      `http://localhost:${PORT}/${PATH}?ip=${inputIp}`,
    );

    expect(result.status).toBe(404);
  });
});
