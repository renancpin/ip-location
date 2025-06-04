import { inject, injectable } from "inversify";
import { ipToID } from "../utils/ip-calculator";
import {
  ILocationService,
  Location,
} from "../ioc/services/location-service.interfaces";
import {
  ILocationRepository,
  LocationRepositoryToken,
} from "../ioc/repositories/location-repository.interfaces";

@injectable()
export class LocationService implements ILocationService {
  constructor(
    @inject(LocationRepositoryToken)
    private locationRepository: ILocationRepository
  ) {}

  async findIpLocation(ip: string): Promise<Location | null> {
    const id = ipToID(ip);

    const location = await this.locationRepository.findLocation(id);
    if (!location) return null;

    const result: Location = {
      country: location.country_name,
      countryCode: location.country_code,
      city: location.city,
    };

    return result;
  }
}
