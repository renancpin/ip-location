import {
  ILocationRepository,
  LocationRepositoryToken,
} from '@domain/repositories/location.repository';
import { LocationDto } from '@application/dtos/location.dto';
import { UseCase } from '@application/use-cases/interfaces/use-case.interface';
import { ipToId } from 'src/utils/ip-calculator';
import { inject, injectable } from 'inversify';

export type GetLocationInput = { ip: string };
export type GetLocationOutput = Promise<LocationDto | null>;

@injectable()
export class GetLocationUseCase
  implements UseCase<GetLocationInput, GetLocationOutput>
{
  constructor(
    @inject(LocationRepositoryToken)
    private readonly locationRepository: ILocationRepository,
  ) {}

  async execute(input: GetLocationInput): GetLocationOutput {
    const { ip } = input;
    const ipId = ipToId(ip);

    const ipLocation = await this.locationRepository.findIpLocation(ipId);
    if (!ipLocation) return null;

    const location = new LocationDto(ipLocation);
    return location;
  }
}
