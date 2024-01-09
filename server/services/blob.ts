import { BlobServiceClient } from "@azure/storage-blob";
import { debugDB, debugError } from "./debuggers.js";

const conStr = process.env.AZURE_BLOB_CONNECTION_STRING;
if (!conStr) throw new Error("No Azure Blob connnection string.")

const blobServiceClient = BlobServiceClient.fromConnectionString(conStr);

const containerName = "images";
const containerClient = blobServiceClient.getContainerClient(containerName);

try {
    await containerClient.createIfNotExists();
    debugDB("Connected to Azure Blob Storage container.");
} catch (error) {
    debugError("Couldn't connect to Azure Blob storage container.");
    //error not thrown because storage is not critical to app running
}

export default containerClient;



