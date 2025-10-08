import cloudinary from "../config/cloudinary.js";

export const uploadPDFToCloudinary = async (pdfBuffer, filename) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "visitor-pdfs",
        public_id: `${filename}.pdf`,
        // format: "pdf",
        access_mode: "public",
        type: "upload",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );

    uploadStream.end(pdfBuffer);
  });
};
