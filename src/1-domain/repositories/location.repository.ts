import { LocationEntity } from '@domain/entities/location.entity';

export interface ILocationRepository {
  findIpLocation(ipId: number): Promise<LocationEntity | null>;
}

export const LocationRepositoryToken = Symbol.for('LocationRepositoryToken');
