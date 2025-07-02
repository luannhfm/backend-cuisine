import { FastifyReply, FastifyRequest } from "fastify";
import { ProductService } from "../services/product.service";
import { ProductSchema } from "../schemas/product.schema";

export async function updateProductController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const id = Number(request.params["id"]);
  const body = ProductSchema.parse(request.body);
  const product = await new ProductService().update(id, body);
  return reply.send(product);
}
