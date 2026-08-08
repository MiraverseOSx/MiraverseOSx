import { MongoClient } from 'mongodb';

class StorageEngine {
  constructor() {
    this.client = null;
    this.db = null;
    this.isMongoDBConnected = false;

    // In-Memory Storage Fallback
    this.memoryUsers = new Map();
    this.memoryPulsePosts = [
      {
        id: 'PULSE_001',
        author: 'Jeremie',
        handle: 'jeremie_v',
        houseTag: 'Vector',
        content: 'Noticed unusual aura telemetry spikes near Sector 7. Keep your shields up.',
        timestamp: '10m ago',
        likes: 12,
        reactions: 4,
        isNpc: true,
      },
      {
        id: 'PULSE_002',
        author: 'Aelita',
        handle: 'aelita_code',
        houseTag: 'Vertex',
        content: 'New Cycademy research module deployed to the mesh. Terminal access online.',
        timestamp: '25m ago',
        likes: 24,
        reactions: 9,
        isNpc: true,
      },
      {
        id: 'PULSE_003',
        author: 'Odd',
        handle: 'odd_drifter',
        houseTag: 'Anchor',
        content: 'Anyone seen the PRISM frequencies in Sector 3? Signal interference is heavy.',
        timestamp: '1h ago',
        likes: 8,
        reactions: 2,
        isNpc: true,
      },
    ];
    this.memoryCommsMessages = new Map();
    this.memoryQuests = new Map();
  }

