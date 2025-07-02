import { FastifyReply, FastifyRequest } from "fastify";
import { ProductService } from "../services/product.service";

export async function getProductCategoriesController(request: FastifyRequest, reply: FastifyReply) {
  const service = new ProductService();
  const categories = await service.getAllCategories();
  return reply.send(categories);
}
