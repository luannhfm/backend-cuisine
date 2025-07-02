import { FastifyInstance } from 'fastify';
import { createCustomerController } from '../controllers/create-customer.controller';
import { loginCustomerController } from '../controllers/login-customer.controller';
import { getCustomerController } from '../controllers/get-customer.controller';
import { updateCustomerController } from '../controllers/update-customer.controller';
import { getAllCustomersController } from '../controllers/get-all-customers.controller';

export async function sessionRoutes(app: FastifyInstance) {
  app.post('/sessions/register', createCustomerController);
  app.post('/sessions/login', loginCustomerController);
  app.get('/sessions/customer/:id', getCustomerController);  // novo
  app.put('/sessions/customer/:id', updateCustomerController);
   app.get('/customers', getAllCustomersController);  // novo
}
