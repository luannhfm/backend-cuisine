import { AppDataSource } from '../../../config/database';
import { HomepageConfig } from '../entities/homepage.entity';

export const homepageRepository = AppDataSource.getRepository(HomepageConfig);
