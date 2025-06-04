export interface ILocation {
  lower_ip_id: number;
  upper_ip_id: number;
  country_code: string;
  country_name: string;
  state_region: string;
  city: string;
}

export type IPLocation = Pick<
  ILocation,
  "country_name" | "country_code" | "city"
>;

export interface ILocationRepository {
  findLocation(id: number): Promise<IPLocation | null>;
}

export const LocationRepositoryToken = Symbol.for("LocationRepositoryToken");
