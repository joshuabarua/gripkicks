import { Hono } from 'hono';
import {
  recommendShoes,
  // getShoeById,    
  // getAllShoes,    
  // createShoe,     
  // updateShoe,   
  // deleteShoe    
} from '@/controllers/shoesController'; 

const shoes = new Hono();

shoes.post('/recommend', recommendShoes);

// TODO: Implement standard CRUD routes for shoes
// shoes.get('/', getAllShoes);
// shoes.get('/:id', getShoeById);       
// shoes.post('/', createShoe);    
// shoes.put('/:id', updateShoe);    
// shoes.delete('/:id', deleteShoe); 

export default shoes;
