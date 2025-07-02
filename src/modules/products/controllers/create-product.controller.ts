import { FastifyReply, FastifyRequest } from "fastify";
import { ProductService } from "../services/product.service";
import { ProductSchema } from "../schemas/product.schema";

export async function createProductController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const body = ProductSchema.parse(request.body);
  const product = await new ProductService().create(body);
  return reply.status(201).send(product);
}
