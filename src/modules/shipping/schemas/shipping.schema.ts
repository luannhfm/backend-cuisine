import { z } from "zod";

// Schema para endereço
export const AddressSchema = z.object({
  street: z.string().min(1, "Endereço é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().length(2, "Estado deve ter 2 caracteres"),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Código postal inválido"),
  country: z.string().length(2, "País deve ter 2 caracteres").default("US")
});

// Schema para contato (remetente/destinatário)
export const ContactSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  address: AddressSchema,
  accountNumber: z.string().optional()
});

// Schema para dimensões do pacote
export const DimensionsSchema = z.object({
  length: z.number().positive("Comprimento deve ser positivo").max(108, "Comprimento máximo: 108 polegadas"),
  width: z.number().positive("Largura deve ser positiva").max(108, "Largura máxima: 108 polegadas"),
  height: z.number().positive("Altura deve ser positiva").max(108, "Altura máxima: 108 polegadas")
});

// Schema para pacote
export const PackageSchema = z.object({
  weight: z.number().positive("Peso deve ser positivo").max(150, "Peso máximo: 150 libras"),
  dimensions: DimensionsSchema,
  packagingType: z.string().optional().default("02"), // Customer Supplied Package
  declaredValue: z.number().optional()
});

// Schema para dados do envio
export const ShipmentDataSchema = z.object({
  shipper: ContactSchema,
  recipient: ContactSchema,
  packages: z.array(PackageSchema).min(1, "Pelo menos um pacote é obrigatório")
});

// Schema para requisição de cotação
export const RateRequestSchema = z.object({
  carrier: z.enum(["ups", "fedex", "all"], {
    errorMap: () => ({ message: "Transportadora deve ser 'ups', 'fedex' ou 'all'" })
  }),
  shipmentData: ShipmentDataSchema
});

// Schema para resposta de cotação
export const ShippingRateSchema = z.object({
  id: z.string(),
  carrier: z.string(),
  service: z.string(),
  serviceName: z.string(),
  cost: z.number(),
  currency: z.string(),
  transitTime: z.string(),
  deliveryDate: z.string().optional(),
  estimatedDelivery: z.string().optional()
});

// Tipos TypeScript derivados dos schemas
export type Address = z.infer<typeof AddressSchema>;
export type Contact = z.infer<typeof ContactSchema>;
export type Dimensions = z.infer<typeof DimensionsSchema>;
export type Package = z.infer<typeof PackageSchema>;
export type ShipmentData = z.infer<typeof ShipmentDataSchema>;
export type RateRequest = z.infer<typeof RateRequestSchema>;
export type ShippingRate = z.infer<typeof ShippingRateSchema>;

