import {
  BlobSASPermissions,
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";
import crypto from "crypto";

const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;
const AZURE_STORAGE_CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME;

function assertAzureConfigured() {
  if (!AZURE_STORAGE_CONNECTION_STRING || !AZURE_STORAGE_CONTAINER_NAME) {
    throw new Error(
      "Azure Blob Storage is not configured. Please set AZURE_STORAGE_CONNECTION_STRING and AZURE_STORAGE_CONTAINER_NAME.",
    );
  }
}

function getContainerClient() {
  assertAzureConfigured();
  const serviceClient = BlobServiceClient.fromConnectionString(
    AZURE_STORAGE_CONNECTION_STRING,
  );
  return serviceClient.getContainerClient(AZURE_STORAGE_CONTAINER_NAME);
}

async function ensureContainer(containerClient) {
  await containerClient.createIfNotExists();
}

function parseConnectionString(connectionString) {
  const accountName = /AccountName=([^;]+)/.exec(connectionString || "")?.[1];
  const accountKey = /AccountKey=([^;]+)/.exec(connectionString || "")?.[1];
  return { accountName, accountKey };
}

function buildReadableBlobUrl(containerName, blobName) {
  const { accountName, accountKey } = parseConnectionString(
    AZURE_STORAGE_CONNECTION_STRING,
  );

  if (!accountName || !accountKey) {
    throw new Error("Invalid Azure storage connection string.");
  }

  const sharedKeyCredential = new StorageSharedKeyCredential(
    accountName,
    accountKey,
  );

  const startsOn = new Date(Date.now() - 5 * 60 * 1000);
  const expiresOn = new Date();
  expiresOn.setFullYear(expiresOn.getFullYear() + 10);

  const sasToken = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("r"),
      startsOn,
      expiresOn,
      protocol: "https",
    },
    sharedKeyCredential,
  ).toString();

  return `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;
}

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function buildBlobName(originalName = "poster") {
  const ext = originalName.includes(".")
    ? originalName.split(".").pop().toLowerCase()
    : "png";
  const safeExt = /^[a-z0-9]{2,5}$/.test(ext) ? ext : "png";
  return `events/posters/${Date.now()}-${crypto.randomUUID()}.${safeExt}`;
}

export async function uploadEventPosterBuffer({
  buffer,
  contentType,
  originalName,
}) {
  const containerClient = getContainerClient();
  await ensureContainer(containerClient);

  const blobName = buildBlobName(
    sanitizeFileName(originalName || "poster.png"),
  );
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: {
      blobContentType: contentType || "application/octet-stream",
    },
  });

  return buildReadableBlobUrl(AZURE_STORAGE_CONTAINER_NAME, blobName);
}

export async function uploadEventPosterFromFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return uploadEventPosterBuffer({
    buffer,
    contentType: file.type,
    originalName: file.name,
  });
}

export async function uploadEventPosterFromDataUrl(dataUrl) {
  const match = /^data:(.+);base64,(.+)$/.exec(dataUrl || "");
  if (!match) {
    throw new Error("Invalid poster format. Expected data URL.");
  }

  const contentType = match[1];
  const base64Data = match[2];
  const buffer = Buffer.from(base64Data, "base64");

  const extFromType = (contentType.split("/")[1] || "png").split(";")[0];
  return uploadEventPosterBuffer({
    buffer,
    contentType,
    originalName: `poster.${extFromType}`,
  });
}
