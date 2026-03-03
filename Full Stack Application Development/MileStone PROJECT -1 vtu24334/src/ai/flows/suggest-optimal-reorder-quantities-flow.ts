'use server';
/**
 * @fileOverview A Genkit flow for suggesting optimal reorder quantities for low-stock products.
 *
 * - suggestOptimalReorderQuantities - A function that handles the reorder quantity suggestion process.
 * - SuggestOptimalReorderQuantitiesInput - The input type for the suggestOptimalReorderQuantities function.
 * - SuggestOptimalReorderQuantitiesOutput - The return type for the suggestOptimalReorderQuantities function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductToReorderSchema = z.object({
  productId: z.string().describe('Unique identifier for the product.'),
  productName: z.string().describe('Name of the product.'),
  currentStock: z.number().describe('Current quantity of the product in stock.'),
  averageDailySales: z.number().describe('Average number of units sold per day.'),
  leadTimeDays: z.number().describe('Number of days it takes for new stock to arrive.'),
  safetyStock: z.number().describe('Minimum extra stock to avoid stockouts.'),
});

const SuggestOptimalReorderQuantitiesInputSchema = z.array(ProductToReorderSchema).describe('A list of products to analyze for reorder suggestions.');
export type SuggestOptimalReorderQuantitiesInput = z.infer<typeof SuggestOptimalReorderQuantitiesInputSchema>;

const SuggestedReorderQuantitySchema = z.object({
  productId: z.string().describe('Unique identifier for the product.'),
  productName: z.string().describe('Name of the product.'),
  reorderLevel: z.number().describe('The calculated reorder level for the product.'),
  suggestedReorderQuantity: z.number().int().min(0).describe('The suggested quantity to reorder for the product. Should be 0 if no reorder is needed.'),
  reasoning: z.string().describe('Explanation for the suggested reorder quantity.'),
});

const SuggestOptimalReorderQuantitiesOutputSchema = z.array(SuggestedReorderQuantitySchema).describe('A list of reorder suggestions for the given products.');
export type SuggestOptimalReorderQuantitiesOutput = z.infer<typeof SuggestOptimalReorderQuantitiesOutputSchema>;

export async function suggestOptimalReorderQuantities(
  input: SuggestOptimalReorderQuantitiesInput
): Promise<SuggestOptimalReorderQuantitiesOutput> {
  return suggestOptimalReorderQuantitiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOptimalReorderQuantitiesPrompt',
  input: { schema: SuggestOptimalReorderQuantitiesInputSchema },
  output: { schema: SuggestOptimalReorderQuantitiesOutputSchema },
  prompt: `You are an AI inventory manager assistant. Your task is to analyze the provided list of products and suggest optimal reorder quantities.

For each product, calculate the "Reorder Level" using the following formula:
Reorder Level = (Average Daily Sales × Lead Time Days) + Safety Stock

Then, determine the "suggestedReorderQuantity" and provide "reasoning":
- If the "currentStock" is less than the calculated "Reorder Level", it is a low-stock product and requires a reorder suggestion. The "suggestedReorderQuantity" should be a positive number aiming to bring the stock level well above the reorder level, considering future demand during the next lead time. A good heuristic would be to aim to cover the deficit and enough to maintain stock during the next lead time. Ensure the suggested quantity is at least (Reorder Level - Current Stock).
- If the "currentStock" is greater than or equal to the "Reorder Level", no reorder is needed, so the "suggestedReorderQuantity" should be 0.

Analyze the following products:
{{#each this}}
Product ID: {{{productId}}}
Product Name: {{{productName}}}
Current Stock: {{{currentStock}}}
Average Daily Sales: {{{averageDailySales}}}
Lead Time Days: {{{leadTimeDays}}}
Safety Stock: {{{safetyStock}}}
---
{{/each}}

Please output a JSON array of objects, with each object containing 'productId', 'productName', 'reorderLevel', 'suggestedReorderQuantity', and 'reasoning' for each product provided in the input.
`
});

const suggestOptimalReorderQuantitiesFlow = ai.defineFlow(
  {
    name: 'suggestOptimalReorderQuantitiesFlow',
    inputSchema: SuggestOptimalReorderQuantitiesInputSchema,
    outputSchema: SuggestOptimalReorderQuantitiesOutputSchema,
  },
  async (input) => {
    // Fallback calculation logic matching the AI's instructions
    return input.map(p => {
      const reorderLevel = (p.averageDailySales * p.leadTimeDays) + p.safetyStock;
      let suggestedQuantity = 0;
      let reasoning = "Stock levels are optimal.";

      if (p.currentStock < reorderLevel) {
        // Suggest enough to cover the lead time demand plus the deficit
        const leadTimeDemand = p.averageDailySales * p.leadTimeDays;
        suggestedQuantity = Math.ceil(reorderLevel - p.currentStock + leadTimeDemand);
        reasoning = `Low stock detected (Current: ${p.currentStock}, Reorder Level: ${Math.round(reorderLevel)}). Local algorithm suggested reorder to maintain safety stock through next lead time.`;
      }

      return {
        productId: p.productId,
        productName: p.productName,
        reorderLevel: Math.round(reorderLevel),
        suggestedReorderQuantity: suggestedQuantity,
        reasoning
      };
    });
  }
);