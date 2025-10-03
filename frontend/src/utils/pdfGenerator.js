import jsPDF from 'jspdf'

const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const capitalizeArray = (arr) => {
  if (!Array.isArray(arr)) return capitalize(arr)
  return arr.map((item) => capitalize(item)).join(', ')
}

export const generateVisitPDF = async (visitData, tenantData) => {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  let currentY = margin

  // Logo del tenant (si existe)
  if (tenantData.theme?.logoUrl) {
    try {
      const logoImg = await loadImage(tenantData.theme.logoUrl)
      doc.addImage(logoImg, 'PNG', margin, currentY, 30, 30)
      currentY += 35
    } catch (error) {
      console.warn('Error cargando logo:', error)
    }
  }

  // Título
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(tenantData.name || 'Registro de Visita', pageWidth / 2, currentY, { align: 'center' })
  currentY += 10

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Instrucciones generales de acceso a las instalaciones', pageWidth / 2, currentY, {
    align: 'center',
  })
  currentY += 15

  // Línea separadora
  doc.setDrawColor(200)
  doc.line(margin, currentY, pageWidth - margin, currentY)
  currentY += 10

  // Normativas aceptadas
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Normativa leída:', margin, currentY)
  currentY += 7

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  const normativas = ['NORMAS DE BIOSEGURIDAD', 'NORMATIVA PRL', 'NORMATIVA LOPD']
  normativas.forEach((norm) => {
    doc.text(`• ${norm}`, margin + 5, currentY)
    currentY += 6
  })
  currentY += 5

  // Datos de la visita
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Datos de la visita:', margin, currentY)
  currentY += 10

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')

  const addField = (label, value) => {
    if (!value) return
    doc.setFont('helvetica', 'bold')
    doc.text(label + ':', margin, currentY)
    doc.setFont('helvetica', 'normal')
    doc.text(value, margin + 50, currentY)
    currentY += 7
  }

  addField('Nombre y apellidos', visitData.name)
  addField('Empresa', visitData.company)
  addField('Motivo', capitalizeArray(visitData.purpose))
  addField('Zona de acceso', capitalizeArray(visitData.accessZone))
  if (visitData.plate) addField('Matrícula', visitData.plate)
  addField('Responsable', visitData.workerName || visitData.worker)
  addField('Fecha', new Date().toLocaleString('es-ES'))

  currentY += 5

  // Declaración
  doc.setFontSize(10)
  doc.setFont('helvetica', 'italic')
  const declaration = 'Manifiesto que he leído, comprendo y acepto las normativas mencionadas'
  doc.text(declaration, margin, currentY, { maxWidth: pageWidth - 2 * margin })
  currentY += 15

  // Firma
  if (visitData.signature) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Firma:', margin, currentY)
    currentY += 5

    try {
      const signatureImg = visitData.signature
      doc.addImage(signatureImg, 'PNG', margin, currentY, 60, 30)
      currentY += 35
    } catch (error) {
      console.error('Error añadiendo firma:', error)
    }

    // Línea para firma
    doc.setDrawColor(0)
    doc.line(margin, currentY, margin + 60, currentY)
    currentY += 5
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(visitData.name || '', margin, currentY)
  }

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(150)
  doc.text(
    `Documento generado el ${new Date().toLocaleString('es-ES')}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' },
  )

  return doc
}

// Función auxiliar para cargar imágenes
const loadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

// Generar y descargar PDF
export const downloadVisitPDF = async (visitData, tenantData, filename) => {
  const doc = await generateVisitPDF(visitData, tenantData)
  doc.save(filename || `visita_${Date.now()}.pdf`)
}

// Generar y obtener blob (para subir a servidor)
export const getVisitPDFBlob = async (visitData, tenantData) => {
  const doc = await generateVisitPDF(visitData, tenantData)
  return doc.output('blob')
}
