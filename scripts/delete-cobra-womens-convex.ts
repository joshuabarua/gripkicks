#!/usr/bin/env tsx

import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient("https://peaceful-marten-189.convex.cloud");

async function deleteCobraWomens() {
  try {
    console.log('Deleting Cobra Women from Convex...');
    
    const result = await convex.mutation("seed/deleteShoeByName", {
      name: 'Cobra Women',
      brand: 'La Sportiva'
    });
    
    console.log('Result:', result);
    
    if (result.success) {
      console.log('✅ Successfully deleted Cobra Women:', result.message);
      if (result.deletedFootShapeComps > 0) {
        console.log(`   - Deleted ${result.deletedFootShapeComps} foot shape compatibility records`);
      }
      if (result.deletedUserShoes > 0) {
        console.log(`   - Deleted ${result.deletedUserShoes} user shoe records`);
      }
    } else {
      console.error('❌ Failed to delete Cobra Women:', result.message || 'Unknown error');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

deleteCobraWomens();
