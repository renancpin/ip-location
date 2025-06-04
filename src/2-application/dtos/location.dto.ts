import { LocationEntity } from '@domain/entities/location.entity';

export type LocationDtoProps = Pick<
  LocationEntity,
  'country_name' | 'country_code' | 'state_region' | 'city'
>;

export class LocationDto {
  country: string;
  countryCode: string;
  region: string;
  city: string;

  constructor(props: LocationDtoProps) {
    this.country = props.country_name;
    this.countryCode = props.country_code;
    this.region = props.state_region;
    this.city = props.city;
  }
}
