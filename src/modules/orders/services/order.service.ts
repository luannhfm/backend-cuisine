import { Order } from '../entities/order.entity';
import { AppDataSource } from '../../../config/database';

const orderRepo = AppDataSource.getRepository(Order);

export class OrderService {
  static async findBySession(sessionId: string) {
    return orderRepo.findOneBy({ stripeSessionId: sessionId });
  }
  
  static async create(data: Partial<Order>) {
    const order = orderRepo.create(data);
    return await orderRepo.save(order);
  }

  static async findByCustomer(customerId: string) {
    return await orderRepo.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }

    static async findAll() {
    return await orderRepo.find({
      order: { createdAt: 'DESC' },
    });
  }
}