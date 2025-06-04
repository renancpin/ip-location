export function ipToId(ip: string): number {
  const isValidIp = /([0-9]+\.){3}[0-9]+/.test(ip);
  if (!isValidIp) return 0;

  const ipParts = ip.split('.');
  const maxIndex = ipParts.length - 1;

  const ipId = ipParts.reduce((acc, part, i) => {
    const multiplier = 256 ** (maxIndex - i);
    const element = parseInt(part) * multiplier;

    return acc + element;
  }, 0);

  return ipId;
}
