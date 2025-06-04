import { GetLocationUseCase } from '@application/use-cases/get-location.usecase';
import { ContainerModule, ContainerModuleLoadOptions } from 'inversify';

export const UseCasesModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options.bind(GetLocationUseCase).toSelf().inSingletonScope();
  },
);
