import { z } from "zod";

export const ProductSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  price: z.number().positive(),
  // promotionPrice: z.number().positive().optional(),
  quantity: z.number().int().positive(),
  category: z.string(),
  images: z.array(z.string()).optional(),
  
  // ✅ NOVOS CAMPOS PARA FRETE
  weight: z.number().positive().optional().describe("Peso em libras (lbs)"),
  length: z.number().positive().optional().describe("Comprimento em polegadas (in)"),
  width: z.number().positive().optional().describe("Largura em polegadas (in)"),
  height: z.number().positive().optional().describe("Altura em polegadas (in)")
});

// Schema para validação de criação (todos os campos de dimensão opcionais)
export const CreateProductSchema = ProductSchema;

// Schema para validação de atualização (todos os campos opcionais)
export const UpdateProductSchema = ProductSchema.partial();

// Schema específico para validação de frete (peso obrigatório)
export const ProductShippingSchema = z.object({
  id: z.number(),
  name: z.string(),
  weight: z.number().positive().min(0.1, "Peso deve ser pelo menos 0.1 lbs"),
  length: z.number().positive().min(1, "Comprimento deve ser pelo menos 1 polegada"),
  width: z.number().positive().min(1, "Largura deve ser pelo menos 1 polegada"),
  height: z.number().positive().min(1, "Altura deve ser pelo menos 1 polegada")
});

export type ProductShipping = z.infer<typeof ProductShippingSchema>;

