import expressAsyncHandler from "express-async-handler";
import { IncomingHttpHeaders } from "http";
import containerClient from "../services/blob.js";
import internal from "stream";

//copy pasted from https://www.mongodb.com/developer/products/atlas/media-management-integrating-nodejs-azure-blob-storage-mongodb/#downloading-your-packages
function extractMetadata(headers: IncomingHttpHeaders) {
    const contentType = headers['content-type'];
    const fileType = contentType?.split('/')[1];
    const contentDisposition = headers['content-disposition'] || '';
    const caption = headers['x-image-caption'] || 'No caption provided';
    const matches = /filename="([^"]+)"/i.exec(contentDisposition);
    const fileName = matches?.[1] || `image-${Date.now()}.${fileType}`;
    return { fileName, caption, fileType };
}

const uploadImageToBlob = async (fileName: string, dataStream: internal.Readable) => {
    const blobClient = containerClient.getBlockBlobClient(fileName);
    await blobClient.uploadStream(dataStream);
    return blobClient.url;
}

export const uploadImage = expressAsyncHandler(async (req, res) => {
    const { fileName, caption, fileType } = extractMetadata(req.headers);

    const imageUrl = await uploadImageToBlob(fileName, req);
    res.send({
        address: imageUrl
    });
});