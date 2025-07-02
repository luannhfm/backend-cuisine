import { AppDataSource } from '../../../config/database';
import { Customer } from '../entities/entities';

const customerRepo = AppDataSource.getRepository(Customer);

export class CustomerService {
  static async getById(id: string): Promise<Customer | null> {
    const customer = await customerRepo.findOneBy({ id });
    if (!customer) return null;

    // Remover o campo de senha por segurança
    delete (customer as any).password;
    return customer;
  }

     static async findAll() {
    return await customerRepo.find({
      order: { createdAt: 'DESC' },
    });
  }


}
