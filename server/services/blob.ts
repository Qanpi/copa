import { BlobServiceClient } from "@azure/storage-blob";
import { debugDB } from "./debuggers.js";

const conStr = process.env.AZURE_BLOB_CONNECTION_STRING;
if (!conStr) throw new Error("No Azure Blob connnection string.")

const blobServiceClient = BlobServiceClient.fromConnectionString(conStr);

const containerName = "images";
const containerClient = blobServiceClient.getContainerClient(containerName);
await containerClient.createIfNotExists();

debugDB("Connected to Azure Blob Storage container.");
export default containerClient;



