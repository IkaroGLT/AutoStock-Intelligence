export type Product = {
  id: number;
  name: string;
  sku: string;
  category: string;
  stock: number;
  minimum: number;
  price: number;
  status: "Em estoque" | "Abaixo do mínimo" | "Sem estoque";
};

export type Movement = {
  id: number;
  // Movimentos antigos, salvos no navegador antes da AS-04, não têm productId.
  productId?: number;
  product: string;
  type: "Entrada" | "Saída" | "Correção";
  quantity: number;
  date: string;
  before: number;
  after: number;
  note?: string;
  correctionOf?: number;
};

export type ProductFormState = {
  name: string;
  sku: string;
  category: string;
  stock: string;
  minimum: string;
  price: string;
};

export type MovementFormState = {
  productId: string;
  type: string;
  quantity: string;
};

export type CorrectionFormState = {
  quantity: string;
  reason: string;
};
