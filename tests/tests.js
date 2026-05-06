import { PingDB } from "./dbtest.js";

async function runTests() {
  const dbResult = await PingDB();
  const collectionResult = await CheckCollectionExists();
  console.log("DB Test Result:", dbResult ? "Passed" : "Failed");
  console.log("Collection Test Result:", collectionResult ? "Passed" : "Failed");
}

runTests();