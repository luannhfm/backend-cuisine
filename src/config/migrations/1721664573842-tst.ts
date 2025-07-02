import { MigrationInterface, QueryRunner } from "typeorm";
import bcrypt from 'bcrypt';

export class Analysis1721666809329 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "customers" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "firstName" VARCHAR NOT NULL,
        "lastName" VARCHAR NOT NULL,
        "birthDate" DATE NOT NULL,
        "address" TEXT NOT NULL,
        "email" VARCHAR UNIQUE NOT NULL,
        "password" VARCHAR NOT NULL,
        "createdAt" TIMESTAMP DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR NOT NULL,
        "description" TEXT,
        "price" DECIMAL NOT NULL,
        "promotionPrice" DECIMAL,
        "quantity" INTEGER NOT NULL,
        "category" VARCHAR NOT NULL,
        "images" TEXT[]
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "users_admin" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "username" VARCHAR UNIQUE NOT NULL,
        "password" VARCHAR NOT NULL,
        "createdAt" TIMESTAMP DEFAULT now()
      )`);

    const hashed = await bcrypt.hash('q0uz6bpx', 10);
    await queryRunner.query(`
      INSERT INTO "users_admin" ("username", "password")
      VALUES ('administrador', '${hashed}')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users_admin"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TABLE "customers"`);
  }
}
