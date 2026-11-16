import type { Movement, Product } from "../types/inventory";

export const normalizeSku = (value: string): string => value.trim().toUpperCase();

export function stockStatus(stock: number, minimum: number): Product["status"] {
  if (stock === 0) return "Sem estoque";
  return stock <= minimum ? "Abaixo do mínimo" : "Em estoque";
}

export function validateProduct(
  input: { name: string; sku: string; category: string; stock: string; minimum: string; price: string },
  products: Product[],
  editingId: number | null,
): string | null {
  if (!input.name.trim() || !normalizeSku(input.sku) || !input.category.trim()) {
    return "Preencha nome, SKU e categoria do produto.";
  }
  if (products.some((product) =>
    product.id !== editingId && normalizeSku(product.sku) === normalizeSku(input.sku),
  )) {
    return "Esse SKU já está cadastrado. Informe um SKU único.";
  }
  const stock = Number(input.stock);
  const minimum = Number(input.minimum);
  const price = Number(input.price);
  if (
    [input.stock, input.minimum, input.price].some((field) => field.trim() === "") ||
    !Number.isInteger(stock) || stock < 0 ||
    !Number.isInteger(minimum) || minimum < 0 ||
    !Number.isFinite(price) || price < 0
  ) {
    return "Quantidade, estoque mínimo e preço devem ser valores válidos e não negativos.";
  }
  return null;
}

// Movimentos legados só podem ser associados pelo nome quando ele for único.
// Não inferir um ID arbitrário evita corrigir o estoque de outro produto.
export function resolveMovementProduct(products: Product[], movement: Movement): Product | undefined {
  if (movement.productId !== undefined) {
    return products.find((product) => product.id === movement.productId);
  }
  const matches = products.filter((product) => product.name === movement.product);
  return matches.length === 1 ? matches[0] : undefined;
}
