import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

const LabelUploader = () => {
  const [labels, setLabels] = useState([]);
  const [labelSize, setLabelSize] = useState({ width: 100, height: 50 });
  const [sizeUnit, setSizeUnit] = useState('px'); // Default is pixels

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const labelsData = XLSX.utils.sheet_to_json(sheet);
      setLabels(labelsData);
    };

    reader.readAsArrayBuffer(file);
  };

  const convertToPixels = (size, unit) => {
    if (unit === 'cm') {
      return size * 37.7953; // Convert cm to pixels
    } else if (unit === 'mm') {
      return size * 3.77953; // Convert mm to pixels
    } else {
      return size; // Pixels remain the same
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    labels.forEach((label, index) => {
      doc.text(`Label ${index + 1}:`, 10, 10 + (index * 10));
      Object.keys(label).forEach((key, idx) => {
        doc.text(`${key}: ${label[key]}`, 10, 20 + (index * 20) + (idx * 10));
      });
    });
    doc.save('labels.pdf');
  };

  return (
    <div>
      <h2>Label Printing System</h2>
      <input type="file" accept=".xlsx" onChange={handleFileUpload} />

      <div>
        <h3>Set Label Size</h3>
        <label>
          Width: 
          <input
            type="number"
            value={labelSize.width}
            onChange={(e) => setLabelSize({ ...labelSize, width: e.target.value })}
          />
        </label>
        <label>
          Height: 
          <input
            type="number"
            value={labelSize.height}
            onChange={(e) => setLabelSize({ ...labelSize, height: e.target.value })}
          />
        </label>
        <label>
          Unit:
          <select value={sizeUnit} onChange={(e) => setSizeUnit(e.target.value)}>
            <option value="px">Pixels (px)</option>
            <option value="cm">Centimeters (cm)</option>
            <option value="mm">Millimeters (mm)</option>
          </select>
        </label>
      </div>

      {labels.length > 0 && (
        <div>
          <h3>Labels Preview</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {labels.map((label, index) => (
              <div
                key={index}
                style={{
                  width: `${convertToPixels(labelSize.width, sizeUnit)}px`,
                  height: `${convertToPixels(labelSize.height, sizeUnit)}px`,
                  border: '1px solid black',
                  margin: '5px',
                  padding: '5px'
                }}
              >
                {Object.keys(label).map((key) => (
                  <p key={key}>
                    <strong>{key}:</strong> {label[key]}
                  </p>
                ))}
              </div>
            ))}
          </div>
          <button onClick={handlePrint}>Print Labels</button>
          <button onClick={exportToPDF}>Export to PDF</button>
        </div>
      )}
    </div>
  );
};

export default LabelUploader;
