import { DataSource } from "typeorm";
import "reflect-metadata";
import { Product } from "../modules/products/entities/product.entity";
import { env } from "../env";
import {  Analysis1721666809329 } from "./migrations/1721664573842-tst";
import { UserAdmin } from "../modules/auth/entities/user.entity";
import { error } from "console";
import { Customer } from "../modules/sessions/entities/entities";
import { Order } from "../modules/orders/entities/order.entity";
import { HomepageConfig } from "../modules/home/entities/homepage.entity";
import { ShippingQuote } from "../modules/shipping/entities/shipping-quote.entity";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: env.DATABASE_HOST,
    port: env.DATABASE_PORT,
      username: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  database: env.DATABASE_NAME,
  entities: [Product, UserAdmin, Customer, Order, HomepageConfig, ShippingQuote],
  migrations: [Analysis1721666809329],
  synchronize: true, // ⚠️ Só para dev!
  ssl: {
    rejectUnauthorized: false, // Necessário para AWS RDS sem certificado válido localmente
  },
});
