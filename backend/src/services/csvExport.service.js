const { Parser } = require('json2csv');

const CsvExportService = {
  /**
   * Convert an array of objects to CSV string
   * @param {Array<object>} data
   * @param {Array<string>} [fields] - Column names (auto-detected if omitted)
   * @returns {string} CSV string
   */
  toCSV: (data, fields) => {
    if (!data || data.length === 0) {
      return '';
    }

    const opts = fields ? { fields } : {};
    const parser = new Parser(opts);
    return parser.parse(data);
  },
};

module.exports = CsvExportService;
