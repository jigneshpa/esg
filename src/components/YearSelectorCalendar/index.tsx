import { useEffect, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

import './index.css';

import { Button } from '@chakra-ui/react';

const YearSelectorCalendar = ({
  selectedYear,
  setSelectedYear
}: {
  selectedYear: number,
  setSelectedYear: (year: number) => void
}) => {
  const currentYear = new Date().getFullYear();
  const [viewYear, setViewYear] = useState(currentYear);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const startYear = Math.floor(viewYear / 12) * 12;
  const years = Array.from({ length: 12 }, (_, i) => startYear + i);

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setIsOpen(false);
  };

  const navigatePrevious = () => setViewYear(viewYear - 12);
  const navigateNext = () => setViewYear(viewYear + 12);
  const goToCurrentYear = () => setViewYear(currentYear);

  const toggleCalendar = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setViewYear(selectedYear);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="ysc-root">
      <div className="ysc-dropdown-container" ref={containerRef}>
        <Button
          onClick={toggleCalendar}
          className="ysc-input"
          // make it white
          variant="outline"
          colorScheme="gray"
          width="100%"
          aria-haspopup="true"
          aria-expanded={isOpen}
          aria-label="Select Year"
          //   give sapce benteen span and calendar icon
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <span className="ysc-input-value">{selectedYear}</span>
          <Calendar className="ysc-input-icon" />
        </Button>
        {isOpen && (
          <div className="ysc-dropdown">
            <div className="ysc-nav">
              <button onClick={navigatePrevious} className="ysc-nav-btn" aria-label="Previous years">
                <ChevronLeft className="ysc-nav-icon" />
              </button>
              <div className="ysc-nav-center">
                <div className="ysc-nav-range">
                  {startYear} - {startYear + 11}
                </div>
                <button onClick={goToCurrentYear} className="ysc-today-btn">
                  Today
                </button>
              </div>
              <button onClick={navigateNext} className="ysc-nav-btn" aria-label="Next years">
                <ChevronRight className="ysc-nav-icon" />
              </button>
            </div>
            <div className="ysc-years-grid">
              {years.map(year => {
                const isSelected = year === selectedYear;
                const isCurrent = year === currentYear;
                return (
                  <button
                    key={year}
                    onClick={() => handleYearSelect(year)}
                    className={
                      'ysc-year-btn' + (isSelected ? ' ysc-year-selected' : isCurrent ? ' ysc-year-current' : '')
                    }
                  >
                    {year}
                    {isCurrent && !isSelected && <div className="ysc-year-dot"></div>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YearSelectorCalendar;
