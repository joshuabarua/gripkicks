import { Context } from 'hono';
import prisma from '@/config/db.config';

interface ComfortRanking {
  id: string;
  shoeId: string;
  footShape: string;
  volume: string;
  score: number;
}

interface ShoeWithComfortRankings {
  id: string;
  name: string;
  comfortRankings: ComfortRanking[];
}

interface RecommendedShoe extends ShoeWithComfortRankings {
  comfortScore: number;
}

interface RecommendShoesRequestBody {
  footShape: string;
  volume: string;
}

export const recommendShoes = async (c: Context): Promise<Response> => {
  const { footShape, volume } = await c.req.json() as RecommendShoesRequestBody;
  if (!footShape || !volume) {
    return c.json({ error: 'footShape and volume are required in the request body.' }, 400);
  }

  try {
    const shoes: ShoeWithComfortRankings[] = await prisma.shoe.findMany({
      include: { comfortRankings: true }, // Assuming 'comfortRankings' is the relation field
    });

    const recommended: RecommendedShoe[] = shoes
      .map(shoe => {
        const scoreObj = shoe.comfortRankings.find(
          cr => cr.footShape === footShape && cr.volume === volume
        );
        return {
          ...shoe,
          comfortScore: scoreObj ? scoreObj.score : 3,
        };
      })
      .sort((a, b) => b.comfortScore - a.comfortScore);

    return c.json(recommended);
  } catch (error: any) {
    console.error('Error recommending shoes:', error);
    return c.json({ error: error.message || 'Failed to recommend shoes' }, 500);
  }
};

// TODO: Convert other CRUD operations to Hono when needed
export const getAllShoes = async (c: Context): Promise<Response> => {
  try {
    const shoes = await prisma.shoe.findMany();
    return c.json(shoes);
  } catch (error: any) {
    console.error('Error fetching shoes:', error);
    return c.json({ error: error.message || 'Failed to fetch shoes' }, 500);
  }
};

export const getShoeById = async (c: Context): Promise<Response> => {
  const id = c.req.param('id');
  if (!id) {
    return c.json({ error: 'Shoe ID is required' }, 400);
  }

  try {
    const shoe = await prisma.shoe.findUnique({ where: { id } });
    if (!shoe) {
      return c.json({ error: 'Shoe not found' }, 404);
    }
    return c.json(shoe);
  } catch (error: any) {
    console.error('Error fetching shoe:', error);
    return c.json({ error: error.message || 'Failed to fetch shoe' }, 500);
  }
};

interface CreateShoeRequestBody {
  name: string;
  brand: string;
  imageUrl?: string | null;
  aggressiveness: string;
  stiffness: string;
  climbingDiscipline: string;
  volume: string;
  rubberTechnologyId?: string | null;
}

export const createShoe = async (c: Context): Promise<Response> => {
  try {
    const body = await c.req.json() as CreateShoeRequestBody;
    const shoe = await prisma.shoe.create({ data: body });
    return c.json(shoe, 201);
  } catch (error: any) {
    console.error('Error creating shoe:', error);
    return c.json({ error: error.message || 'Failed to create shoe' }, 500);
  }
};

interface UpdateShoeRequestBody {
  name?: string;
  brand?: string;
  imageUrl?: string | null;
  aggressiveness?: string;
  stiffness?: string;
  climbingDiscipline?: string;
  volume?: string;
  rubberTechnologyId?: string | null;
}

export const updateShoe = async (c: Context): Promise<Response> => {
  const id = c.req.param('id');
  if (!id) {
    return c.json({ error: 'Shoe ID is required' }, 400);
  }

  try {
    const body = await c.req.json() as UpdateShoeRequestBody;
    const shoe = await prisma.shoe.update({ where: { id }, data: body });
    return c.json(shoe);
  } catch (error: any) {
    console.error('Error updating shoe:', error);
    return c.json({ error: error.message || 'Failed to update shoe' }, 500);
  }
};

export const deleteShoe = async (c: Context): Promise<Response> => {
  const id = c.req.param('id');
  if (!id) {
    return c.json({ error: 'Shoe ID is required' }, 400);
  }

  try {
    await prisma.shoe.delete({ where: { id } });
    return c.json({ message: 'Shoe deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting shoe:', error);
    return c.json({ error: error.message || 'Failed to delete shoe' }, 500);
  }
};
