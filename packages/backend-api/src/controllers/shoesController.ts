import { Request, Response } from 'express';
import prisma from '@/db'; 

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

export const recommendShoes = async (req: Request<{}, {}, RecommendShoesRequestBody>, res: Response): Promise<void> => {
  const { footShape, volume } = req.body;
  if (!footShape || !volume) {
    res.status(400).json({ error: 'footShape and volume are required in the request body.' });
    return;
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

    res.json(recommended);
  } catch (error: any) {
    console.error('Error recommending shoes:', error);
    res.status(500).json({ error: error.message || 'Failed to recommend shoes' });
  }
};

export const getAllShoes = async (req: Request, res: Response): Promise<void> => {
  try {
    const shoes = await prisma.shoe.findMany();
    res.status(200).json(shoes);
  } catch (error: any) {
    console.error('Error fetching all shoes:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch shoes' });
  }
};

export const getShoeById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const shoe = await prisma.shoe.findUnique({
      where: { id },
    });
    if (shoe) {
      res.status(200).json(shoe);
    } else {
      res.status(404).json({ error: 'Shoe not found' });
    }
  } catch (error: any) {
    console.error(`Error fetching shoe with id ${id}:`, error);
    res.status(500).json({ error: error.message || 'Failed to fetch shoe' });
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

export const createShoe = async (req: Request<{}, {}, CreateShoeRequestBody>, res: Response): Promise<void> => {
  try {
    const newShoe = await prisma.shoe.create({
      data: req.body,
    });
    res.status(201).json(newShoe);
  } catch (error: any) {
    console.error('Error creating shoe:', error);
    res.status(500).json({ error: error.message || 'Failed to create shoe' });
  }
};

interface UpdateShoeRequestBody {
  name?: string;
  brand?: string;
}

export const updateShoe = async (req: Request<{ id: string }, {}, UpdateShoeRequestBody>, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const updatedShoe = await prisma.shoe.update({
      where: { id },
      data: req.body,
    });
    res.status(200).json(updatedShoe);
  } catch (error: any) {
    if ((error as any).code === 'P2025') {
        res.status(404).json({ error: 'Shoe not found to update.' });
    } else {
        console.error(`Error updating shoe with id ${id}:`, error);
        res.status(500).json({ error: error.message || 'Failed to update shoe' });
    }
  }
};

export const deleteShoe = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await prisma.shoe.delete({
      where: { id },
    });
    res.status(204).send(); 
  } catch (error: any) {
    if ((error as any).code === 'P2025') {
        res.status(404).json({ error: 'Shoe not found to delete.' });
    } else {
        console.error(`Error deleting shoe with id ${id}:`, error);
        res.status(500).json({ error: error.message || 'Failed to delete shoe' });
    }
  }
};
