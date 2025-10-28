import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";

import { loadImageFromUrl } from "./imageLoader.js";

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatTime(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Madrid",
  });
}

export const generateExcel = async (visitors, tenantName) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Visitantes");

  // Añadir título
  worksheet.addRow([`Reporte de Visitantes - ${tenantName}`]);
  worksheet.mergeCells("A1:I1");
  worksheet.getCell("A1").font = { size: 16, bold: true };
  worksheet.getCell("A1").alignment = {
    vertical: "middle",
    horizontal: "center",
  };
  worksheet.getRow(1).height = 40;

  const headerRow = worksheet.addRow([
    "Fecha",
    "Hora",
    "Nombre",
    "Empresa",
    "Matrícula",
    "Motivo",
    "Zona de acceso",
    "Responsable",
    "Firma",
  ]);

  // Definir anchos de columna
  worksheet.getColumn(1).width = 12; // Fecha
  worksheet.getColumn(2).width = 10; // Hora
  worksheet.getColumn(3).width = 25; // Nombre
  worksheet.getColumn(4).width = 25; // Empresa
  worksheet.getColumn(5).width = 12; // Matrícula
  worksheet.getColumn(6).width = 20; // Motivo
  worksheet.getColumn(7).width = 20; // Zona de acceso
  worksheet.getColumn(8).width = 25; // Responsable
  worksheet.getColumn(9).width = 24; // Firma

  // Estilos del header
  headerRow.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4472C4" },
  };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  headerRow.height = 25;

  // Añadir datos con firmas
  for (let i = 0; i < visitors.length; i++) {
    const visitor = visitors[i];

    const row = worksheet.addRow([
      formatDate(visitor.visitDate),
      formatTime(visitor.visitDate),
      visitor.name,
      visitor.company,
      visitor.plate || "-",
      Array.isArray(visitor.purpose)
        ? visitor.purpose.map((p) => capitalize(p)).join(", ")
        : capitalize(visitor.purpose),
      Array.isArray(visitor.accessZone)
        ? visitor.accessZone.map((z) => capitalize(z)).join(", ")
        : capitalize(visitor.accessZone),
      visitor.workerId?.name || "-",
      "", // Columna de firma
    ]);

    row.height = 55;

    // Aplicar alineación a todas las celdas de datos
    row.alignment = { vertical: "middle", horizontal: "left" };

    // Añadir la firma como imagen
    if (visitor.signature) {
      try {
        // Convertir base64 a buffer
        const base64Data = visitor.signature.replace(
          /^data:image\/\w+;base64,/,
          ""
        );
        const imageBuffer = Buffer.from(base64Data, "base64");

        const imageId = workbook.addImage({
          buffer: imageBuffer,
          extension: "png",
        });

        const imageRow = row.number - 1;

        worksheet.addImage(imageId, {
          tl: { col: 8.15, row: imageRow + 0.15 },
          ext: { width: 150, height: 60 },
          editAs: "oneCell",
        });
      } catch (error) {
        console.error(`Error añadiendo firma para ${visitor.name}:`, error);
        row.getCell(9).value = "Error al cargar";
        row.getCell(9).alignment = {
          vertical: "middle",
          horizontal: "center",
        };
      }
    } else {
      row.getCell(9).value = "Sin firma";
      row.getCell(9).alignment = {
        vertical: "middle",
        horizontal: "center",
      };
    }
  }

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber >= 3) {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    }
  });

  // Añadir filtros
  worksheet.autoFilter = {
    from: { row: 2, column: 1 },
    to: { row: 2, column: 9 },
  };

  // Añadir información de resumen al final
  worksheet.addRow([]);
  const totalRow = worksheet.addRow([
    `Total de visitantes: ${visitors.length}`,
  ]);
  totalRow.getCell(1).font = { bold: true };
  totalRow.height = 25;

  const dateRow = worksheet.addRow([
    `Fecha de exportación: ${new Date().toLocaleString("es-ES")}`,
  ]);
  dateRow.height = 20;

  return await workbook.xlsx.writeBuffer();
};

