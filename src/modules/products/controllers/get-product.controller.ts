import { FastifyReply, FastifyRequest } from "fastify";
import { ProductService } from "../services/product.service";

export async function getProductController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const id = Number(request.params["id"]);
  const product = await new ProductService().getById(id);

  if (!product) {
    return reply.status(404).send({ error: "Product not found" });
  }

  return reply.send(product);
}
