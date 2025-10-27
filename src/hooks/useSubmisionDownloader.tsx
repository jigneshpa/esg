import { useState } from 'react';
import Papa from 'papaparse';

export const useSubmisionDownloader = () => {
  const [csvData, setCsvData] = useState('');

  const generateCsv = (submissionAnswers: any[]) => {
    const parsedData = submissionAnswers?.map(answer => {
      let selectedOption;

      switch (answer.type) {
        case 'textBox':
          selectedOption = answer?.content;
          break;
        case 'checkbox':
          // eslint-disable-next-line no-case-declarations
          const checkboxOptions = JSON.parse(answer?.content)?.checkboxOptions;
          selectedOption = checkboxOptions
            .filter((opt: { isChecked: any }) => opt?.isChecked)
            .map((opt: { text: any }) => opt?.text)
            .join('; ');
          break;
        case 'dropDown':
          selectedOption = answer?.answer;
          break;
        case 'radio':
          // eslint-disable-next-line no-case-declarations
          const radioOptions = JSON.parse(answer?.content)?.radioOptions;
          selectedOption = radioOptions?.find((opt: { isChecked: any }) => opt?.isChecked)?.text || 'None';
          break;
        case 'table':
          // eslint-disable-next-line no-case-declarations
          const tableOptions = JSON.parse(answer?.content)?.tableOptions;
          // Handle new table structure format
          if (tableOptions?.cells && Array.isArray(tableOptions.cells)) {
            // New format: cells array with rowIndex, colIndex, content
            const tableData: string[][] = [];

            // Initialize empty table
            for (let i = 0; i < tableOptions.rows; i++) {
              tableData[i] = [];
              for (let j = 0; j < tableOptions.cols; j++) {
                tableData[i][j] = '';
              }
            }

            // Fill in the cells with content
            tableOptions.cells.forEach((cell: any) => {
              if (cell.rowIndex !== undefined && cell.colIndex !== undefined) {
                tableData[cell.rowIndex][cell.colIndex] = cell.content || '';
              }
            });

            selectedOption = tableData.map(row => row.join(' | ')).join('; ');
          } else if (tableOptions?.rows && Array.isArray(tableOptions.rows)) {
            // Old format: rows array with cols
            selectedOption = tableOptions.rows.map((row: { cols: any[] }) => row?.cols?.join(' | '))?.join('; ');
          } else {
            selectedOption = 'N/A';
          }
          break;
        default:
          selectedOption = 'N/A';
      }

      // Build the answer string with all relevant information
      const answerParts = [];

      // Add the main answer
      if (selectedOption && selectedOption !== 'N/A') {
        answerParts.push(`${selectedOption}`);
      }

      // Add institution information
      if (answer?.institutionsName?.length > 0) {
        answerParts.push(`Institution: ${answer.institutionsName.join('; ')}`);
      }

      // Add framework information
      if (answer?.frameworksNames?.length > 0) {
        answerParts.push(`Framework: ${answer.frameworksNames.join('; ')}`);
      }

      // Add industry information
      if (answer?.industriesName?.length > 0) {
        answerParts.push(`Industry: ${answer.industriesName.join('; ')}`);
      }

      return {
        Question: answer.title,
        Answer: answerParts.join(' | ')
      };
    });

    const csv = Papa.unparse(parsedData, {
      quotes: true,
      skipEmptyLines: true
    });
    setCsvData(csv);
  };

  const downloadCsv = (filename = 'report.csv') => {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return { generateCsv, downloadCsv };
};