export const generatePDF = async (visitors, tenantName, tenantLogo) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        bufferPages: true,
      });

      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Configurar fuente
      doc.font("Helvetica");

      let startY = 50;

      // Header con logo
      if (tenantLogo) {
        const imageBuffer = await loadImageFromUrl(tenantLogo);

        if (imageBuffer) {
          doc.image(imageBuffer, 50, 45, {
            fit: [100, 80],
            align: "center",
          });
          startY = 135;
        }
      }

      // Títulos
      doc
        .fontSize(22)
        .font("Helvetica-Bold")
        .text("Reporte de Visitantes", 50, startY, {
          align: "center",
          width: 495,
        });

      doc
        .fontSize(16)
        .font("Helvetica")
        .text(tenantName, 50, startY + 30, {
          align: "center",
          width: 495,
        });

      // Información de generación
      doc
        .fontSize(9)
        .fillColor("#666666")
        .text(
          `Fecha de generación: ${new Date().toLocaleString("es-ES")}`,
          50,
          startY + 55,
          { align: "center", width: 495 }
        );

      doc.text(`Total de visitantes: ${visitors.length}`, 50, startY + 68, {
        align: "center",
        width: 495,
      });

      // Línea separadora
      const lineY = startY + 85;
      doc
        .strokeColor("#333333")
        .lineWidth(1)
        .moveTo(50, lineY)
        .lineTo(545, lineY)
        .stroke();

      // Resetear color
      doc.fillColor("#000000");

      // Posición inicial para las tarjetas de visitantes
      let currentY = lineY + 20;

      // Tabla de visitantes
      for (const [index, visitor] of visitors.entries()) {
        const date = new Date(visitor.visitDate);

        // Altura de cada tarjeta
        const cardHeight = 100;

        // Verificar si hay espacio suficiente para la tarjeta completa
        if (currentY + cardHeight > doc.page.height - 50) {
          doc.addPage();
          currentY = 50;
        }

        // Fondo de la tarjeta con borde
        doc
          .rect(50, currentY - 5, 495, cardHeight)
          .lineWidth(0.5)
          .strokeColor("#dddddd")
          .fillColor(index % 2 === 0 ? "#f5f5f5" : "#ffffff")
          .fillAndStroke();

        // Resetear color de texto
        doc.fillColor("#000000");

        // Nombre del visitante
        doc
          .fontSize(13)
          .font("Helvetica-Bold")
          .text(visitor.name, 60, currentY + 5, { width: 375 });

        // Empresa
        doc
          .fontSize(10)
          .font("Helvetica")
          .fillColor("#333333")
          .text(`Empresa: ${visitor.company}`, 60, currentY + 23, {
            width: 220,
          });

        // Fecha y hora
        doc.text(
          `Fecha y hora: ${formatDate(visitor.visitDate)} - ${formatTime(
            visitor.visitDate
          )}`,
          60,
          currentY + 38,
          { width: 220 }
        );

        // Motivo
        const purpose = Array.isArray(visitor.purpose)
          ? visitor.purpose.map((p) => capitalize(p)).join(", ")
          : capitalize(visitor.purpose);
        doc.text(`Motivo: ${purpose}`, 60, currentY + 53, { width: 220 });

        // Zona de acceso
        const accessZone = Array.isArray(visitor.accessZone)
          ? visitor.accessZone.map((z) => capitalize(z)).join(", ")
          : capitalize(visitor.accessZone);
        doc.text(`Zona: ${accessZone}`, 60, currentY + 68, { width: 220 });

        // Responsable
        doc.text(
          `Responsable: ${visitor.workerId?.name || "-"}`,
          60,
          currentY + 83,
          { width: 220 }
        );

        // Matrícula (si existe)
        if (visitor.plate) {
          doc.text(`Matrícula: ${visitor.plate}`, 295, currentY + 38, {
            width: 130,
          });
        }

        const signatureBoxX = 430; // Posición X del contenedor
        const signatureBoxY = currentY + 14; // Posición Y del contenedor
        const signatureBoxWidth = 90; // Ancho del contenedor
        const signatureBoxHeight = 75; // Alto del contenedor

        // Borde del contenedor de firma
        doc
          .rect(
            signatureBoxX,
            signatureBoxY,
            signatureBoxWidth,
            signatureBoxHeight
          )
          .lineWidth(0.8)
          .strokeColor("#999999")
          .stroke();

        // Título de la sección de firma
        doc
          .fontSize(8)
          .fillColor("#666666")
          .text("Firma", signatureBoxX, signatureBoxY - 12, {
            width: signatureBoxWidth,
            align: "center",
          });

        if (visitor.signature) {
          try {
            const base64Data = visitor.signature.replace(
              /^data:image\/\w+;base64,/,
              ""
            );
            const signatureBuffer = Buffer.from(base64Data, "base64");

            const imageMargin = 3;
            const imageX = signatureBoxX + imageMargin;
            const imageY = signatureBoxY + imageMargin;
            const imageWidth = signatureBoxWidth - imageMargin * 2;
            const imageHeight = signatureBoxHeight - imageMargin * 2;

            doc.image(signatureBuffer, imageX, imageY, {
              width: imageWidth,
              height: imageHeight,
              align: "center",
              valign: "center",
            });
          } catch (error) {
            console.error("Error cargando firma:", error.message);
            // Si falla, mostrar texto alternativo centrado
            doc
              .fontSize(9)
              .fillColor("#999999")
              .text(
                "Sin firma",
                signatureBoxX,
                signatureBoxY + signatureBoxHeight / 2 - 5,
                {
                  width: signatureBoxWidth,
                  align: "center",
                }
              );
          }
        } else {
          // Sin firma
          doc
            .fontSize(9)
            .fillColor("#999999")
            .text(
              "Sin firma",
              signatureBoxX,
              signatureBoxY + signatureBoxHeight / 2 - 5,
              {
                width: signatureBoxWidth,
                align: "center",
              }
            );
        }

        // Resetear color para el siguiente elemento
        doc.fillColor("#000000");

        // Avanzar a la siguiente posición
        currentY += cardHeight + 10;
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
