const PDFDocument = require('pdfkit');

const PdfExportService = {
  /**
   * Generate a PDF report from data
   * @param {string} title - Report title
   * @param {Array<string>} columns - Column headers
   * @param {Array<object>} data - Row data
   * @param {import('http').ServerResponse} res - Express response (piped to)
   */
  generateReport: (title, columns, data, res) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s/g, '_')}.pdf"`);

    doc.pipe(res);

    // Title
    doc.fontSize(18).font('Helvetica-Bold').text(title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toISOString().slice(0, 10)}`, { align: 'center' });
    doc.moveDown(2);

    // Table header
    const colWidth = (doc.page.width - 80) / columns.length;
    let x = 40;
    const y = doc.y;

    doc.font('Helvetica-Bold').fontSize(9);
    columns.forEach((col) => {
      doc.text(col, x, y, { width: colWidth, align: 'left' });
      x += colWidth;
    });
    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke();
    doc.moveDown(0.5);

    // Table rows
    doc.font('Helvetica').fontSize(8);
    data.forEach((row) => {
      if (doc.y > doc.page.height - 60) {
        doc.addPage();
      }
      x = 40;
      const rowY = doc.y;
      columns.forEach((col) => {
        const key = col.toLowerCase().replace(/\s/g, '_');
        const val = row[key] !== undefined ? String(row[key]) : '';
        doc.text(val, x, rowY, { width: colWidth, align: 'left' });
        x += colWidth;
      });
      doc.moveDown(0.8);
    });

    doc.end();
  },
};

module.exports = PdfExportService;
