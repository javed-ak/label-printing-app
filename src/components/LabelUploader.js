import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import './LabelUploader.css';

const LabelUploader = () => {
  const [labels, setLabels] = useState([]);
  const [labelSize, setLabelSize] = useState({ width: 100, height: 50 });
  const [sizeUnit, setSizeUnit] = useState('mm');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [columnsPerPage, setColumnsPerPage] = useState(4);
  
  // A4 paper size in pixels
  const A4_WIDTH_PX = 2480; // 210 mm
  const A4_HEIGHT_PX = 3508; // 297 mm

  // Customization state
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState(14);
  const [textColor, setTextColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [borderColor, setBorderColor] = useState('#000000');
  const [borderWidth, setBorderWidth] = useState(1);
  
  // Gap customization state
  const [horizontalGap, setHorizontalGap] = useState(0);
  const [verticalGap, setVerticalGap] = useState(0);

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

  const exportToPDF = () => {
    const doc = new jsPDF({
      unit: 'px',
      format: [A4_WIDTH_PX, A4_HEIGHT_PX],
    });

    let currentY = 20; // Starting Y position
    labels.forEach((label, index) => {
      const labelText = `Label ${index + 1}:`;
      doc.text(labelText, 10, currentY);
      Object.keys(label).forEach((key, idx) => {
        const labelContent = `${key}: ${label[key]}`;
        doc.text(labelContent, 10, currentY + (idx * 10) + 10);
      });
      currentY += 100; // Move Y position for the next label

      // Add a new page if currentY exceeds A4 height
      if (currentY > A4_HEIGHT_PX - 100) {
        doc.addPage();
        currentY = 20; // Reset Y position for the new page
      }
    });

    doc.save('labels-a4.pdf');
  };

  return (
    <div>
      <h2>Label Printing System (A4 Size Paper)</h2>
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
        <label>
          Rows per Page:
          <input
            type="number"
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(e.target.value)}
          />
        </label>
        <label>
          Columns per Page:
          <input
            type="number"
            value={columnsPerPage}
            onChange={(e) => setColumnsPerPage(e.target.value)}
          />
        </label>
      </div>

      <div>
        <h3>Customize Labels</h3>
        <label>
          Font Family:
          <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
            <option value="Arial">Arial</option>
            <option value="Courier New">Courier New</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Verdana">Verdana</option>
          </select>
        </label>
        <label>
          Font Size:
          <input
            type="number"
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
          />
        </label>
        <label>
          Text Color:
          <input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
          />
        </label>
        <label>
          Background Color:
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
          />
        </label>
        <label>
          Border Color:
          <input
            type="color"
            value={borderColor}
            onChange={(e) => setBorderColor(e.target.value)}
          />
        </label>
        <label>
          Border Width (px):
          <input
            type="number"
            value={borderWidth}
            onChange={(e) => setBorderWidth(e.target.value)}
          />
        </label>
      </div>

      <div>
        <h3>Set Label Gaps</h3>
        <label>
          Horizontal Gap (px):
          <input
            type="number"
            value={horizontalGap}
            onChange={(e) => setHorizontalGap(e.target.value)}
          />
        </label>
        <label>
          Vertical Gap (px):
          <input
            type="number"
            value={verticalGap}
            onChange={(e) => setVerticalGap(e.target.value)}
          />
        </label>
      </div>

      {labels.length > 0 && (
        <div>
          <h3>Labels Preview (A4 Paper Layout)</h3>
          <div
            id="printArea"
            style={{
              width: '210mm', // A4 width
              height: '297mm', // A4 height
              display: 'grid',
              gridTemplateColumns: `repeat(${columnsPerPage}, 1fr)`,
              gridTemplateRows: `repeat(${rowsPerPage}, 1fr)`,
              gap: `${verticalGap}px ${horizontalGap}px`, // Apply gaps
              border: '1px solid #000',
              padding: '10px',
              margin: '20px 0',
              justifyItems: 'center', // Center align items horizontally
              alignItems: 'center', // Center align items vertically
            }}
          >
            {labels.map((label, index) => (
              <div
                key={index}
                style={{
                  width: `${convertToPixels(labelSize.width, sizeUnit)}px`,
                  height: `${convertToPixels(labelSize.height, sizeUnit)}px`,
                  border: `${borderWidth}px solid ${borderColor}`,
                  backgroundColor: bgColor,
                  color: textColor,
                  fontFamily: fontFamily,
                  fontSize: `${fontSize}px`,
                  margin: '5px',
                  padding: '5px',
                  overflow: 'hidden',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'column',
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
          <button onClick={() => window.print()}>Print Labels</button>
          <button onClick={exportToPDF}>Export to PDF</button>
        </div>
      )}
    </div>
  );
};

export default LabelUploader;
