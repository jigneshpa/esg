import React from 'react';
import { ExportDataItem } from './pdfGenerator';
import { TableDisplay } from '@/pages/Admin/Questionnaire/view-question-bank/components/QuestionnairePDFPreview';

interface StandardsPDFContentProps {
  standardName: string;
  companyName: string;
  exportData: ExportDataItem[];
  exportDataByCategory: { [category: string]: ExportDataItem[] };
}

const StandardsPDFContent: React.FC<StandardsPDFContentProps> = ({
  standardName,
  companyName,
  exportData,
  exportDataByCategory
}) => {
  const renderSafeContent = (content: any): string => {
    if (content === null || content === undefined || content === '' || typeof content === 'object') return 'N/A';
    if (typeof content === 'number') return String(content);
    return String(content);
  };

  const renderTableQuestions = (data: ExportDataItem[]) => {
    const tableQuestions = data.filter(item => item['Question Type'] === 'table');
    
    if (tableQuestions.length === 0) return null;

    return (
      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        {tableQuestions.map((item, index) => (
          <div key={index} style={{ marginBottom: '15px', pageBreakInside: 'avoid' }}>
            <h4 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
              {item['Question']}
            </h4>
            {item['Answer'] && typeof item['Answer'] === 'object' && (
              <div className="table-display-container">
                <TableDisplay tableStructure={item['Answer']} />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const TableRow = ({ item, index }: { item: ExportDataItem; index: number }) => {
    if (item['Question Type'] === 'table') return null;
    return (
    <tr style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#ffffff', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
      <td style={{ border: 'none', padding: '10px 12px', wordBreak: 'break-word', backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#ffffff', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>{renderSafeContent(item['Parent Question'])}</td>
      <td style={{ border: 'none', padding: '10px 12px', wordBreak: 'break-word', backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#ffffff', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>{renderSafeContent(item['Question'])}</td>
      <td style={{ border: 'none', padding: '10px 12px', wordBreak: 'break-word', backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#ffffff', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>{renderSafeContent(item['Answer'])}</td>
      <td style={{ border: 'none', padding: '10px 12px', wordBreak: 'break-word', backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#ffffff', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>{renderSafeContent(item['Theme'])}</td>
      <td style={{ border: 'none', padding: '10px 12px', wordBreak: 'break-word', backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#ffffff', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>{renderSafeContent(item['Submitted By'])}</td>
      <td style={{ border: 'none', padding: '10px 12px', wordBreak: 'break-word', backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#ffffff', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>{renderSafeContent(item['Year'])}</td>
    </tr>
  )};

  const DataTable = ({ data, headerClass }: { data: ExportDataItem[]; headerClass: string }) => {
    const nonTableData = data.filter(item => item['Question Type'] !== 'table');
    
    return (
      <>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '12px' }}>
          <thead>
            <tr>
              <th style={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold', border: 'none', padding: '10px 12px', textAlign: 'left', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>Parent Question</th>
              <th style={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold', border: 'none', padding: '10px 12px', textAlign: 'left', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>Question</th>
              <th style={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold', border: 'none', padding: '10px 12px', textAlign: 'left', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>Answer</th>
              <th style={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold', border: 'none', padding: '10px 12px', textAlign: 'left', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>Theme</th>
              <th style={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold', border: 'none', padding: '10px 12px', textAlign: 'left', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>Submitted By</th>
              <th style={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold', border: 'none', padding: '10px 12px', textAlign: 'left', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>Year</th>
            </tr>
          </thead>
          <tbody>
            {nonTableData.map((item, index) => <TableRow key={index} item={item} index={index} />)}
          </tbody>
        </table>
        {renderTableQuestions(data)}
      </>
    );
  };

  return (
    <>
      <style>
        {`
          @media print {
            @page { size: A4; margin: 0.5in; }
            body { font-family: Arial, sans-serif; font-size: 14px; line-height: 1.4; color: #000; margin: 0; padding: 0; }
            .pdf-content { font-family: Arial, sans-serif; font-size: 14px; line-height: 1.4; color: #000; padding: 20px; max-width: 100%; width: 100%; box-sizing: border-box; }
            table { page-break-inside: avoid; border-collapse: collapse; width: 100%; font-size: 12px; }
            .category-section { margin-bottom: 20px; }
            .category-header { font-size: 14px; font-weight: bold; color: #004da0; margin: 0 0 10px 0; border-bottom: 2px solid #004da0; padding-bottom: 5px; }
            .uncategorized-header { font-size: 14px; font-weight: bold; color: #808080; margin: 0 0 10px 0; border-bottom: 2px solid #808080; padding-bottom: 5px; }
            /* Remove all conflicting table styles to let inline styles work */
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
          }
        `}
      </style>
      <div className="pdf-content" style={{ 
        fontFamily: 'Arial, sans-serif', fontSize: '14px', lineHeight: '1.4', color: '#000', 
        padding: '20px', maxWidth: '100%', width: '100%', boxSizing: 'border-box' 
      }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 10px 0', color: '#000', fontFamily: 'Arial, sans-serif' }}>
            {standardName} - Approved Standards
          </h1>
          <p style={{ fontSize: '14px', margin: '0 0 5px 0', color: '#000', fontFamily: 'Arial, sans-serif' }}>
            Company: {companyName}
          </p>
          <p style={{ fontSize: '14px', margin: '0 0 20px 0', color: '#000', fontFamily: 'Arial, sans-serif' }}>
            Generated on: {new Date().toLocaleDateString()}
          </p>
        </div>


        {/* Categorized Questions */}
        {Object.keys(exportDataByCategory || {})
          .filter(categoryName => categoryName !== 'Uncategorized')
          .sort()
          .map(categoryName => {
            const categoryData = exportDataByCategory[categoryName];
            if (!categoryData || categoryData.length === 0) return null;

            return (
              <div key={categoryName} className="category-section" style={{ marginBottom: '30px' }}>
                <h2 className="category-header">Category: {categoryName}</h2>
                <DataTable data={categoryData} headerClass="table-header" />
              </div>
            );
          })}

        {/* Uncategorized Questions */}
        {exportDataByCategory?.['Uncategorized'] && exportDataByCategory['Uncategorized'].length > 0 && (
          <div className="category-section" style={{ marginBottom: '30px' }}>
            <h2 className="uncategorized-header">Uncategorized Questions</h2>
            <DataTable data={exportDataByCategory['Uncategorized']} headerClass="uncategorized-table-header" />
          </div>
        )}

        {/* Footer */}
        <div style={{ position: 'fixed', bottom: '10px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', color: '#2E8B57', textAlign: 'center' }}>
          Powered by Greenfi
        </div>
      </div>
    </>
  );
};

export default StandardsPDFContent;