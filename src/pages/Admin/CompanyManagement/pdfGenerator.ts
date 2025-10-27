import React from 'react';
import { createRoot } from 'react-dom/client';
import StandardsPDFContent from './StandardsPDFContent';

export interface ExportDataItem {
  'Standard Name': string;
  'Parent Question': string;
  'Question': string;
  'Question Type': string;
  'Answer': string;
  'Theme': string;
  'Category': string;
  'Submitted By': string;
  'Department': string;
  'Year': number;
  'Approval Date': string;
  'Company': string;
}

export interface PdfGenerationOptions {
  standardName: string;
  companyName: string;
  exportData: ExportDataItem[];
  exportDataByCategory: { [category: string]: ExportDataItem[] };
  fileName: string;
}

/**
 * Generates a PDF document with categorized data
 */
export const generateStandardsPDF = async (options: PdfGenerationOptions): Promise<void> => {
  const { standardName, companyName, exportData, exportDataByCategory, fileName } = options;

  return new Promise((resolve, reject) => {
    try {
      // Create hidden container for React component
      const tempContainer = createHiddenContainer();
      document.body.appendChild(tempContainer);

      // Render React component
      const root = createRoot(tempContainer);
      const PrintWrapper = () => React.createElement(StandardsPDFContent, {
        standardName,
        companyName,
        exportData,
        exportDataByCategory
      });
      
      root.render(React.createElement(PrintWrapper));

      // Wait for rendering and trigger print
      setTimeout(() => {
        try {
          const content = tempContainer.innerHTML;
          if (!content?.trim()) {
            throw new Error('Failed to render PDF content');
          }

          // Create print container and add styles
          const printContainer = createPrintContainer(content);
          document.body.appendChild(printContainer);
          addPrintStyles();
          
          // Set title and trigger print
          const originalTitle = document.title;
          document.title = fileName;
          window.print();

          // Cleanup after print
          const cleanup = () => {
            document.title = originalTitle;
            cleanupElements([tempContainer, printContainer]);
            root.unmount();
            resolve();
          };

          setupPrintHandlers(cleanup);

        } catch (error) {
          cleanupElements([tempContainer]);
          root.unmount();
          reject(error);
        }
      }, 500);

    } catch (error) {
      reject(error);
    }
  });
};

// Helper functions
const createHiddenContainer = (): HTMLDivElement => {
  const container = document.createElement('div');
  Object.assign(container.style, {
    position: 'absolute',
    left: '-9999px',
    top: '-9999px',
    width: '210mm',
    minHeight: '297mm',
    visibility: 'hidden'
  });
  return container;
};

const createPrintContainer = (content: string): HTMLDivElement => {
  const container = document.createElement('div');
  container.innerHTML = content;
  container.id = 'pdf-print-content';
  Object.assign(container.style, {
    position: 'absolute',
    left: '-9999px',
    top: '-9999px',
    visibility: 'hidden'
  });
  return container;
};

const addPrintStyles = (): void => {
  const styles = document.createElement('style');
  styles.setAttribute('data-print-styles', 'true');
  styles.textContent = `
    @media print {
      @page { size: A4; margin: 0.5in; }
      body { font-family: Arial, sans-serif; font-size: 14px; line-height: 1.4; color: #000; margin: 0; padding: 0; }
      #pdf-print-content { display: block !important; position: static !important; left: auto !important; top: auto !important; visibility: visible !important; width: 100% !important; height: auto !important; }
      .pdf-content { font-family: Arial, sans-serif; font-size: 14px; line-height: 1.4; color: #000; padding: 20px; max-width: 100%; width: 100%; box-sizing: border-box; }
      table { page-break-inside: avoid; border-collapse: collapse; width: 100%; border: none; font-size: 12px; }
      /* Let inline styles take precedence - remove conflicting CSS */
      th, td { border: none !important; }
      table { border: none !important; }
      /* Force background colors to print */
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      /* Remove browser-generated print elements */
      @page { 
        margin: 0.5in; 
        @top-left { content: ""; }
        @top-center { content: ""; }
        @top-right { content: ""; }
        @bottom-left { content: ""; }
        @bottom-center { content: ""; }
        @bottom-right { content: ""; }
      }
      /* Additional rules to hide browser print elements */
      body { margin: 0; padding: 0; }
      html { margin: 0; padding: 0; }
      /* TableDisplay component styling for print */
      .table-display-container table { 
        border: 1px solid #e2e8f0 !important; 
        border-collapse: collapse !important; 
        width: 100% !important; 
        margin: 10px 0 !important;
      }
      .table-display-container td, .table-display-container th { 
        border: 1px solid #e2e8f0 !important; 
        padding: 8px 12px !important; 
        text-align: left !important; 
        vertical-align: top !important;
        background-color: white !important;
        color: black !important;
        font-size: 12px !important;
        font-family: Arial, sans-serif !important;
      }
      .table-display-container tr:nth-child(even) td { 
        background-color: #f8f9fa !important; 
      }
      .table-display-container tr:nth-child(odd) td { 
        background-color: white !important; 
      }
      .table-display-container td[data-header="true"] { 
        background-color: #e3f2fd !important; 
        font-weight: bold !important; 
        color: #1976d2 !important;
      }
      .category-section { margin-bottom: 20px; }
      .no-print { display: none !important; }
      body > *:not(#pdf-print-content) { display: none !important; }
    }
  `;
  document.head.appendChild(styles);
};

const cleanupElements = (elements: HTMLElement[]): void => {
  elements.forEach(element => {
    if (document.body.contains(element)) {
      document.body.removeChild(element);
    }
  });
  // Remove ONLY the print styles we added (not the first style element)
  const printStyles = document.querySelector('style[data-print-styles="true"]');
  if (printStyles && document.head.contains(printStyles)) {
    document.head.removeChild(printStyles);
  }
};

const setupPrintHandlers = (cleanup: () => void): void => {
  const handleAfterPrint = () => {
    cleanup();
    window.removeEventListener('afterprint', handleAfterPrint);
  };

  window.addEventListener('afterprint', handleAfterPrint);
  
  // Fallback cleanup
  setTimeout(() => {
    cleanup();
    window.removeEventListener('afterprint', handleAfterPrint);
  }, 5000);
};