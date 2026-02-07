import { readFileSync } from 'fs';
import { execSync } from 'child_process';

const applyRemainingUpdates = async () => {
  console.log('Applying remaining ImageKit URL updates (.jpg to .png)...');
  
  try {
    const sqlContent = readFileSync('./update-remaining-jpg-png-urls.sql', 'utf8');
    
    const lines = sqlContent.split('\n');
    const updateLines = lines.filter(line => line.startsWith('UPDATE shoes SET imageUrl'));
    
    console.log(`Found ${updateLines.length} remaining updates to apply`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const updateLine of updateLines) {
      try {
        const match = updateLine.match(/UPDATE shoes SET imageUrl = '([^']+)' WHERE _id = '([^']+)';/);
        
        if (match) {
          const [, newImageUrl, shoeId] = match;
          
          const result = execSync(`npx convex run migrations/updateImageUrls:updateImageUrl '{"shoeId":"${shoeId}","imageUrl":"${newImageUrl}"}'`, {
            encoding: 'utf8',
            stdio: 'pipe'
          });
          
          console.log(`✅ Updated shoe ${shoeId}`);
          successCount++;
        }
      } catch (error) {
        console.error(`❌ Failed to update shoe: ${updateLine.substring(0, 100)}...`);
        console.error(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        errorCount++;
      }
    }
    
    console.log(`\n🎉 Remaining Updates Summary:`);
    console.log(`✅ Successfully updated: ${successCount} shoes`);
    console.log(`❌ Failed updates: ${errorCount} shoes`);
    
    if (successCount > 0) {
      console.log(`\n🔄 Next steps:`);
      console.log(`1. Clear browser cache: Ctrl+Shift+R (or Cmd+Shift+R on Mac)`);
      console.log(`2. Check admin page and shoe selection modal - all images should now be PNG`);
    }
    
  } catch (error) {
    console.error('Error applying remaining updates:', error);
  }
};

if (require.main === module) {
  applyRemainingUpdates();
}

export { applyRemainingUpdates };
