{"version":3,"sources":["printer.js"],"names":["BX","namespace","Scheduler","Printer","timeline","this","paperSizes","A5","width","height","A4","Letter","Legal","A3","format","orientation","border","dpi","dateFrom","getViewportDateFrom","dateTo","getViewportDateTo","maxPagesToPrint","printWindow","fitToPage","prototype","print","getTimeline","getDateFrom","getDateTo","Error","message","getStart","getEnd","columnWidth","getColumnWidth","printableTimelineWidth","getTimespanWidth","diagramWidth","pageWidth","getPageWidth","pageHeight","getPageHeight","pageXCount","getFitToPage","Math","ceil","pageXColumnCount","pageYCount","getScrollHeight","totalPages","errorText","type","isNotEmptyString","replace","dateOffset","getPixelsFromDate","createPrintWindow","originalScrollLeft","getScrollLeft","setHeaderViewportWidth","x","scrollTo","y","printPage","document","createElement","style","overflow","getBorder","marginBottom","pageBreak","cssText","newContainer","getRootContainer","cloneNode","appendChild","newTimeline","querySelector","newColumn","position","top","left","display","parentNode","scale","min","transform","transformOrigin","body","setScrollLeft","setTimeout","window","open","util","getRandomString","headTags","links","head","querySelectorAll","i","length","link","outerHTML","getFormat","getOrientation","write","close","closePrintWindow","getPrintWindow","scrollLeft","getDateFromPixels","setDateFrom","isDate","viewport","getViewportWidth","setDateTo","getPaperSizes","getPageSize","pageSize","getDPI","setFormat","setOrientation","setBorder","isBoolean","setFitToPage","flag"],"mappings":"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","file":""}