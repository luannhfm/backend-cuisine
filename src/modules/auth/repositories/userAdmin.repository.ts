import { AppDataSource } from "../../../config/database";
import { UserAdmin } from '../entities/user.entity';

export const userAdminRepository = AppDataSource.getRepository(UserAdmin);