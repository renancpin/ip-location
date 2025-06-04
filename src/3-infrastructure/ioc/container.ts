import { Container } from 'inversify';
import { RepositoriesModule } from '@infrastructure/ioc/modules/repositories.module';
import { UseCasesModule } from '@infrastructure/ioc/modules/usecases.module';

export const container = new Container();

void container.load(RepositoriesModule, UseCasesModule);
