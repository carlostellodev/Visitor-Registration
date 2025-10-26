import cloudinary, { getCloudinaryFolder } from "../config/cloudinary.js";

export const uploadPDFToCloudinary = async (pdfBuffer, filename) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: getCloudinaryFolder("visitor-pdfs"),
        public_id: `${filename}`,
        format: "pdf",
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

export const deletePDFFromCloudinary = async (pdfUrl) => {
  try {
    if (!pdfUrl) {
      return { success: false, message: "No se proporcionó URL del PDF" };
    }

    const regex = /\/v\d+\/(.+)$/i;
    const match = pdfUrl.match(regex);

    if (!match) {
      console.error("No se pudo extraer el public_id de la URL:", pdfUrl);
      return { success: false, message: "No se pudo extraer el public_id" };
    }

    const publicId = match[1]; // "dev/visitor-pdfs/visit_68e556a0babdc8f734efacef_1761477782025.pdf"

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw",
      type: "upload",
      invalidate: true,
    });

    if (result.result !== "ok") {
      console.warn("Cloudinary no pudo eliminar el archivo:", result);
    }

    return {
      success: result.result === "ok",
      result,
    };
  } catch (error) {
    console.error("Error eliminando PDF de Cloudinary:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
