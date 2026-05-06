import { z } from 'zod';

// Zod schema for form validation
export const editFormSchema = z.object({
  size: z.string().optional(),
  purchaseDate: z.string().optional(),
  condition: z.string().optional(),
  notes: z.string().optional(),
  showNotes: z.boolean(),
  comfortScore: z.coerce.number().min(1).max(10).optional(),
  performanceRating: z.coerce.number().min(1).max(10).optional(),
  durabilityRating: z.coerce.number().min(1).max(10).optional(),
  fitLongevity: z.string().optional(),
  sizingDeviation: z.coerce.number().optional(),
});

export type EditFormData = z.infer<typeof editFormSchema>;
