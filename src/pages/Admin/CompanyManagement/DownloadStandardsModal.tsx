import { FC, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Spinner,
  Text,
  useToast,
  VStack
} from '@chakra-ui/react';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType } from 'docx';
import Papa from 'papaparse';

import { ChevronDownIcon } from '@chakra-ui/icons';

import { questionnaireApi } from '../../../store/api/questionnaire/questionnaireApi';
import { generateStandardsPDF, type ExportDataItem } from './pdfGenerator';

interface DownloadStandardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  standard: any;
  companyName: string;
  allCompanyIds?: number[];
  allCompanies?: any[];
  isParentCompany?: boolean;
  // New prop to indicate if we have question bank data with categories
  hasQuestionBankData?: boolean;
}

const DownloadStandardsModal: FC<DownloadStandardsModalProps> = ({
  isOpen,
  onClose,
  standard,
  companyName,
  allCompanyIds = [],
  allCompanies = [],
  isParentCompany = false,
  hasQuestionBankData = false
}) => {
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]); // New state for categories
  const [selectedSubmittedBy, setSelectedSubmittedBy] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [fileFormat, setFileFormat] = useState<'pdf' | 'docx' | 'csv'>('pdf');
  const [isDownloading, setIsDownloading] = useState(false);

  const [questionBankData, setQuestionBankData] = useState<any>(null);
  const [enhancedStandard, setEnhancedStandard] = useState<any>(null);
  const toast = useToast();

  // Use RTK Query hook to fetch question bank data immediately when standard is available
  const { data: questionBankResponse, isLoading: isLoadingQuestionBankData } =
    questionnaireApi.useGetQuestionBankListByIdQuery(
      {
        bankId: standard?.id || 0,
        page: 1,
        max_results: 1000
      },
      { skip: !standard?.id }
    );

  // Function to fetch question bank data and match questions
  const fetchQuestionBankData = async (standardId: number) => {
    if (!standardId) return;

    try {
      // Loading is handled by RTK Query hook

      // The data is already fetched by the hook above
      if (questionBankResponse?.data) {
        setQuestionBankData(questionBankResponse.data);

        // Enhance the standard data with question bank information
        if (questionBankResponse.data?.questions && standard?.submissions) {
          const enhancedSubmissions = standard.submissions.map((submission: any) => {
            if (submission.answer) {
              try {
                const parsedAnswer = JSON.parse(submission.answer);
                if (Array.isArray(parsedAnswer)) {
                  const enhancedAnswer = parsedAnswer.map((answerItem: any) => {
                    // Try to find matching question in question bank
                    let matchedQuestion = null;

                    // First try to match by questionId if available
                    if (submission.questionId) {
                      matchedQuestion = questionBankResponse.data.questions.find(
                        (q: any) => q.id === submission.questionId
                      );
                    }

                    // If no match by ID, try to match by title
                    if (!matchedQuestion && answerItem.title) {
                      matchedQuestion = questionBankResponse.data.questions.find(
                        (q: any) => q.title && q.title.toLowerCase() === answerItem.title.toLowerCase()
                      );
                    }

                    // If still no match, try partial title matching
                    if (!matchedQuestion && answerItem.title) {
                      matchedQuestion = questionBankResponse.data.questions.find(
                        (q: any) =>
                          q.title &&
                          (q.title.toLowerCase().includes(answerItem.title.toLowerCase()) ||
                            answerItem.title.toLowerCase().includes(q.title.toLowerCase()))
                      );
                    }

                    return {
                      ...answerItem,
                      matchedQuestion,
                      category: matchedQuestion?.category || null,
                      theme: matchedQuestion?.theme || answerItem.theme
                    };
                  });

                  return {
                    ...submission,
                    answer: JSON.stringify(enhancedAnswer),
                    enhancedAnswer
                  };
                }
              } catch (e) {
                console.error('Error parsing submission answer:', e);
              }
            }
            return submission;
          });

          setEnhancedStandard({
            ...standard,
            submissions: enhancedSubmissions,
            questions: questionBankResponse.data.questions
          });
        }
      }
    } catch (error) {
      console.error('Error fetching question bank data:', error);
      toast({
        title: 'Warning',
        description: 'Could not fetch question bank data. Categories may not be available.',
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
      // Fall back to original standard data
      setEnhancedStandard(standard);
    } finally {
      // Loading is handled by RTK Query hook
    }
  };

  // Fetch question bank data when modal opens
  useEffect(() => {
    if (standard?.id && questionBankResponse?.data) {
      // Process the data immediately when it's available, regardless of modal state
      fetchQuestionBankData(standard.id);
    }
  }, [standard?.id, questionBankResponse?.data]);

  // Use enhanced standard data if available, otherwise fall back to original
  const workingStandard = enhancedStandard || standard;

  // Extract unique values from the standard data
  const uniqueYears = useMemo(() => {
    if (!workingStandard?.submissions || !Array.isArray(workingStandard.submissions)) {
      return [new Date().getFullYear().toString()];
    }

    const years = workingStandard.submissions.map((sub: any) => sub.reportingAnswerYear?.toString());
    const filteredYears = years.filter(Boolean);

    // If no years found, use current year as fallback
    if (filteredYears.length === 0) {
      const currentYear = new Date().getFullYear().toString();
      return [currentYear];
    }

    const uniqueYearsArray = [...new Set(filteredYears)].sort((a: unknown, b: unknown) =>
      (b as string).localeCompare(a as string)
    );
    return uniqueYearsArray;
  }, [workingStandard]);

  const uniqueThemes = useMemo(() => {
    if (!workingStandard?.submissions || !Array.isArray(workingStandard.submissions)) {
      return ['General'];
    }
    const themes = new Set<string>();

    workingStandard.submissions.forEach((sub: any) => {
      if (sub.answer) {
        try {
          const parsedAnswer = JSON.parse(sub.answer);
          if (Array.isArray(parsedAnswer)) {
            parsedAnswer.forEach((item: any) => {
              // Use enhanced theme if available, otherwise fall back to original
              const themeLabel = item.theme || item.matchedQuestion?.theme || 'No Theme';
              if (themeLabel && typeof themeLabel === 'string') {
                themes.add(themeLabel);
              }
            });
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    });

    const themesArray = Array.from(themes)
      .filter(theme => typeof theme === 'string')
      .sort();

    // If no themes found, use a default theme
    if (themesArray.length === 0) {
      return ['General'];
    }

    return themesArray;
  }, [workingStandard]);

  // New function to extract unique categories from enhanced data
  const uniqueCategories = useMemo(() => {
    if (!workingStandard?.submissions || !Array.isArray(workingStandard.submissions)) {
      return [];
    }

    const categories = new Set<string>();

    workingStandard.submissions.forEach((submission: any) => {
      if (submission.enhancedAnswer) {
        submission.enhancedAnswer.forEach((answerItem: any) => {
          if (answerItem.category && answerItem.category.name) {
            categories.add(answerItem.category.name);
          }
        });
      }
    });

    const categoriesArray = Array.from(categories)
      .filter(category => typeof category === 'string')
      .sort();
    return categoriesArray;
  }, [workingStandard]);

  const uniqueSubmittedBy = useMemo(() => {
    if (!workingStandard?.submissions || !Array.isArray(workingStandard.submissions)) {
      return [];
    }

    const submittedBy = workingStandard.submissions.map((sub: any) => sub.submittedBy?.fullName);
    const filteredSubmittedBy = submittedBy.filter(Boolean);
    return [...new Set(filteredSubmittedBy)].sort();
  }, [workingStandard]);

  // Get unique company names that have approved standards with answers
  const uniqueCompanies = useMemo(() => {
    if (!isParentCompany || !allCompanies || allCompanies.length === 0) {
      return [companyName];
    }

    // Get companies that have standards, or just the current company if none found
    const companiesWithStandards = new Set<string>();

    if (workingStandard?.submissions) {
      workingStandard.submissions.forEach((sub: any) => {
        if (sub.company?.name && sub.answer) {
          companiesWithStandards.add(sub.company.name);
        }
      });
    }

    // Return only companies that have standards, or just the current company if none found
    const filteredCompanies = Array.from(companiesWithStandards);
    return filteredCompanies.length > 0 ? filteredCompanies : [companyName];
  }, [allCompanies, companyName, isParentCompany, workingStandard]);

  // Set all values as default when modal opens
  useEffect(() => {
    if (isOpen && workingStandard) {
      setSelectedYears(uniqueYears as string[]);
      setSelectedThemes(uniqueThemes as string[]);
      setSelectedCategories(uniqueCategories as string[]);
      setSelectedSubmittedBy(uniqueSubmittedBy as string[]);
      // Only set company filter for parent companies
      if (isParentCompany) {
        setSelectedCompanies(uniqueCompanies);
      } else {
        setSelectedCompanies([companyName]);
      }
    }
  }, [isOpen, workingStandard]); // Only depend on isOpen and workingStandard, not the computed values

  const handleDownload = async () => {
    if (!workingStandard) return;

    try {
      setIsDownloading(true);

      // Filter submissions based on selected criteria
      const filteredSubmissions = workingStandard.submissions.filter((sub: any) => {
        // Filter by year
        if (
          sub.reportingAnswerYear &&
          selectedYears.length > 0 &&
          !selectedYears.includes(sub.reportingAnswerYear?.toString())
        ) {
          return false;
        }

        // Filter by submitted by
        if (selectedSubmittedBy.length > 0 && !selectedSubmittedBy.includes(sub.submittedBy?.fullName)) {
          return false;
        }

        // Filter by company
        if (selectedCompanies.length > 0 && !selectedCompanies.includes(sub.company?.name)) {
          return false;
        }

        // Filter by theme
        if (selectedThemes.length > 0) {
          let hasMatchingTheme = false;
          if (sub.enhancedAnswer) {
            sub.enhancedAnswer.forEach((item: any) => {
              const themeLabel = item.theme || 'No Theme';
              if (themeLabel && selectedThemes.includes(themeLabel)) {
                hasMatchingTheme = true;
              }
            });
          }
          if (!hasMatchingTheme) {
            return false;
          }
        }

        // Filter by category
        if (selectedCategories.length > 0) {
          let hasMatchingCategory = false;
          if (sub.enhancedAnswer) {
            sub.enhancedAnswer.forEach((item: any) => {
              if (item.category && item.category.name && selectedCategories.includes(item.category.name)) {
                hasMatchingCategory = true;
              }
            });
          }
          if (!hasMatchingCategory) {
            return false;
          }
        }

        return true;
      });

      // Group submissions by company
      const submissionsByCompany: { [key: string]: any[] } = {};

      filteredSubmissions.forEach((submission: any) => {
        const companyName = submission.company?.name || 'Unknown Company';
        if (!submissionsByCompany[companyName]) {
          submissionsByCompany[companyName] = [];
        }
        submissionsByCompany[companyName].push(submission);
      });

      // Transform the data for export, grouped by company and category
      const exportData: ExportDataItem[] = [];
      const exportDataByCategory: { [category: string]: ExportDataItem[] } = {};

      Object.keys(submissionsByCompany).forEach(companyName => {
        const companySubmissions = submissionsByCompany[companyName];

        companySubmissions.forEach((submission: any) => {
          if (submission.enhancedAnswer) {
            submission.enhancedAnswer.forEach((answerItem: any) => {
              // Check if theme filter applies
              const themeLabel = answerItem.theme || 'No Theme';
              if (selectedThemes.length > 0 && !selectedThemes.includes(themeLabel)) {
                return;
              }

              // Check if category filter applies
              const categoryName = answerItem.category?.name || 'Uncategorized';
              if (selectedCategories.length > 0 && !selectedCategories.includes(categoryName)) {
                return;
              }

              let selectedOption = 'N/A';

              switch (answerItem.type) {
                case 'textBox':
                  selectedOption = answerItem?.content || answerItem?.answer || 'N/A';
                  break;
                case 'checkbox':
                  if (answerItem?.checkboxOptions && Array.isArray(answerItem.checkboxOptions)) {
                    selectedOption = answerItem.checkboxOptions
                      .filter((opt: { isChecked: any }) => opt?.isChecked)
                      .map((opt: { text: any }) => opt?.text)
                      .join('; ');
                  }
                  break;
                case 'dropDown':
                  selectedOption = answerItem?.answer || 'N/A';
                  break;
                case 'radio':
                  if (answerItem?.radioOptions && Array.isArray(answerItem.radioOptions)) {
                    const selectedRadio = answerItem.radioOptions.find((opt: { isChecked: any }) => opt?.isChecked);
                    selectedOption = selectedRadio?.text || 'None';
                  }
                  break;
                case 'table':
                  if (answerItem?.answer) {
                    const tableOptions = answerItem.answer;
                    selectedOption = tableOptions;
                  }
                  break;
                default:
                  selectedOption = answerItem?.answer || answerItem?.content || 'N/A';
              }

              const exportItem = {
                'Standard Name': workingStandard.name,
                'Parent Question': submission?.parentQuestion?.title || 'N/A',
                'Question': answerItem.title || 'N/A',
                'Question Type': answerItem.type || 'N/A',
                'Answer': selectedOption,
                'Theme': themeLabel,
                'Category': categoryName,
                'Submitted By': submission?.submittedBy?.fullName || 'N/A',
                'Department': submission?.department?.name || 'N/A',
                'Year': submission?.reportingAnswerYear || new Date().getFullYear(),
                'Approval Date': submission?.updatedAt ? new Date(submission.updatedAt).toLocaleDateString() : 'N/A',
                'Company': companyName
              };

              // Add to flat export data (for CSV/Excel)
              exportData.push(exportItem);

              // Group by category for organized reports
              if (!exportDataByCategory[categoryName]) {
                exportDataByCategory[categoryName] = [];
              }
              exportDataByCategory[categoryName].push(exportItem);
            });
          }
        });
      });

      if (exportData.length === 0) {
        toast({
          title: 'No data to export',
          description: 'No data matches the selected filters.',
          status: 'warning',
          duration: 3000,
          isClosable: true
        });
        return;
      }

      // Generate file based on selected format
      const fileName = `${companyName}_${workingStandard.name}_approved_standards.${fileFormat}`;

      if (fileFormat === 'pdf') {
        // Use the extracted PDF generation utility
        const filteredExportData = exportData.filter(item => item['Question Type'] !== 'table');
        await generateStandardsPDF({
          standardName: workingStandard.name,
          companyName,
          exportData: filteredExportData,
          exportDataByCategory,
          fileName
        });
      } else if (fileFormat === 'csv') {
        // CSV format with category grouping
        const csvData: string[][] = [];

        // Add header row
        csvData.push([
          'Standard Name',
          'Parent Question',
          'Question',
          'Question Type',
          'Answer',
          'Theme',
          'Category',
          'Submitted By',
          'Department',
          'Year',
          'Approval Date',
          'Company'
        ]);

        // Group by category and add category separators
        // First, handle categorized questions
        Object.keys(exportDataByCategory)
          .filter(categoryName => categoryName !== 'Uncategorized')
          .sort()
          .forEach(categoryName => {
            const categoryData = exportDataByCategory[categoryName];

            if (categoryData.length > 0) {
              // Add category header row
              csvData.push([`Category: ${categoryName}`, '', '', '', '', '', '', '', '', '', '']);

              // Add data rows for this category
              categoryData.forEach(item => {
                csvData.push([
                  item['Standard Name'],
                  item['Parent Question'],
                  item['Question'],
                  item['Question Type'],
                  item['Answer'],
                  item['Theme'],
                  item['Category'],
                  item['Submitted By'],
                  item['Department'],
                  item['Year'].toString(),
                  item['Approval Date'],
                  item['Company']
                ]);
              });

              // Add empty row after each category for better readability
              csvData.push(['', '', '', '', '', '', '', '', '', '', '']);
            }
          });

        // Handle uncategorized questions separately at the end
        if (exportDataByCategory['Uncategorized'] && exportDataByCategory['Uncategorized'].length > 0) {
          // Add uncategorized header row
          csvData.push([`Uncategorized Questions`, '', '', '', '', '', '', '', '', '', '']);

          // Add data rows for uncategorized questions
          exportDataByCategory['Uncategorized'].forEach(item => {
            csvData.push([
              item['Standard Name'],
              item['Parent Question'],
              item['Question'],
              item['Question Type'],
              item['Answer'],
              item['Theme'],
              item['Category'],
              item['Submitted By'],
              item['Department'],
              item['Year'].toString(),
              item['Approval Date'],
              item['Company']
            ]);
          });

          // Add empty row after uncategorized section
          csvData.push(['', '', '', '', '', '', '', '', '', '', '']);
        }

        // Convert to CSV string
        const csvString = Papa.unparse(csvData);

        // Create and download CSV file
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // DOCX format with company grouping
        try {
          const docChildren: any[] = [
            new Paragraph({
              text: `${workingStandard.name} - Approved Standards`,
              heading: 'Heading1',
              spacing: { after: 200 }
            }),
            new Paragraph({
              text: `Generated on: ${new Date().toLocaleDateString()}`,
              spacing: { after: 200 }
            })
          ];

          // Group data by company and category
          Object.keys(submissionsByCompany).forEach(companyName => {
            const companyData = exportData.filter(item => item.Company === companyName);

            if (companyData.length > 0) {
              // Add company header
              docChildren.push(
                new Paragraph({
                  text: `Company: ${companyName}`,
                  heading: 'Heading2',
                  spacing: { before: 200, after: 100 }
                })
              );

              // Group company data by category
              const companyDataByCategory: { [category: string]: ExportDataItem[] } = {};
              companyData.forEach(item => {
                const category = item['Category'] || 'Uncategorized';
                if (!companyDataByCategory[category]) {
                  companyDataByCategory[category] = [];
                }
                companyDataByCategory[category].push(item);
              });

              // Create sections for each category
              // First, handle categorized questions
              Object.keys(companyDataByCategory)
                .filter(categoryName => categoryName !== 'Uncategorized')
                .sort()
                .forEach(categoryName => {
                  const categoryData = companyDataByCategory[categoryName];

                  if (categoryData.length > 0) {
                    // Add category header
                    docChildren.push(
                      new Paragraph({
                        text: `Category: ${categoryName}`,
                        heading: 'Heading3',
                        spacing: { before: 150, after: 50 }
                      })
                    );

                    // Create table for this category
                    const tableRows = [
                      // Header row
                      new TableRow({
                        children: [
                          new TableCell({ children: [new Paragraph({ text: 'Parent Question' })] }),
                          new TableCell({ children: [new Paragraph({ text: 'Question' })] }),
                          new TableCell({ children: [new Paragraph({ text: 'Answer' })] }),
                          new TableCell({ children: [new Paragraph({ text: 'Theme' })] }),
                          new TableCell({ children: [new Paragraph({ text: 'Submitted By' })] }),
                          new TableCell({ children: [new Paragraph({ text: 'Year' })] })
                        ]
                      })
                    ];

                    // Add data rows for this category
                    categoryData.forEach((item, index) => {
                      tableRows.push(
                        new TableRow({
                          children: [
                            new TableCell({ children: [new Paragraph({ text: item['Parent Question'] || 'N/A' })] }),
                            new TableCell({ children: [new Paragraph({ text: item['Question'] || 'N/A' })] }),
                            new TableCell({ children: [new Paragraph({ text: item['Answer'] || 'N/A' })] }),
                            new TableCell({ children: [new Paragraph({ text: item['Theme'] || 'N/A' })] }),
                            new TableCell({ children: [new Paragraph({ text: item['Submitted By'] || 'N/A' })] }),
                            new TableCell({ children: [new Paragraph({ text: (item['Year'] || 'N/A').toString() })] })
                          ]
                        })
                      );
                    });

                    docChildren.push(
                      new Table({
                        width: {
                          size: 100,
                          type: WidthType.PERCENTAGE
                        },
                        rows: tableRows
                      })
                    );
                  }
                });

              // Handle uncategorized questions separately at the end
              if (companyDataByCategory['Uncategorized'] && companyDataByCategory['Uncategorized'].length > 0) {
                // Add uncategorized header
                docChildren.push(
                  new Paragraph({
                    text: `Uncategorized Questions`,
                    heading: 'Heading3',
                    spacing: { before: 150, after: 50 }
                  })
                );

                // Create table for uncategorized questions
                const tableRows = [
                  // Header row
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ text: 'Parent Question' })] }),
                      new TableCell({ children: [new Paragraph({ text: 'Question' })] }),
                      new TableCell({ children: [new Paragraph({ text: 'Answer' })] }),
                      new TableCell({ children: [new Paragraph({ text: 'Theme' })] }),
                      new TableCell({ children: [new Paragraph({ text: 'Submitted By' })] }),
                      new TableCell({ children: [new Paragraph({ text: 'Year' })] })
                    ]
                  })
                ];

                // Add data rows for uncategorized questions
                companyDataByCategory['Uncategorized'].forEach((item, index) => {
                  tableRows.push(
                    new TableRow({
                      children: [
                        new TableCell({ children: [new Paragraph({ text: item['Parent Question'] || 'N/A' })] }),
                        new TableCell({ children: [new Paragraph({ text: item['Question'] || 'N/A' })] }),
                        new TableCell({ children: [new Paragraph({ text: item['Answer'] || 'N/A' })] }),
                        new TableCell({ children: [new Paragraph({ text: item['Theme'] || 'N/A' })] }),
                        new TableCell({ children: [new Paragraph({ text: item['Submitted By'] || 'N/A' })] }),
                        new TableCell({ children: [new Paragraph({ text: (item['Year'] || 'N/A').toString() })] })
                      ]
                    })
                  );
                });

                docChildren.push(
                  new Table({
                    width: {
                      size: 100,
                      type: WidthType.PERCENTAGE
                    },
                    rows: tableRows
                  })
                );
              }
            }
          });

          // Add footer
          docChildren.push(
            new Paragraph({
              text: 'Powered by Greenfi',
              spacing: { before: 200 }
            })
          );

          const doc = new Document({
            sections: [
              {
                properties: {},
                children: docChildren
              }
            ]
          });

          const base64 = await Packer.toBase64String(doc);

          // Convert base64 to blob
          const byteCharacters = atob(base64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          });

          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = fileName;
          link.click();
          URL.revokeObjectURL(link.href);
        } catch (docxError: unknown) {
          console.error('Error generating Word document:', docxError);
          const errorMessage = docxError instanceof Error ? docxError.message : 'Unknown error';
          throw new Error(`Failed to generate Word document: ${errorMessage}`);
        }
      }

      toast({
        title: 'Download successful',
        description: `File "${fileName}" has been downloaded.`,
        status: 'success',
        duration: 3000,
        isClosable: true
      });

      onClose();
    } catch (error) {
      console.error('Error downloading data:', error);
      toast({
        title: 'Download failed',
        description: 'An error occurred while downloading the file.',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleYearChange = (clickedYear: string) => {
    setSelectedYears(prev => {
      const isSelected = prev.includes(clickedYear);
      if (isSelected) {
        return prev.filter(year => year !== clickedYear);
      } else {
        return [...prev, clickedYear];
      }
    });
  };

  const handleThemeChange = (clickedTheme: string) => {
    setSelectedThemes(prev => {
      const isSelected = prev.includes(clickedTheme);
      if (isSelected) {
        return prev.filter(theme => theme !== clickedTheme);
      } else {
        return [...prev, clickedTheme];
      }
    });
  };

  // New handler for category changes
  const handleCategoryChange = (clickedCategory: string) => {
    setSelectedCategories(prev => {
      const isSelected = prev.includes(clickedCategory);
      if (isSelected) {
        return prev.filter(category => category !== clickedCategory);
      } else {
        return [...prev, clickedCategory];
      }
    });
  };

  const handleSubmittedByChange = (clickedName: string) => {
    setSelectedSubmittedBy(prev => {
      const isSelected = prev.includes(clickedName);
      if (isSelected) {
        return prev.filter(name => name !== clickedName);
      } else {
        return [...prev, clickedName];
      }
    });
  };

  const handleFileFormatChange = (value: string) => {
    setFileFormat(value as 'pdf' | 'docx');
  };

  const handleCompanyChange = (clickedCompany: string) => {
    setSelectedCompanies(prev => {
      const isSelected = prev.includes(clickedCompany);
      if (isSelected) {
        return prev.filter(company => company !== clickedCompany);
      } else {
        return [...prev, clickedCompany];
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent bg="white" borderRadius="lg" boxShadow="xl">
        <ModalHeader
          display={'flex'}
          justifyContent={'space-between'}
          alignItems={'center'}
          borderBottom="1px solid"
          borderColor="gray.200"
        >
          <Flex display={'flex'} flexDirection={'column'} alignItems="center">
            <Text width={'100%'} fontSize="lg" fontWeight="normal">
              Download {workingStandard?.name} Data
            </Text>
            {isLoadingQuestionBankData && (
              <Text fontSize="sm" color="blue.500" fontWeight="normal">
                🔄 Preparing enhanced report with categories...
              </Text>
            )}
          </Flex>
          <ModalCloseButton position={'static'} />
        </ModalHeader>
        <ModalBody py={6}>
          {/* Show loading state when preparing report data */}
          {isLoadingQuestionBankData && (
            <Box p={4} bg="blue.50" border="1px solid" borderColor="blue.200" borderRadius="md" mb={4}>
              <Flex align="center" gap={3}>
                <Spinner size="sm" color="blue.500" />
                <Text fontSize="sm" color="blue.700" fontWeight="medium">
                  Preparing enhanced report with categories...
                </Text>
              </Flex>
              <Text fontSize="xs" color="blue.600" mt={2}>
                This may take a few moments while we fetch question bank data
              </Text>
            </Box>
          )}

          <VStack spacing={6} align="stretch">
            {/* File Format Selection */}
            <FormControl>
              <FormLabel fontWeight="medium">File Format</FormLabel>
              <RadioGroup value={fileFormat} onChange={handleFileFormatChange}>
                <VStack align="start" spacing={3}>
                  <Radio value="pdf" colorScheme="blue">
                    PDF
                  </Radio>
                  <Radio value="docx" colorScheme="blue">
                    Word (DOCX)
                  </Radio>
                  <Radio value="csv" colorScheme="blue">
                    CSV
                  </Radio>
                </VStack>
              </RadioGroup>
            </FormControl>

            {/* Year Filter */}
            <FormControl>
              <FormLabel fontWeight="medium">Year</FormLabel>
              <Menu closeOnSelect={false}>
                <MenuButton as={Button} rightIcon={<ChevronDownIcon />} colorScheme="blue" variant="outline" w="100%">
                  {selectedYears.length === 0 ? 'Select Years' : `${selectedYears.length} year(s) selected`}
                </MenuButton>
                <MenuList maxH="200px" overflowY="auto">
                  {uniqueYears.map((year: unknown) => (
                    <MenuItem
                      key={year as string}
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleYearChange(year as string);
                      }}
                      closeOnSelect={false}
                    >
                      <Checkbox isChecked={selectedYears.includes(year as string)} mr={3} colorScheme="blue" />
                      <Text>{year as string}</Text>
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            </FormControl>

            {/* Theme Filter */}
            <FormControl>
              <FormLabel fontWeight="medium">Theme</FormLabel>
              <Menu closeOnSelect={false}>
                <MenuButton as={Button} rightIcon={<ChevronDownIcon />} colorScheme="blue" variant="outline" w="100%">
                  {selectedThemes.length === 0 ? 'Select Themes' : `${selectedThemes.length} theme(s) selected`}
                </MenuButton>
                <MenuList maxH="200px" overflowY="auto">
                  {uniqueThemes.map((theme: string) => (
                    <MenuItem
                      key={theme}
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleThemeChange(theme);
                      }}
                      closeOnSelect={false}
                    >
                      <Checkbox isChecked={selectedThemes.includes(theme)} mr={3} colorScheme="blue" />
                      <Text>{typeof theme === 'string' ? theme : 'Unknown Theme'}</Text>
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            </FormControl>

            {/* Category Filter - Only show if we have categories */}
            {uniqueCategories.length > 0 && (
              <FormControl>
                <FormLabel fontWeight="medium">Category</FormLabel>
                <Menu closeOnSelect={false}>
                  <MenuButton as={Button} rightIcon={<ChevronDownIcon />} colorScheme="blue" variant="outline" w="100%">
                    {selectedCategories.length === 0
                      ? 'Select Categories'
                      : `${selectedCategories.length} category/ies selected`}
                  </MenuButton>
                  <MenuList maxH="200px" overflowY="auto">
                    {uniqueCategories.map((category: string) => (
                      <MenuItem
                        key={category}
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCategoryChange(category);
                        }}
                        closeOnSelect={false}
                      >
                        <Checkbox isChecked={selectedCategories.includes(category)} mr={3} colorScheme="blue" />
                        <Text>{category}</Text>
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
              </FormControl>
            )}

            {/* Submitted By Filter */}
            <FormControl>
              <FormLabel fontWeight="medium">Submitted By</FormLabel>
              <Menu closeOnSelect={false}>
                <MenuButton as={Button} rightIcon={<ChevronDownIcon />} colorScheme="blue" variant="outline" w="100%">
                  {selectedSubmittedBy.length === 0
                    ? 'Select Submitted By'
                    : `${selectedSubmittedBy.length} user(s) selected`}
                </MenuButton>
                <MenuList maxH="200px" overflowY="auto">
                  {uniqueSubmittedBy.map((name: unknown) => (
                    <MenuItem
                      key={name as string}
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSubmittedByChange(name as string);
                      }}
                      closeOnSelect={false}
                    >
                      <Checkbox isChecked={selectedSubmittedBy.includes(name as string)} mr={3} colorScheme="blue" />
                      <Text>{name as string}</Text>
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            </FormControl>

            {/* Company Filter - Only show for parent companies */}
            {isParentCompany && (
              <FormControl>
                <FormLabel fontWeight="medium">Company/Subsidiary</FormLabel>
                <Menu closeOnSelect={false}>
                  <MenuButton as={Button} rightIcon={<ChevronDownIcon />} colorScheme="blue" variant="outline" w="100%">
                    {selectedCompanies.length === 0
                      ? 'Select Companies'
                      : `${selectedCompanies.length} company/ies selected`}
                  </MenuButton>
                  <MenuList maxH="200px" overflowY="auto">
                    {uniqueCompanies.map((company: string) => (
                      <MenuItem
                        key={company}
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCompanyChange(company);
                        }}
                        closeOnSelect={false}
                      >
                        <Checkbox isChecked={selectedCompanies.includes(company)} mr={3} colorScheme="blue" />
                        <Text>{company}</Text>
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
              </FormControl>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter borderTop="1px solid" borderColor="gray.200">
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleDownload}
              isLoading={isDownloading || isLoadingQuestionBankData}
              loadingText={isLoadingQuestionBankData ? 'Preparing Report...' : 'Downloading...'}
              disabled={isLoadingQuestionBankData}
            >
              {isLoadingQuestionBankData ? 'Preparing Report...' : 'Download'}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DownloadStandardsModal;