  async initStorage() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.log('🟡 MONGODB_URI not found in environment — StorageEngine running in In-Memory Mode.');
      return;
    }

    try {
      this.client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 4000,
        connectTimeoutMS: 4000,
      });
      await this.client.connect();
      this.db = this.client.db(process.env.DB_NAME || 'miraverse');
      await this.db.command({ ping: 1 });
      this.isMongoDBConnected = true;
      console.log('🟢 MongoDB Atlas Connection Active (Database:', this.db.databaseName, ')');
    } catch (err) {
      console.warn('🟡 MongoDB Atlas Connection Failed:', err.message);
      console.log('⚡ StorageEngine switching to In-Memory Storage Fallback Mode.');
      this.isMongoDBConnected = false;
      this.client = null;
      this.db = null;
    }
  }

  getStatus() {
    return {
      engine: this.isMongoDBConnected ? 'MongoDB Atlas' : 'In-Memory Fallback Engine',
      dbConnected: this.isMongoDBConnected,
      databaseName: this.db?.databaseName || 'in-memory-db',
    };
  }

  // --- LORE COLLECTION APIs ---
  async getLore(query = '') {
    if (this.isMongoDBConnected && this.db) {
      try {
        let filter = {};
        if (query) {
          const regex = new RegExp(query, 'i');
          filter = {
            $or: [
              { title: regex },
              { content: regex },
              { category: regex },
              { tags: regex },
            ],
          };
        }
        const results = await this.db.collection('lore').find(filter).toArray();
        if (results && results.length > 0) return results;
      } catch (e) {
        console.warn('DB Lore Query Error:', e.message);
      }
    }

    const { WorldAuthority } = await import('../world/worldAuthority.js');
    return WorldAuthority.searchLore(query);
  }

  // --- USER STATE APIs ---
  async getUserState(userId = 'CY-9021-CITIZEN') {
    if (this.isMongoDBConnected && this.db) {
      try {
        const user = await this.db.collection('users').findOne({ userId });
        if (user) return user;
      } catch (e) {
        console.warn('DB User Query Error:', e.message);
      }
    }
    return this.memoryUsers.get(userId) || null;
  }

  async saveUserState(userId, stateData) {
    const record = { userId, ...stateData, updatedAt: new Date().toISOString() };
    this.memoryUsers.set(userId, record);

    if (this.isMongoDBConnected && this.db) {
      try {
        await this.db.collection('users').updateOne(
          { userId },
          { $set: record },
          { upsert: true }
        );
      } catch (e) {
        console.warn('DB User Save Error:', e.message);
      }
    }
    return record;
  }

  // --- PULSE SOCIAL POSTS APIs ---
  async getPulsePosts() {
    if (this.isMongoDBConnected && this.db) {
      try {
        const posts = await this.db.collection('pulsePosts').find({}).sort({ _id: -1 }).toArray();
        if (posts && posts.length > 0) return posts;
      } catch (e) {
        console.warn('DB Pulse Query Error:', e.message);
      }
    }
    return this.memoryPulsePosts;
  }

  async createPulsePost(postData) {
    const newPost = {
      id: `PULSE_${Date.now()}`,
      author: postData.author || 'Citizen',
      handle: postData.handle || 'citizen_anon',
      houseTag: postData.houseTag || 'Vector',
      content: postData.content || '',
      timestamp: 'Just now',
      likes: 0,
      reactions: 0,
      isNpc: false,
      createdAt: new Date().toISOString(),
    };

    this.memoryPulsePosts.unshift(newPost);

    if (this.isMongoDBConnected && this.db) {
      try {
        await this.db.collection('pulsePosts').insertOne(newPost);
      } catch (e) {
        console.warn('DB Pulse Insert Error:', e.message);
      }
    }
    return newPost;
  }

  // --- COMMS & MESSAGES APIs ---
  async getCommsMessages(userId = 'CY-9021-CITIZEN') {
    if (this.isMongoDBConnected && this.db) {
      try {
        const msgs = await this.db.collection('commsMessages').find({ userId }).toArray();
        if (msgs && msgs.length > 0) return msgs;
      } catch (e) {
        console.warn('DB Comms Query Error:', e.message);
      }
    }
    return this.memoryCommsMessages.get(userId) || [];
  }

  async saveCommsMessage(userId, msgData) {
    const newMsg = {
      id: msgData.id || `MSG_${Date.now()}`,
      userId,
      sender: msgData.sender || 'System',
      subject: msgData.subject || 'Notice',
      body: msgData.body || '',
      time: msgData.time || 'Just now',
      read: msgData.read || false,
      createdAt: new Date().toISOString(),
    };

    const existing = this.memoryCommsMessages.get(userId) || [];
    existing.unshift(newMsg);
    this.memoryCommsMessages.set(userId, existing);

    if (this.isMongoDBConnected && this.db) {
      try {
        await this.db.collection('commsMessages').insertOne(newMsg);
      } catch (e) {
        console.warn('DB Comms Insert Error:', e.message);
      }
    }
    return newMsg;
  }

  // --- QUESTS APIs ---
  async getQuests(userId = 'CY-9021-CITIZEN') {
    if (this.isMongoDBConnected && this.db) {
      try {
        const quests = await this.db.collection('quests').find({ userId }).toArray();
        if (quests && quests.length > 0) return quests;
      } catch (e) {
        console.warn('DB Quests Query Error:', e.message);
      }
    }
    return this.memoryQuests.get(userId) || [];
  }

  async saveQuest(userId, questData) {
    const questRecord = {
      userId,
      questId: questData.questId,
      status: questData.status || 'IN_PROGRESS',
      updatedAt: new Date().toISOString(),
    };

    const existing = this.memoryQuests.get(userId) || [];
    const idx = existing.findIndex((q) => q.questId === questData.questId);
    if (idx >= 0) {
      existing[idx] = questRecord;
    } else {
      existing.push(questRecord);
    }
    this.memoryQuests.set(userId, existing);

    if (this.isMongoDBConnected && this.db) {
      try {
        await this.db.collection('quests').updateOne(
          { userId, questId: questData.questId },
          { $set: questRecord },
          { upsert: true }
        );
      } catch (e) {
        console.warn('DB Quest Save Error:', e.message);
      }
    }
    return questRecord;
  }
}

export const storageEngine = new StorageEngine();
export default storageEngine;
