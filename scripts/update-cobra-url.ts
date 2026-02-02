#!/usr/bin/env tsx

const CONVEX_URL = process.env.CONVEX_URL || 'https://peaceful-marten-189.convex.site';

async function updateCobraUrl() {
  try {
    console.log('Updating Cobra image URL...');
    
    // First, find the shoe to get its ID
    const findResponse = await fetch(`${CONVEX_URL}/api/v1/shoes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!findResponse.ok) {
      throw new Error('Failed to fetch shoes');
    }

    const shoesData = await findResponse.json();
    const cobra = shoesData.data.find((shoe: any) => 
      shoe.name === 'Cobra' && shoe.brand === 'La Sportiva'
    );

    if (!cobra) {
      console.error('❌ Could not find Cobra shoe');
      return;
    }

    console.log(`Found Cobra with ID: ${cobra._id}`);

    // Update the image URL
    const updateResponse = await fetch(`${CONVEX_URL}/api/shoes/updateImageUrl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: cobra._id,
        imageUrl: 'https://ik.imagekit.io/ie871bk0r/gripkicks/imgs/shoes/la_sportiva/cobra_w1.jpg?updatedAt=1769956490688'
      })
    });

    const result = await updateResponse.json();
    
    if (updateResponse.ok && result.success) {
      console.log('✅ Successfully updated Cobra image URL');
    } else {
      console.error('❌ Failed to update Cobra image URL:', result.message || 'Unknown error');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

updateCobraUrl();
