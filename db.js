import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";
const uri = process.env.URI;

let client;
let db;

export async function ConnectToDatabase() {
    if (db) {
        return { db }; 
    }

    // bah

    try {
        client = new MongoClient(uri);
        await client.connect();

        db = client.db("mfb");

        return { db };
    } catch (err) {
        throw new Error("Failed to connect to DB: " + err);
    }
    
}

export async function CloseDatabaseConnection() {
    try {
        await client.close();
        client = null;
        db = null;
    } catch (err) {
        console.error("Failed to close DB connection: " + err);
    }
}

export async function GetCollection() {
    const { db } = await ConnectToDatabase();
    return db.collection("vouches");
}

export async function SaveVouch(vouchData) {
    const vouches = await GetCollection();

    try {
        await vouches.insertOne(vouchData);
    } catch (err) {
        throw new Error("Failed to save vouch: " + err);
    }
}

export async function GetVouches(userId) {
    const vouches = await GetCollection();

    try {
        return await vouches.find({ userId }).toArray();
    } catch (err) {
        throw new Error("Failed to fetch vouches: " + err);
    }
}

export async function GetAllVouches() {
    const vouches = await GetCollection();

    try {
        return await vouches.find({}).toArray();
    } catch (err) {
        throw new Error("Failed to fetch all vouches: " + err);
    }
}

export async function DeleteVouch(vouchId) {
    const vouches = await GetCollection();

    try {
        await vouches.deleteOne({ _id: new ObjectId(vouchId) });
    } catch (err) {
        throw new Error("Failed to delete vouch: " + err);
    }
}

// ===============================
// BAN SYSTEM
// ===============================
export async function AddBan(userId, reason, moderator) {
  const { db } = await ConnectToDatabase();
  const bans = db.collection("bans");

  await bans.updateOne(
    { userId },
    {
      $set: {
        userId,
        reason,
        moderator,
        date: Date.now()
      }
    },
    { upsert: true }
  );
}

export async function RemoveBan(userId) {
  const { db } = await ConnectToDatabase();
  const bans = db.collection("bans");

  await bans.deleteOne({ userId });
}

export async function GetBan(userId) {
  const { db } = await ConnectToDatabase();
  const bans = db.collection("bans");

  return await bans.findOne({ userId });
}
