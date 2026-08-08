import 'dotenv/config';
import { MongoClient } from 'mongodb';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('🔴 ERROR: MONGODB_URI is not set in your .env file!');
    console.log('Please set MONGODB_URI in your .env file and run again.');
    process.exit(1);
  }

  console.log('⚡ Connecting to MongoDB Atlas...');
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const dbName = process.env.DB_NAME || 'miraverse';
    const db = client.db(dbName);
    console.log(`🟢 Connected to Database: "${dbName}"`);

    const collections = [
      { name: 'lore', file: 'lore.json', keyField: 'id' },
      { name: 'regions', file: 'regions.json', keyField: 'id' },
      { name: 'factions', file: 'factions.json', keyField: 'id' },
      { name: 'npcs', file: 'npcs.json', keyField: 'id' },
      { name: 'careers', file: 'careers.json', keyField: 'id' },
      { name: 'commsMessages', file: 'messages.json', keyField: 'id' },
      { name: 'pulsePosts', file: 'pulse_posts.json', keyField: 'id' },
    ];

    for (const col of collections) {
      const filePath = path.resolve(__dirname, 'exports', col.file);
      const fileData = await readFile(filePath, 'utf-8');
      const documents = JSON.parse(fileData);

      const collection = db.collection(col.name);
      let count = 0;

      for (const doc of documents) {
        const filter = { [col.keyField]: doc[col.keyField] };
        await collection.updateOne(filter, { $set: doc }, { upsert: true });
        count++;
      }

      console.log(`  ✓ Seeded Collection "${col.name}": ${count} documents upserted.`);
    }

    console.log('\n🎉 MIRAVERSE MongoDB Atlas Database Seeding Completed Successfully!');
  } catch (err) {
    console.error('🔴 Seeding Failed:', err.message);
  } finally {
    await client.close();
    console.log('🔒 Connection closed.');
  }
}

seedDatabase();
