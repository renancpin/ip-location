import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    contacts: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 5 },
        { duration: '10s', target: 10 },
        { duration: '10s', target: 0 },
      ],
      gracefulRampDown: '0s',
    },
  },
};

export default function () {
  const realIPs = [
    '8.8.8.8', // Google DNS
    '1.1.1.1', // Cloudflare DNS
    '208.67.222.222', // OpenDNS
    '9.9.9.9', // Quad9 DNS
    '8.8.4.4', // Google DNS secundário
    '1.0.0.1', // Cloudflare DNS secundário
    '4.2.2.2', // Level 3 Communications DNS
    '198.41.0.4', // Root server
    '192.168.0.1', // Gateway local típico
    '10.0.0.1', // Gateway privado típico
  ];

  realIPs.forEach((ip) => {
    const res = http.get(`http://localhost:3000/ip/location?ip=${ip}`);
    check(res, {
      'status is 200': (r) => r.status === 200,
    });
    check(res, {
      'response time for 200 status': (r) => r.timings.duration < 200,
    });
  });

  const notfoundIps = [
    '256.256.256.256', // Fora do intervalo válido
    '300.300.300.300', // Fora do intervalo válido
  ];
  notfoundIps.forEach((ip) => {
    const res = http.get(`http://localhost:3000/ip/location?ip=${ip}`);
    check(res, {
      'status is 404': (r) => r.status === 404,
    });
    check(res, {
      'response time for 404 status': (r) => r.timings.duration < 200,
    });
  });
}
