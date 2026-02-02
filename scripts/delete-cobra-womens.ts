#!/usr/bin/env tsx

const CONVEX_URL = process.env.CONVEX_URL || 'https://peaceful-marten-189.convex.site';

async function deleteCobraWomens() {
  try {
    console.log('Deleting Cobra Women from Convex...');

    const response = await fetch(`${CONVEX_URL}/api/shoes/deleteByName`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Cobra Women',
        brand: 'La Sportiva'
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    const text = await response.text();
    console.log('Raw response:', text);

    // Try to parse as JSON
    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse response as JSON:', text);
      return;
    }

    if (response.ok && result.success) {
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
