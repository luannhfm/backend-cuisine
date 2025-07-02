// get-all-products.controller.ts
import { FastifyRequest, FastifyReply } from "fastify";
import { ProductService } from "../services/product.service";

export async function getAllProductsController(request: FastifyRequest, reply: FastifyReply) {
  const { search, category } = request.query as {
    search?: string;
    category?: string;
  };

  const products = await new ProductService().getAll(search, category);
  return reply.send(products);
}
