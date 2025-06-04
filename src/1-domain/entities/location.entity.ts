export class LocationEntity {
  lower_ip_id: number;
  upper_ip_id: number;
  country_code: string;
  country_name: string;
  state_region: string;
  city: string;

  constructor(props: LocationEntity) {
    this.lower_ip_id = props.lower_ip_id;
    this.upper_ip_id = props.upper_ip_id;
    this.country_code = props.country_code;
    this.country_name = props.country_name;
    this.state_region = props.state_region;
    this.city = props.city;
  }
}
