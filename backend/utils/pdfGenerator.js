const PDFDocument = require('pdfkit');

/**
 * Generates a PDF prescription and streams it to the response
 * @param {Object} prescription - Prescription details from database (populated)
 * @param {Object} res - Express response stream
 */
const generatePrescriptionPDF = (prescription, res) => {
  const doc = new PDFDocument({ margin: 50 });

  // Stream PDF to Express response
  doc.pipe(res);

  // Colors
  const primaryColor = '#0f766e'; // Teal 700
  const textColor = '#1f2937'; // Gray 800
  const secondaryColor = '#4b5563'; // Gray 600
  const dividerColor = '#e5e7eb'; // Gray 200

  // 1. Header (Clinic / Hospital details)
  doc
    .fillColor(primaryColor)
    .fontSize(24)
    .font('Helvetica-Bold')
    .text('SMART HEALTHCARE CLINIC', { align: 'center' });
  doc
    .fillColor(secondaryColor)
    .fontSize(10)
    .font('Helvetica')
    .text('AI-Powered Diagnosis & Smart Management Portal', { align: 'center' });
  doc.text('Phone: +1 (555) 019-2834 | Email: contact@smarthealth.com', { align: 'center' });
  
  doc.moveDown(1.5);

  // Divider Line
  doc
    .strokeColor(dividerColor)
    .lineWidth(2)
    .moveTo(50, doc.y)
    .lineTo(562, doc.y)
    .stroke();

  doc.moveDown(1);

  // 2. Doctor & Patient Info Columns
  const initialY = doc.y;
  
  // Left Column - Doctor
  doc
    .fillColor(primaryColor)
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('DOCTOR:', 50, initialY);
  
  doc
    .fillColor(textColor)
    .fontSize(11)
    .font('Helvetica')
    .text(`Dr. ${prescription.doctor.user ? prescription.doctor.user.name : 'Medical Specialist'}`)
    .text(`Specialization: ${prescription.doctor.specialization || 'General'}`)
    .text(`Experience: ${prescription.doctor.experience || 0} Years`);

  // Right Column - Patient
  doc
    .fillColor(primaryColor)
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('PATIENT:', 320, initialY);
  
  const patientUser = prescription.patient.user || {};
  doc
    .fillColor(textColor)
    .fontSize(11)
    .font('Helvetica')
    .text(`Name: ${patientUser.name || 'Patient'}`)
    .text(`Age: ${prescription.patient.age || 'N/A'} | Gender: ${prescription.patient.gender || 'N/A'}`)
    .text(`Blood Group: ${prescription.patient.bloodGroup || 'N/A'}`);

  doc.moveDown(2);

  // Date and Prescription ID
  const infoY = doc.y;
  doc
    .fillColor(secondaryColor)
    .fontSize(9)
    .text(`Prescription Date: ${new Date(prescription.createdAt).toLocaleDateString()}`, 50, infoY)
    .text(`Appointment Ref ID: ${prescription.appointment._id || prescription.appointment}`, 320, infoY);

  doc.moveDown(1.5);

  // Divider Line
  doc
    .strokeColor(dividerColor)
    .lineWidth(1)
    .moveTo(50, doc.y)
    .lineTo(562, doc.y)
    .stroke();

  doc.moveDown(1.5);

  // 3. Rx Symbol
  doc
    .fillColor(primaryColor)
    .fontSize(22)
    .font('Helvetica-Bold')
    .text('Rx', 50, doc.y);

  doc.moveDown(0.5);

  // 4. Medicines Table Header
  const tableY = doc.y;
  doc
    .fillColor(secondaryColor)
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('Medicine Name', 50, tableY)
    .text('Dosage', 220, tableY)
    .text('Frequency', 340, tableY)
    .text('Duration', 460, tableY);

  doc.moveDown(0.5);
  doc
    .strokeColor(dividerColor)
    .lineWidth(1)
    .moveTo(50, doc.y)
    .lineTo(562, doc.y)
    .stroke();
  doc.moveDown(0.5);

  // 5. Medicines List
  doc.font('Helvetica').fontSize(10).fillColor(textColor);
  
  prescription.medicines.forEach((med) => {
    const medY = doc.y;
    doc
      .text(med.name, 50, medY, { width: 160 })
      .text(med.dosage, 220, medY)
      .text(med.frequency, 340, medY)
      .text(med.duration, 460, medY);
    doc.moveDown(1);
  });

  doc.moveDown(1);

  // 6. Notes / Instructions
  if (prescription.notes) {
    doc
      .fillColor(primaryColor)
      .font('Helvetica-Bold')
      .fontSize(12)
      .text('Notes / Instructions:', 50, doc.y);
    doc.moveDown(0.3);
    doc
      .fillColor(textColor)
      .font('Helvetica')
      .fontSize(10)
      .text(prescription.notes, { width: 512 });
  }

  doc.moveDown(3);

  // 7. Footer
  const pageHeight = doc.page.height;
  doc
    .strokeColor(dividerColor)
    .lineWidth(1)
    .moveTo(50, pageHeight - 100)
    .lineTo(562, pageHeight - 100)
    .stroke();

  doc
    .fillColor(secondaryColor)
    .fontSize(9)
    .font('Helvetica-Oblique')
    .text('This is a computer-generated prescription signed electronically.', 50, pageHeight - 85, { align: 'center' })
    .text('Please consult your primary healthcare provider before making major medical changes.', { align: 'center' });

  // Finalize PDF file
  doc.end();
};

module.exports = { generatePrescriptionPDF };
