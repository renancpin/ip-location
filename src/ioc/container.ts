import { Container } from "inversify";
import { LocationService } from "../services/location.service";
import { LocationServiceToken } from "./services/location-service.interfaces";
import { LocationRepository } from "../repositories/location.repository";
import { LocationRepositoryToken } from "./repositories/location-repository.interfaces";

const container = new Container();

container.bind(LocationRepositoryToken).to(LocationRepository);
container.bind(LocationServiceToken).to(LocationService);

export { container };
