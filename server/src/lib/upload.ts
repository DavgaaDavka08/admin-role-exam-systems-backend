// server/src/lib/upload.ts
//
// Unified upload helper. Uses Cloudinary if credentials are configured,
// otherwise falls back to local disk storage under <repo>/uploads.
// Returns { url, publicId, size, mime, originalName }.

import path from "path";
import fs from "fs";
import crypto from "crypto";

type UploadedFile = Express.Multer.File;

export type StoredFile = {
  url: string;
  publicId?: string;
  originalName: string;
  size: number;
  mime: string;
};

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUD_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUD_SECRET = process.env.CLOUDINARY_API_SECRET;

const HAS_CLOUDINARY = Boolean(CLOUD_NAME && CLOUD_KEY && CLOUD_SECRET);

let cloudinary: any = null;
if (HAS_CLOUDINARY) {
  try {
    // require lazily so the dependency stays optional
    cloudinary = require("cloudinary").v2;
    cloudinary.config({
      cloud_name: CLOUD_NAME,
      api_key: CLOUD_KEY,
      api_secret: CLOUD_SECRET,
      secure: true,
    });
  } catch {
    cloudinary = null;
  }
}

const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function localStore(file: UploadedFile): StoredFile {
  const ext = path.extname(file.originalname) || "";
  const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
  const full = path.join(UPLOAD_DIR, name);
  fs.writeFileSync(full, file.buffer);
  const publicBase = process.env.PUBLIC_UPLOAD_BASE || "/uploads";
  return {
    url: `${publicBase}/${name}`,
    publicId: name,
    originalName: file.originalname,
    size: file.size,
    mime: file.mimetype,
  };
}

async function cloudinaryStore(
  file: UploadedFile,
  folder: string,
  resourceType: "image" | "raw" | "auto"
): Promise<StoredFile> {
  const result: any = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        use_filename: true,
        unique_filename: true,
      },
      (err: any, res: any) => (err ? reject(err) : resolve(res))
    );
    stream.end(file.buffer);
  });
  return {
    url: result.secure_url,
    publicId: result.public_id,
    originalName: file.originalname,
    size: file.size,
    mime: file.mimetype,
  };
}

export async function storeImage(file: UploadedFile): Promise<StoredFile> {
  if (HAS_CLOUDINARY && cloudinary) {
    return cloudinaryStore(file, "exam-system/images", "image");
  }
  return localStore(file);
}

export async function storeArchive(file: UploadedFile): Promise<StoredFile> {
  if (HAS_CLOUDINARY && cloudinary) {
    return cloudinaryStore(file, "exam-system/archives", "raw");
  }
  return localStore(file);
}
