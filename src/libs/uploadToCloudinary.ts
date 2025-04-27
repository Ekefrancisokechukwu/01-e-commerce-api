import { v2 as cloudinary } from "cloudinary";
import BadRequestError from "../errors/badRequestError";
import { Readable } from "stream";

export function bufferToStream(buffer: Buffer) {
  if (!buffer || buffer.length === 0) {
    throw new Error("Cannot create stream from empty buffer");
  }

  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
}

export async function uploadBufferToCloudinary(buffer: Buffer, folder: string) {
  if (!buffer || buffer.length === 0) {
    throw new BadRequestError("Cannot upload empty buffer to Cloudinary");
  }

  return new Promise<{ url: string; public_id: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        timeout: 60000,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return reject(error);
        }
        if (!result) {
          return reject(new Error("No result from Cloudinary upload"));
        }
        return resolve({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    const bufferStream = bufferToStream(buffer);

    bufferStream.on("error", (error) => {
      console.error("Stream error:", error);
      reject(error);
    });

    stream.on("error", (error) => {
      console.error("Cloudinary stream error:", error);
      reject(error);
    });

    bufferStream.pipe(stream);
  });
}
