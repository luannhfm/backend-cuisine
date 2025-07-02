import { FastifyInstance } from "fastify";
import { createProductController } from "../controllers/create-product.controller";
import { getAllProductsController } from "../controllers/get-all-products.controller";
import { getProductController } from "../controllers/get-product.controller";
import { updateProductController } from "../controllers/update-product.controller";
import { deleteProductController } from "../controllers/delete-product.controller";
import { getProductCategoriesController } from "../controllers/get-categories.controller";
//import { deleteProductController } from "../products/controllers/delete-product.controller";

export async function productRoutes(app: FastifyInstance) {
  app.get("/products", getAllProductsController);
  app.get("/products/:id", getProductController);
  app.post("/products", createProductController);
  app.put("/products/:id", updateProductController);
  app.delete("/products/:id", deleteProductController);
  app.get("/categories", getProductCategoriesController);
}
