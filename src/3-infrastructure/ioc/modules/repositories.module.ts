import { LocationRepositoryToken } from '@domain/repositories/location.repository';
import { LocationRepository } from '@infrastructure/repositories/location.repository';
import { ContainerModule, ContainerModuleLoadOptions } from 'inversify';

export const RepositoriesModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options
      .bind(LocationRepositoryToken)
      .to(LocationRepository)
      .inSingletonScope();
  },
);
