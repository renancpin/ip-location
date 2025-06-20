export interface Location {
  country: string;
  countryCode: string;
  region: string;
  city: string;
}

export interface ILocationService {
  findIpLocation(ip: string): Promise<Location | null>;
}

export const LocationServiceToken = Symbol.for("LocationServiceToken");
