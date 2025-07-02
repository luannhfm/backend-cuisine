import { AppDataSource } from "../../../config/database";
import { Product } from "../entities/product.entity";
import { stripe } from "../../../config/stripe";

const productRepository = AppDataSource.getRepository(Product);

export class ProductService {
  async getAll(search?: string, category?: string) {
    const query = productRepository.createQueryBuilder("product");
  
    if (search) {
      query.andWhere("LOWER(product.name) LIKE LOWER(:search)", { search: `%${search}%` });
    }
  
    if (category) {
      query.andWhere("product.category = :category", { category });
    }
  
    return await query.getMany();
  }
  
  async getById(id: number) {
    return await productRepository.findOneBy({ id });
  }

  async create(data: Partial<Product>) {
    // 1. Cria o produto no Stripe
    const stripeProduct = await stripe.products.create({
      name: data.name!,
      description: data.description || '',
    });

    // 2. Cria o preço no Stripe
    const stripePrice = await stripe.prices.create({
      unit_amount: Math.round(Number(data.price) * 100),
      currency: 'usd',
      product: stripeProduct.id,
    });

    // 3. Salva o produto no banco com IDs do Stripe
    const product = productRepository.create({
      ...data,
      stripeProductId: stripeProduct.id,
      stripePriceId: stripePrice.id
    });

    return await productRepository.save(product);
  }

  async update(id: number, data: Partial<Product>) {
    await productRepository.update(id, data);
    return this.getById(id);
  }

  async delete(id: number) {
    await productRepository.delete(id);
    return { message: "Product deleted successfully" };
  }

  async getAllCategories() {
    const result = await productRepository
      .createQueryBuilder("product")
      .select("DISTINCT product.category", "category")
      .getRawMany();

    return result.map(row => row.category);
  }
}
