import { FastifyReply, FastifyRequest } from "fastify";
import { ProductService } from "../services/product.service";

export async function deleteProductController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const id = Number(request.params["id"]);
  const product = await new ProductService().delete(id);

  if (!product) {
    return reply.status(404).send({ error: "Product not found" });
  }

  return reply.send(product);
}
