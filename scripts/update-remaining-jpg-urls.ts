import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

const updateRemainingJpgUrls = () => {
  console.log('Finding and updating ALL remaining .jpg ImageKit URLs to .png...');

  try {
    const result = execSync('npx convex data shoes --format jsonLines', {
      encoding: 'utf8',
      stdio: 'pipe'
    });

    const lines = result.trim().split('\n');
    const updates: string[] = [];
    let updatedCount = 0;

    for (const line of lines) {
      try {
        const shoe = JSON.parse(line);

        if (shoe.imageUrl && shoe.imageUrl.includes('ik.imagekit.io') && shoe.imageUrl.includes('.jpg')) {
          const newImageUrl = shoe.imageUrl.includes('.jpg?updatedAt=')
            ? shoe.imageUrl.replace('.jpg?updatedAt=', '.png?updatedAt=')
            : shoe.imageUrl.replace('.jpg', '.png');

          updates.push(`UPDATE shoes SET imageUrl = '${newImageUrl}' WHERE _id = '${shoe._id}';`);

          console.log(`Found: ${shoe.brand} ${shoe.name}`);
          console.log(`  From: ${shoe.imageUrl}`);
          console.log(`  To: ${newImageUrl}`);
          console.log('');

          updatedCount++;
        }
      } catch (parseError) {
        continue;
      }
    }

    if (updatedCount > 0) {
      const sqlContent = `-- All Remaining ImageKit URL Updates: .jpg to .png
-- Generated on ${new Date().toISOString()}
-- Total updates: ${updatedCount}

${updates.join('\n')}

-- To apply these updates:
-- 1. Make sure Convex dev server is running: npx convex dev
-- 2. Run: npx tsx scripts/apply-remaining-updates.ts
-- Or manually execute each UPDATE statement in the Convex dashboard
`;

      writeFileSync('./update-remaining-jpg-png-urls.sql', sqlContent);
      console.log(`✅ Generated SQL file with ${updatedCount} updates: update-remaining-jpg-png-urls.sql`);

      console.log('\nNext steps:');
      console.log('1. Keep Convex dev server running');
      console.log('2. Run: npx tsx scripts/apply-remaining-updates.ts');
    } else {
      console.log('No remaining .jpg ImageKit URLs found to update');
    }

  } catch (error) {
    console.error('Error generating updates:', error);
  }
};

if (require.main === module) {
  updateRemainingJpgUrls();
}

export { updateRemainingJpgUrls };
