import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";
const uri = process.env.URI;

let client;
let db;

export async function ConnectToDatabase() {
    if (db) {
        return { db }; 
    }

    try {
        client = new MongoClient(uri);
        await client.connect()

        db = client.db("mfb");

        return { db };
    } catch (err) {
        throw new Error("Failed to connect to DB: " + err);
    }
    
}

export async function SaveVouch(vouchData) {
    const { db } = await ConnectToDatabase();
    const vouches = db.collection("vouches");

    try {
        await vouches.insertOne(vouchData);
    } catch (err) {
        throw new Error("Failed to save vouch: " + err);
    }
}

export async function GetVouches(userId) {
    const { db } = await ConnectToDatabase();
    const vouches = db.collection("vouches");

    try {
        return await vouches.find({ userId }).toArray();
    } catch (err) {
        throw new Error("Failed to fetch vouches: " + err);
    }
}

export async function GetAllVouches() {
    const { db } = await ConnectToDatabase();
    const vouches = db.collection("vouches");

    try {
        return await vouches.find({}).toArray();
    } catch (err) {
        throw new Error("Failed to fetch all vouches: " + err);
    }
}

export async function DeleteVouch(vouchId) {
    const { db } = await ConnectToDatabase();
    const vouches = db.collection("vouches");

    try {
        await vouches.deleteOne({ _id: new ObjectId(vouchId) });
    } catch (err) {
        throw new Error("Failed to delete vouch: " + err);
    }
}
