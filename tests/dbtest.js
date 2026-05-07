import { MongoClient } from "mongodb";
import { ConnectToDatabase } from "../db";
import "dotenv/config";

const uri = process.env.URI;

export async function PingDB() {
  let client;

  try {
    client = new MongoClient(uri);
    await client.connect();

    await client.db("mfb").command({ ping: 1 });
    // console.log("Passed");

    return true;
  } catch (err) {
    console.error("DB error:", err);
    return false;
  } finally {
    if (client) {
      await client.close();
     // console.log("Closed connection");
    }
  }
}

export async function CheckCollectionExists() {
    const { db } = await ConnectToDatabase();
    const collections = await db.listCollections().toArray();
    if (collections == null) {
        console.error("Failed to list collections.");
        return false;
    }
    return collections.some(col => col.name === "vouches");
}

PingDB();
CheckCollectionExists();