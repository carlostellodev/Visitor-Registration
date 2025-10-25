import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";

import { loadImageFromUrl } from "./imageLoader.js";

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const generateExcel = async (visitors, tenantName) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Visitantes");

  // Configurar columnas
  worksheet.columns = [
    { header: "Fecha", key: "date", width: 12 },
    { header: "Hora", key: "time", width: 10 },
    { header: "Nombre", key: "name", width: 25 },
    { header: "Empresa", key: "company", width: 25 },
    { header: "Matrícula", key: "plate", width: 12 },
    { header: "Motivo", key: "purpose", width: 20 },
    { header: "Zona de acceso", key: "accessZone", width: 20 },
    { header: "Responsable", key: "worker", width: 25 },
  ];

  // Estilos del header
  worksheet.getRow(1).font = { bold: true, size: 12 };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4472C4" },
  };
  worksheet.getRow(1).font = { color: { argb: "FFFFFFFF" }, bold: true };
  worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };
  worksheet.getRow(1).height = 25;

  // Añadir datos
  visitors.forEach((visitor) => {
    const date = new Date(visitor.createdAt);

    worksheet.addRow({
      date: date.toLocaleDateString("es-ES"),
      time: date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      name: visitor.name,
      company: visitor.company,
      plate: visitor.plate || "-",
      purpose: Array.isArray(visitor.purpose)
        ? visitor.purpose.map((p) => capitalize(p)).join(", ")
        : capitalize(visitor.purpose),
      accessZone: Array.isArray(visitor.accessZone)
        ? visitor.accessZone.map((z) => capitalize(z)).join(", ")
        : capitalize(visitor.accessZone),
      worker: visitor.workerId?.name || "-",
    });
  });

  // Aplicar bordes y estilos a todas las celdas
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };

      if (rowNumber > 1) {
        cell.alignment = { vertical: "middle", horizontal: "left" };
      }
    });
  });

  // Añadir filtros
  worksheet.autoFilter = {
    from: "A1",
    to: "H1",
  };

  // Añadir título
  worksheet.insertRow(1, [`Reporte de Visitantes - ${tenantName}`]);
  worksheet.mergeCells("A1:H1");
  worksheet.getCell("A1").font = { size: 16, bold: true };
  worksheet.getCell("A1").alignment = {
    vertical: "middle",
    horizontal: "center",
  };
  worksheet.getRow(1).height = 30;

  // Añadir información de exportación
  const totalRow = worksheet.addRow([]);
  totalRow.getCell(1).value = `Total de visitantes: ${visitors.length}`;
  totalRow.getCell(1).font = { bold: true };
  totalRow.height = 25;

  const dateRow = worksheet.addRow([]);
  dateRow.getCell(1).value = `Fecha de exportación: ${new Date().toLocaleString(
    "es-ES"
  )}`;
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

      // Header con logo (si existe)
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
        const date = new Date(visitor.createdAt);

        // Altura de cada tarjeta (aumentada para incluir la firma)
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
          `Fecha: ${date.toLocaleDateString(
            "es-ES"
          )} - ${date.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          })}`,
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

        // Dibujar el borde del contenedor de firma
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
            // La firma ya está en base64, extraer el buffer
            const base64Data = visitor.signature.replace(
              /^data:image\/\w+;base64,/,
              ""
            );
            const signatureBuffer = Buffer.from(base64Data, "base64");

            // Ajustar la imagen de la firma para que ocupe todo el contenedor
            // Dejamos un pequeño margen de 3px en cada lado
            const imageMargin = 3;
            const imageX = signatureBoxX + imageMargin;
            const imageY = signatureBoxY + imageMargin;
            const imageWidth = signatureBoxWidth - imageMargin * 2;
            const imageHeight = signatureBoxHeight - imageMargin * 2;

            // Insertar la imagen de la firma ocupando todo el espacio disponible
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
          // Sin firma - mostrar texto centrado vertical y horizontalmente
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
