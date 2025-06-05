import express, { Router } from 'express';
import {
  recommendShoes,
  // getShoeById,    
  // getAllShoes,    
  // createShoe,     
  // updateShoe,   
  // deleteShoe    
} from '@/controllers/shoesController'; 

const router: Router = express.Router();

router.post('/recommend', recommendShoes);

// TODO: Implement standard CRUD routes for shoes
// router.get('/', getAllShoes);
// router.get('/:id', getShoeById);       
// router.post('/', createShoe);    
// router.put('/:id', updateShoe);    
// router.delete('/:id', deleteShoe); 

export default router;
