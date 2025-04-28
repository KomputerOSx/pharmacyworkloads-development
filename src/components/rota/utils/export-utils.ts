// // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// //@ts-nocheck
// import { format } from "date-fns";
// import type { Assignment, ShiftPreset } from "@/types/rotaTypes";
// import { StoredAssignment } from "@/types/rotaTypes";
// import { formatTimeDisplay, getShiftPreset } from "./rota-utils";
// import { HospLoc } from "@/types/subDepTypes";
// import { User } from "@/types/userTypes";
// import Cell from "exceljs/index";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
//
// // Helper function to get location name (no changes needed)
// export const getLocationName = (
//     assignment: Assignment,
//     allLocations: HospLoc[],
// ): string => {
//     // ... (keep existing implementation)
//     if (assignment.customLocation) {
//         return assignment.customLocation;
//     } else if (assignment.locationId) {
//         const location = allLocations.find(
//             (l) => l.id === assignment.locationId,
//         );
//         return location ? location.name : "";
//     }
//     return "";
// };
//
// // Helper function to format assignment for display (no changes needed)
// export const formatAssignmentForExport = (
//     assignment: Assignment,
//     allLocations: HospLoc[],
//     shiftPresets: ShiftPreset[],
//     includeNotes: boolean,
// ): string => {
//     // ... (keep existing implementation)
//     const locationName = getLocationName(assignment, allLocations);
//     const shiftPreset = assignment.shiftType
//         ? getShiftPreset(assignment.shiftType)
//         : null;
//     let result = "";
//
//     if (locationName) {
//         if (shiftPreset) {
//             if (
//                 assignment.shiftType === "custom" &&
//                 assignment.customStartTime &&
//                 assignment.customEndTime
//             ) {
//                 // For custom shifts, include the actual times
//                 result = `${locationName} (CUSTOM: ${formatTimeDisplay(assignment.customStartTime)} - ${formatTimeDisplay(assignment.customEndTime)})`;
//             } else {
//                 result = `${locationName} (${shiftPreset.name})`;
//             }
//         } else {
//             result = locationName;
//         }
//
//         // Add notes if requested
//         if (includeNotes && assignment.notes) {
//             result += `\nNotes: ${assignment.notes}`;
//         }
//     }
//
//     return result;
// };
//
// // Export to CSV
// export const exportToCSV = (
//     users: User[],
//     weekDays: Date[],
//     weekId: string,
//     weekNumber: number,
//     weekYear: string,
//     teamName: string, // <-- Add teamName parameter
//     getCellAssignments: (
//         userId: string,
//         dayIndex: number,
//         weekId: string,
//     ) => StoredAssignment[],
//     allLocations: HospLoc[],
//     shiftPresets: ShiftPreset[],
//     includeNotes: boolean,
//     includeEmptyCells: boolean,
// ): void => {
//     // Create CSV header
//     let csv = "User,Role,"; // Changed 'user' to 'User' for consistency
//
//     // Add days of the week to header
//     weekDays.forEach((day) => {
//         csv += `${format(day, "EEE MMM d")},`;
//     });
//     csv += "\n";
//
//     // Add data for each user member
//     users.forEach((user) => {
//         csv += `"${user.firstName + " " + user.lastName}","${user.jobTitle || user.role}",`; // Ensure names/roles with commas are quoted
//
//         // Add assignments for each day
//         weekDays.forEach((_, dayIndex) => {
//             const cellAssignments = getCellAssignments(
//                 user.id,
//                 dayIndex,
//                 weekId,
//             );
//             let cellText = "";
//
//             if (cellAssignments.length > 0) {
//                 cellAssignments.forEach((assignment, index) => {
//                     const formattedAssignment = formatAssignmentForExport(
//                         assignment,
//                         allLocations,
//                         shiftPresets,
//                         includeNotes,
//                     );
//                     if (formattedAssignment) {
//                         // Replace internal newlines with a character CSV readers might handle better,
//                         // or just use space/semicolon. Sticking with semicolon for now.
//                         const cleanAssignment = formattedAssignment.replace(
//                             /\n/g,
//                             "; ",
//                         );
//                         cellText += cleanAssignment;
//                         if (index < cellAssignments.length - 1) {
//                             cellText += "; "; // Separator for multiple assignments in one cell
//                         }
//                     }
//                 });
//             } else if (includeEmptyCells) {
//                 cellText = "No assignment";
//             }
//
//             csv += `"${cellText.replace(/"/g, '""')}",`; // Ensure cell content is quoted and internal quotes escaped
//         });
//
//         csv += "\n";
//     });
//
//     // Create download link
//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.setAttribute("href", url);
//     // Use teamName in the filename
//     const safeTeamName = teamName.replace(/[^a-z0-9]/gi, "_").toLowerCase(); // Sanitize team name for filename
//     link.setAttribute(
//         "download",
//         `rota-${safeTeamName}-week-${weekNumber}-${weekYear}.csv`,
//     );
//     link.style.visibility = "hidden";
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
// };
//
// // Function to load the Excel library dynamically (no changes needed)
// export const loadExcelLibrary = async (): Promise<> => {
//     // Use `any` or specific ExcelJS type if preferred
//     // We'll use the ExcelJS library
//     const ExcelJS = await import("exceljs");
//     return ExcelJS.default;
// };
//
// // Get color for shift type (no changes needed)
// const getShiftColor = (shiftType: string | null): string => {
//     // ... (keep existing implementation)
//     switch (shiftType) {
//         case "normal":
//             return "FFFFFF"; // White/bland for normal shifts
//         case "am":
//             return "C6E0B4"; // Light Green
//         case "pm":
//             return "F8CBAD"; // Light Orange
//         case "late":
//             return "D9D2E9"; // Light Purple
//         case "longday":
//             return "F4B4B4"; // Light Red
//         case "custom":
//             return "BDD7EE"; // Light Blue
//         default:
//             return "FFFFFF"; // White/bland
//     }
// };
//
// // Get CSS color for shift type (for PDF export) (no changes needed)
// const getShiftCssColor = (shiftType: string | null): string | null => {
//     switch (shiftType) {
//         // case "normal": return "#FFFFFF"; // Let's use null for normal to allow weekend shading
//         case "am":
//             return "#C6E0B4"; // Light Green
//         case "pm":
//             return "#F8CBAD"; // Light Orange
//         case "late":
//             return "#D9D2E9"; // Light Purple
//         case "longday":
//             return "#F4B4B4"; // Light Red
//         case "custom":
//             return "#BDD7EE"; // Light Blue
//         default:
//             return null; // Return null for default/normal or unknown
//     }
// };
//
// // Export to Excel with styling
// export const exportToExcel = async (
//     users: User[],
//     weekDays: Date[],
//     weekId: string,
//     weekNumber: number,
//     weekYear: string,
//     teamName: string, // <-- Add teamName parameter
//     getCellAssignments: (
//         userId: string,
//         dayIndex: number,
//         weekId: string,
//     ) => StoredAssignment[],
//     allLocations: HospLoc[],
//     shiftPresets: ShiftPreset[],
//     includeNotes: boolean,
//     includeEmptyCells: boolean,
// ): Promise<void> => {
//     try {
//         const ExcelJS = await loadExcelLibrary();
//         const workbook = new ExcelJS.Workbook();
//
//         // Add metadata
//         workbook.creator = "Weekly Rota System";
//         workbook.lastModifiedBy = "Weekly Rota System";
//         workbook.created = new Date();
//         workbook.modified = new Date();
//
//         // Use teamName in worksheet name
//         const safeTeamNameSheet = teamName
//             .replace(/[*?:\\/\[\]]/g, "_")
//             .substring(0, 31); // Sanitize for sheet name rules
//         const worksheet = workbook.addWorksheet(
//             `${safeTeamNameSheet} W${weekNumber}`,
//             {
//                 properties: { tabColor: { argb: "FF4472C4" } }, // Blue tab
//             },
//         );
//
//         // Create a title row - include teamName
//         worksheet.mergeCells(1, 1, 1, weekDays.length + 2); // Merge cells for the title (user + role + days)
//         const titleCell = worksheet.getCell(1, 1);
//         titleCell.value = `${teamName} Staff Rota - Week ${weekNumber}, ${weekYear}`; // Use teamName here
//         titleCell.font = {
//             name: "Arial",
//             size: 16,
//             bold: true,
//             color: { argb: "FFFFFFFF" },
//         };
//         titleCell.fill = {
//             type: "pattern",
//             pattern: "solid",
//             fgColor: { argb: "FF4472C4" },
//         };
//         titleCell.alignment = { horizontal: "center", vertical: "middle" };
//         worksheet.getRow(1).height = 30;
//
//         // Add column headers in row 2
//         const headerRow = worksheet.getRow(2);
//         headerRow.values = ["Staff Name", "Role"];
//
//         // Add days of the week with dates
//         weekDays.forEach((day, index) => {
//             headerRow.getCell(index + 3).value = format(day, "EEE MMM d");
//         });
//
//         // Style the header row (no changes needed here)
//         headerRow.font = { bold: true };
//         headerRow.height = 25;
//         headerRow.eachCell((cell: Cell) => {
//             cell.fill = {
//                 type: "pattern",
//                 pattern: "solid",
//                 fgColor: { argb: "FFD9E1F2" }, // Light blue background
//             };
//             cell.alignment = { horizontal: "center", vertical: "middle" };
//             cell.border = {
//                 top: { style: "thin", color: { argb: "FF000000" } },
//                 left: { style: "thin", color: { argb: "FF000000" } },
//                 bottom: { style: "medium", color: { argb: "FF000000" } },
//                 right: { style: "thin", color: { argb: "FF000000" } },
//             };
//         });
//
//         // Add data for each user member (logic remains the same)
//         let rowIndex = 3; // Start after header and title
//         users.forEach((user, userIndex) => {
//             const dataRow = worksheet.getRow(rowIndex);
//
//             // user name and role cells
//             dataRow.getCell(1).value = user.firstName + " " + user.lastName;
//             dataRow.getCell(2).value = user.jobTitle
//                 ? user.jobTitle
//                 : user.role;
//
//             // Style user cells (logic remains the same)
//             dataRow.getCell(1).font = { bold: true };
//             const rowBgColor = userIndex % 2 === 0 ? "FFF2F2F2" : "FFFFFFFF";
//             dataRow.getCell(1).alignment = { vertical: "top", wrapText: true };
//             dataRow.getCell(1).fill = {
//                 type: "pattern",
//                 pattern: "solid",
//                 fgColor: { argb: rowBgColor },
//             };
//
//             dataRow.getCell(2).alignment = { vertical: "top", wrapText: true };
//             dataRow.getCell(2).fill = {
//                 type: "pattern",
//                 pattern: "solid",
//                 fgColor: { argb: rowBgColor },
//             };
//
//             // Add assignments for each day (logic remains the same)
//             weekDays.forEach((day, dayIndex) => {
//                 const cellAssignments = getCellAssignments(
//                     user.id,
//                     dayIndex,
//                     weekId,
//                 );
//                 const cell = dataRow.getCell(dayIndex + 3);
//
//                 const isWeekend = day.getDay() === 0 || day.getDay() === 6;
//                 const baseColor = isWeekend ? "FFF2F2F2" : "FFFFFFFF"; // Base color, might be overridden by shift color
//
//                 if (cellAssignments.length > 0) {
//                     let cellText = "";
//                     cellAssignments.forEach((assignment, index) => {
//                         const formattedAssignment = formatAssignmentForExport(
//                             assignment,
//                             allLocations,
//                             shiftPresets,
//                             includeNotes,
//                         );
//                         if (formattedAssignment) {
//                             if (index > 0) cellText += "\n\n"; // Use newline for Excel
//                             cellText += formattedAssignment;
//                         }
//                     });
//                     cell.value = cellText;
//
//                     const firstAssignment = cellAssignments[0];
//                     const shiftColor = getShiftColor(firstAssignment.shiftType);
//                     // Apply specific shift color OR the alternating row background color
//                     const finalBgColor =
//                         firstAssignment.shiftType !== "normal"
//                             ? "FF" + shiftColor
//                             : baseColor;
//
//                     cell.fill = {
//                         type: "pattern",
//                         pattern: "solid",
//                         fgColor: { argb: finalBgColor },
//                     };
//
//                     cell.border = {
//                         top: { style: "thin", color: { argb: "FF000000" } },
//                         left: { style: "thin", color: { argb: "FF000000" } },
//                         bottom: { style: "thin", color: { argb: "FF000000" } },
//                         right: { style: "thin", color: { argb: "FF000000" } },
//                     };
//                     cell.font = {
//                         color: { argb: "FF000000" },
//                         bold: firstAssignment.shiftType === "longday",
//                     };
//
//                     // Adjust row height based on content
//                     const lines = cellText.split("\n").length;
//                     const notesLines =
//                         includeNotes && firstAssignment.notes
//                             ? firstAssignment.notes.split("\n").length
//                             : 0;
//                     const requiredHeight = Math.max(
//                         15,
//                         (lines + notesLines) * 15,
//                     ); // Estimate height
//                     dataRow.height = Math.max(
//                         dataRow.height || 15,
//                         requiredHeight,
//                         cellAssignments.length > 1
//                             ? 30 * cellAssignments.length
//                             : 0,
//                     );
//                 } else if (includeEmptyCells) {
//                     cell.value = "No assignment";
//                     cell.font = { italic: true, color: { argb: "FF999999" } };
//                     cell.fill = {
//                         type: "pattern",
//                         pattern: "solid",
//                         fgColor: { argb: baseColor },
//                     };
//                     cell.border = {
//                         top: { style: "thin", color: { argb: "FF000000" } },
//                         left: { style: "thin", color: { argb: "FF000000" } },
//                         bottom: { style: "thin", color: { argb: "FF000000" } },
//                         right: { style: "thin", color: { argb: "FF000000" } },
//                     };
//                 } else {
//                     // Empty cell with base color and borders
//                     cell.fill = {
//                         type: "pattern",
//                         pattern: "solid",
//                         fgColor: { argb: baseColor },
//                     };
//                     cell.border = {
//                         top: { style: "thin", color: { argb: "FF000000" } },
//                         left: { style: "thin", color: { argb: "FF000000" } },
//                         bottom: { style: "thin", color: { argb: "FF000000" } },
//                         right: { style: "thin", color: { argb: "FF000000" } },
//                     };
//                 }
//
//                 cell.alignment = { wrapText: true, vertical: "top" };
//             });
//
//             // Ensure minimum row height
//             dataRow.height = Math.max(dataRow.height || 15, 25);
//
//             rowIndex++;
//         });
//
//         // Auto-fit columns based on content (Adjusted for better fit)
//         // worksheet.columns.forEach((column, i) => {
//         //     let maxLength = 0;
//         //     column.eachCell?.({ includeEmpty: true }, (cell) => {
//         //         let cellLength = 0;
//         //         if (cell.value) {
//         //             // Consider newlines for width calculation
//         //             const lines = cell.value.toString().split("\n");
//         //             cellLength = lines.reduce(
//         //                 (max, line) => Math.max(max, line.length),
//         //                 0,
//         //             );
//         //         }
//         //         if (cellLength > maxLength) {
//         //             maxLength = cellLength;
//         //         }
//         //     });
//         //     // Set width with padding, respecting defined minimums/defaults
//         //     const defaultWidths = [10, 10, 30, 30, 30, 30, 30, 30, 30]; // User, Role, Days...
//         //     const baseWidth = defaultWidths[i] || 30;
//         //     column.width = Math.max(
//         //         baseWidth,
//         //         maxLength < 10 ? 10 : maxLength + 4,
//         //     );
//         // });
//         worksheet.columns.forEach((column, i) => {
//             if (i === 0) {
//                 column.width = 20;
//             } else if (i === 1) {
//                 column.width = 15;
//             } else {
//                 let maxLength = 0;
//                 column.eachCell?.({ includeEmpty: true }, (cell) => {
//                     let cellLength = 0;
//                     if (cell.value) {
//                         // Consider newlines for width calculation
//                         const lines = cell.value.toString().split("\n");
//                         cellLength = lines.reduce(
//                             (max, line) => Math.max(max, line.length),
//                             0,
//                         );
//                     }
//                     if (cellLength > maxLength) {
//                         maxLength = cellLength;
//                     }
//                 });
//
//                 const baseWidthForDays = 30;
//
//                 column.width = Math.max(
//                     baseWidthForDays,
//                     maxLength < 10 ? 10 : maxLength + 4, // Calculate width based on content + padding
//                 );
//             }
//         });
//
//         // Add a legend (logic remains the same)
//         rowIndex += 1; // Add some space
//         worksheet.mergeCells(rowIndex, 1, rowIndex, 3);
//         const legendTitle = worksheet.getCell(rowIndex, 1);
//         legendTitle.value = "Shift Types Legend";
//         legendTitle.font = { bold: true, size: 12 };
//         legendTitle.alignment = { horizontal: "left" }; // Align left might look better
//         rowIndex++;
//
//         shiftPresets.forEach((shift) => {
//             const shiftColor = getShiftColor(shift.id);
//             // Color cell
//             worksheet.getCell(rowIndex, 1).fill = {
//                 type: "pattern",
//                 pattern: "solid",
//                 fgColor: { argb: "FF" + shiftColor },
//             };
//             worksheet.getCell(rowIndex, 1).border = {
//                 top: { style: "thin", color: { argb: "FF000000" } },
//                 left: { style: "thin", color: { argb: "FF000000" } },
//                 bottom: { style: "thin", color: { argb: "FF000000" } },
//                 right: { style: "thin", color: { argb: "FF000000" } },
//             };
//             // Shift Name
//             worksheet.getCell(rowIndex, 2).value = shift.name;
//             worksheet.getCell(rowIndex, 2).alignment = { vertical: "middle" };
//             // Shift Description
//             worksheet.getCell(rowIndex, 3).value = shift.description;
//             worksheet.getCell(rowIndex, 3).alignment = { vertical: "middle" };
//             worksheet.getRow(rowIndex).height = 20; // Ensure legend rows are tall enough
//
//             rowIndex++;
//         });
//
//         // Generate the Excel file
//         const buffer = await workbook.xlsx.writeBuffer();
//         const blob = new Blob([buffer], {
//             type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//         });
//         const url = URL.createObjectURL(blob);
//         const link = document.createElement("a");
//         link.href = url;
//         // Use teamName in the filename
//         const safeTeamNameFile = teamName
//             .replace(/[^a-z0-9]/gi, "_")
//             .toLowerCase();
//         link.download = `${safeTeamNameFile}-rota-week-${weekNumber}-${weekYear}.xlsx`;
//         link.click();
//         // Clean up the URL object after download initiation
//         setTimeout(() => URL.revokeObjectURL(url), 100);
//     } catch (error) {
//         console.error("Error exporting to Excel:", error);
//         throw error; // Re-throw to be caught by the caller
//     }
// };
//
// // Function to load the PDF library dynamically (no changes needed)
// export const loadPdfLibrary = async (): Promise<{
//     jsPDF: typeof jsPDF;
//     html2canvas: typeof html2canvas;
// }> => {
//     const jsPDFModule = await import("jspdf");
//     const html2canvasModule = await import("html2canvas");
//     const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
//     const html2canvas = html2canvasModule.default || html2canvasModule;
//     return { jsPDF, html2canvas };
// };
//
// export const exportToPDF = async (
//     users: User[],
//     weekDays: Date[],
//     weekId: string,
//     weekNumber: number,
//     weekYear: string,
//     teamName: string,
//     getCellAssignments: (
//         userId: string,
//         dayIndex: number,
//         weekId: string,
//     ) => StoredAssignment[],
//     allLocations: HospLoc[],
//     shiftPresets: ShiftPreset[],
//     includeNotes: boolean,
//     includeEmptyCells: boolean,
// ): Promise<void> => {
//     try {
//         const doc = new jsPDF({
//             orientation: "landscape",
//             unit: "pt",
//             format: "a4",
//         });
//
//         const pageMargin = 40;
//         const pageWidth = doc.internal.pageSize.getWidth();
//         const usableWidth = pageWidth - 2 * pageMargin;
//
//         // --- Title ---
//         doc.setFontSize(16);
//         doc.setFont("helvetica", "bold");
//         const title = `${teamName} Staff Rota - Week ${weekNumber}, ${weekYear}`;
//         doc.text(title, pageWidth / 2, pageMargin, { align: "center" });
//
//         // --- Prepare Table Data (with inline styles for colors) ---
//         const head = [
//             [
//                 {
//                     content: "Staff Name",
//                     styles: { fontStyle: "bold", halign: "left" },
//                 },
//                 {
//                     content: "Role",
//                     styles: { fontStyle: "bold", halign: "left" },
//                 },
//                 ...weekDays.map((day) => ({
//                     content: format(day, "EEE\nMMM d"),
//                     styles: { fontStyle: "bold", halign: "center" },
//                 })),
//             ],
//         ];
//
//         const body = users.map((user) => {
//             const userName = `${user.firstName} ${user.lastName}`;
//             const userRole = user.jobTitle || user.role || "";
//
//             const assignmentCells = weekDays.map((day, dayIndex) => {
//                 const cellAssignments = getCellAssignments(
//                     user.id,
//                     dayIndex,
//                     weekId,
//                 );
//                 const isWeekend = day.getDay() === 0 || day.getDay() === 6;
//
//                 // --- Determine cell content and styles ---
//                 let cellContent: string | { content: string; styles } = "";
//                 const styles: {
//                     fillColor?: string;
//                     textColor?: string;
//                     fontStyle?: string;
//                 } = {};
//
//                 // 1. Determine Background Color
//                 let finalFillColor: string | null = null;
//                 if (cellAssignments.length > 0) {
//                     const firstShift = cellAssignments[0];
//                     const shiftColorHex = getShiftCssColor(
//                         firstShift.shiftType,
//                     );
//                     // Validate hex before assigning
//                     if (
//                         shiftColorHex &&
//                         /^#[0-9A-F]{6}$/i.test(shiftColorHex)
//                     ) {
//                         finalFillColor = shiftColorHex;
//                     }
//                 }
//                 // Apply weekend shading ONLY if no shift color is present
//                 if (!finalFillColor && isWeekend) {
//                     finalFillColor = "#F5F5F5"; // Light grey HEX for weekends
//                 }
//
//                 if (finalFillColor) {
//                     styles.fillColor = finalFillColor;
//                 }
//
//                 // 2. Determine Text Content and Text Styles
//                 if (cellAssignments.length > 0) {
//                     cellContent = cellAssignments
//                         .map((assignment) =>
//                             formatAssignmentForExport(
//                                 assignment,
//                                 allLocations,
//                                 shiftPresets,
//                                 includeNotes,
//                             ),
//                         )
//                         .join("\n\n"); // Double newline for separation
//                 } else if (includeEmptyCells) {
//                     cellContent = "No assignment";
//                     styles.textColor = "#999999"; // Grey text
//                     styles.fontStyle = "italic"; // Italic text
//                 } else {
//                     cellContent = ""; // Empty string for no assignment and not including empty cells
//                 }
//
//                 // 3. Return content with styles if styles are present
//                 if (Object.keys(styles).length > 0) {
//                     return { content: cellContent, styles: styles };
//                 } else {
//                     return cellContent; // Return plain string if no specific styles needed
//                 }
//             });
//
//             // Make user name cell bold directly in the data array
//             const nameCell = {
//                 content: userName,
//                 styles: { fontStyle: "bold" },
//             };
//
//             return [nameCell, userRole, ...assignmentCells];
//         });
//
//         // --- Calculate Column Widths ---
//         const nameColWidth = usableWidth * 0.1;
//         const roleColWidth = usableWidth * 0.08;
//         const dayColWidth =
//             (usableWidth - nameColWidth - roleColWidth) / weekDays.length;
//         const columnWidths = [
//             nameColWidth,
//             roleColWidth,
//             ...Array(weekDays.length).fill(dayColWidth),
//         ];
//
//         // --- Generate Table ---
//         let finalY = pageMargin + 20;
//         autoTable(doc, {
//             head: head,
//             body: body, // Body now contains content and styles objects
//             startY: finalY,
//             theme: "grid",
//             styles: {
//                 fontSize: 8,
//                 cellPadding: 4,
//                 overflow: "linebreak",
//                 valign: "top",
//                 lineWidth: 0.5,
//                 lineColor: "#CCCCCC", // Hex grid lines
//             },
//             headStyles: {
//                 fillColor: "#E0E0E0", // Hex header fill
//                 textColor: "#000000", // Hex header text
//                 fontStyle: "bold",
//                 lineWidth: 0.5,
//                 lineColor: "#999999", // Hex
//             },
//             columnStyles: {
//                 // Apply calculated widths
//                 // Name (col 0) is styled bold via the body data now
//                 0: { cellWidth: columnWidths[0] }, // Just set width
//                 1: { cellWidth: columnWidths[1] }, // Role column width
//                 ...weekDays.reduce((acc, _, index) => {
//                     acc[index + 2] = { cellWidth: columnWidths[index + 2] };
//                     return acc;
//                 }, {}),
//             },
//             // REMOVE or COMMENT OUT background drawing from didDrawCell
//             didDrawCell: (data) => {
//                 // Background color is now handled by styles in the 'body' data.
//                 // Keep this hook if you need to draw something *else* on top later.
//                 // Example: Maybe draw a small icon based on assignment type?
//                 if (data.section === "body" && data.column.index >= 2) {
//                     const cellData = data.cell.raw; // Access the raw data (string or object)
//                     if (
//                         typeof cellData === "object" &&
//                         cellData.content?.includes("On Call")
//                     ) {
//                         // Draw a phone icon or something
//                     }
//                 }
//             },
//         });
//
//         finalY = doc.lastAutoTable.finalY || finalY + 20;
//
//         // --- Add Legend ---
//         finalY += 20;
//         if (finalY > doc.internal.pageSize.getHeight() - pageMargin - 50) {
//             doc.addPage();
//             finalY = pageMargin;
//         }
//
//         doc.setFontSize(10);
//         doc.setFont("helvetica", "bold");
//         doc.text("Shift Types Legend", pageMargin, finalY);
//         finalY += 15;
//
//         // Prepare legend body with styles for the color swatch cell
//         const legendBody = shiftPresets.map((shift) => {
//             const colorHex = getShiftCssColor(shift.id);
//             const validatedColorHex =
//                 colorHex && /^#[0-9A-F]{6}$/i.test(colorHex)
//                     ? colorHex
//                     : "#FFFFFF"; // Default white
//
//             return [
//                 // Define the fillColor directly for the first cell
//                 {
//                     content: "",
//                     styles: { fillColor: validatedColorHex, cellPadding: 1 },
//                 },
//                 shift.name,
//                 shift.description || "",
//             ];
//         });
//
//         autoTable(doc, {
//             startY: finalY,
//             head: [["", "Shift", "Description"]],
//             body: legendBody, // Body contains the styled cells
//             theme: "plain", // Keep plain for legend clarity around swatches
//             styles: { fontSize: 9, cellPadding: 3 },
//             headStyles: { fontStyle: "bold" },
//             columnStyles: {
//                 0: { cellWidth: 20 }, // Width for swatch column
//                 1: { cellWidth: 80 },
//                 2: { cellWidth: "auto" },
//             },
//             // No need for didDrawCell for the swatch background now,
//             // but keep it if you want the border *around* the swatch fill
//             didDrawCell: (data) => {
//                 if (data.section === "body" && data.column.index === 0) {
//                     const shift = shiftPresets[data.row.index];
//                     const colorHex = getShiftCssColor(shift.id);
//                     if (colorHex && /^#[0-9A-F]{6}$/i.test(colorHex)) {
//                         // Draw border *around* the filled cell (autotable handles fill)
//                         doc.setDrawColor("#666666"); // Darker grey border for swatch
//                         doc.setLineWidth(0.5);
//                         const padding = 1; // Small padding inside the cell borders
//                         doc.rect(
//                             data.cell.x + padding,
//                             data.cell.y + padding,
//                             data.cell.width - 2 * padding,
//                             data.cell.height - 2 * padding,
//                             "S",
//                         ); // 'S' for Stroke (border only)
//                     }
//                 }
//             },
//         });
//
//         // --- Save PDF ---
//         const safeTeamNameFile = teamName
//             .replace(/[^a-z0-9]/gi, "_")
//             .toLowerCase();
//         const filename = `${safeTeamNameFile}-rota-week-${weekNumber}-year-${weekYear}.pdf`;
//         doc.save(filename);
//     } catch (error) {
//         console.error("Error exporting to PDF:", error);
//         alert("Failed to export PDF. Please check data and try again.");
//         throw error;
//     }
// };

// // src/components/rota/utils/export-utils.ts
//
// // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// //@ts-nocheck
// import { format } from "date-fns";
// import type { Assignment, ShiftPreset } from "@/types/rotaTypes";
// import { StoredAssignment } from "@/types/rotaTypes";
// import { formatTimeDisplay, getShiftPreset } from "./rota-utils";
// import { HospLoc } from "@/types/subDepTypes";
// import { User } from "@/types/userTypes";
// import { getColorObjectWithDefault } from "@/lib/helper/hospLoc/hospLocColors"; // Import your color helper
//
// import type Cell from "exceljs"; // Keep type import if possible
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import type html2canvas from "html2canvas"; // Import html2canvas type
//
// // --- Helper functions (getLocationName, formatAssignmentForExport) remain the same ---
// export const getLocationName = (
//     assignment: Assignment,
//     allLocations: HospLoc[],
// ): string => {
//     if (assignment.customLocation) {
//         return assignment.customLocation;
//     } else if (assignment.locationId) {
//         const location = allLocations.find(
//             (l) => l.id === assignment.locationId,
//         );
//         return location ? location.name : `Loc ID: ${assignment.locationId}`; // Added fallback
//     }
//     return "";
// };
//
// export const formatAssignmentForExport = (
//     assignment: Assignment,
//     allLocations: HospLoc[],
//     shiftPresets: ShiftPreset[],
//     includeNotes: boolean,
// ): string => {
//     const locationName = getLocationName(assignment, allLocations);
//     const shiftPreset = assignment.shiftType
//         ? getShiftPreset(assignment.shiftType)
//         : null;
//     let result = "";
//
//     if (locationName) {
//         if (shiftPreset) {
//             if (
//                 assignment.shiftType === "custom" &&
//                 assignment.customStartTime &&
//                 assignment.customEndTime
//             ) {
//                 result = `${locationName} (CUSTOM: ${formatTimeDisplay(assignment.customStartTime)} - ${formatTimeDisplay(assignment.customEndTime)})`;
//             } else {
//                 // Include shift name for clarity, even if color indicates location
//                 result = `${locationName} (${shiftPreset.name})`;
//             }
//         } else {
//             result = locationName;
//         }
//
//         if (includeNotes && assignment.notes) {
//             result += `\nNotes: ${assignment.notes}`;
//         }
//     }
//     return result;
// };
//
// // --- Export to CSV (No color changes needed, just added teamName) ---
// export const exportToCSV = (
//     users: User[],
//     weekDays: Date[],
//     weekId: string,
//     weekNumber: number,
//     weekYear: string,
//     teamName: string, // Added
//     getCellAssignments: (
//         userId: string,
//         dayIndex: number,
//         weekId: string,
//     ) => StoredAssignment[],
//     allLocations: HospLoc[],
//     shiftPresets: ShiftPreset[],
//     includeNotes: boolean,
//     includeEmptyCells: boolean,
// ): void => {
//     let csv = "User,Role,";
//     weekDays.forEach((day) => {
//         csv += `${format(day, "EEE MMM d")},`;
//     });
//     csv += "\n";
//
//     users.forEach((user) => {
//         csv += `"${user.firstName + " " + user.lastName}","${user.jobTitle || user.role || ""}",`;
//         weekDays.forEach((_, dayIndex) => {
//             const cellAssignments = getCellAssignments(
//                 user.id,
//                 dayIndex,
//                 weekId,
//             );
//             let cellText = "";
//             if (cellAssignments.length > 0) {
//                 cellText = cellAssignments
//                     .map(
//                         (assignment) =>
//                             formatAssignmentForExport(
//                                 assignment,
//                                 allLocations,
//                                 shiftPresets,
//                                 includeNotes,
//                             ).replace(/\n/g, "; "), // Replace newlines for CSV
//                     )
//                     .join("; "); // Separator for multiple assignments
//             } else if (includeEmptyCells) {
//                 cellText = "No assignment";
//             }
//             csv += `"${cellText.replace(/"/g, '""')}",`;
//         });
//         csv += "\n";
//     });
//
//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.setAttribute("href", url);
//     const safeTeamName = teamName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
//     link.setAttribute(
//         "download",
//         `rota-${safeTeamName}-week-${weekNumber}-${weekYear}.csv`,
//     );
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);
// };
//
// // --- Load Excel Library ---
// export const loadExcelLibrary = async (): Promise<typeof import("exceljs")> => {
//     const ExcelJS = await import("exceljs");
//     return ExcelJS.default || ExcelJS;
// };
//
// // --- Get Shift Color (LEGACY/FOR LEGEND ONLY) ---
// // This maps SHIFT TYPE to a color, primarily for the legend now.
// // Cell background will use location color.
// const getShiftTypeLegendColorArgb = (shiftType: string | null): string => {
//     // Use ARGB format (FF prefix for alpha)
//     switch (shiftType) {
//         case "am":
//             return "FFC6E0B4"; // Light Green
//         case "pm":
//             return "FFF8CBAD"; // Light Orange
//         case "late":
//             return "FFD9D2E9"; // Light Purple
//         case "longday":
//             return "FFF4B4B4"; // Light Red
//         case "custom":
//             return "FFBDD7EE"; // Light Blue
//         case "normal": // Use a distinct legend color or white
//         default:
//             return "FFFFFFFF"; // White/bland
//     }
// };
//
// // --- Export to Excel ---
// export const exportToExcel = async (
//     users: User[],
//     weekDays: Date[],
//     weekId: string,
//     weekNumber: number,
//     weekYear: string,
//     teamName: string, // Added
//     getCellAssignments: (
//         userId: string,
//         dayIndex: number,
//         weekId: string,
//     ) => StoredAssignment[],
//     allLocations: HospLoc[],
//     shiftPresets: ShiftPreset[],
//     includeNotes: boolean,
//     includeEmptyCells: boolean,
// ): Promise<void> => {
//     try {
//         const ExcelJS = await loadExcelLibrary();
//         const workbook = new ExcelJS.Workbook();
//         workbook.creator = "Weekly Rota System";
//         workbook.lastModifiedBy = "Weekly Rota System";
//         workbook.created = new Date();
//         workbook.modified = new Date();
//
//         const safeTeamNameSheet = teamName
//             .replace(/[*?:\\/\[\]]/g, "_")
//             .substring(0, 31);
//         const worksheet = workbook.addWorksheet(
//             `${safeTeamNameSheet} W${weekNumber}`,
//             {
//                 properties: { tabColor: { argb: "FF4472C4" } },
//             },
//         );
//
//         // --- Title Row ---
//         worksheet.mergeCells(1, 1, 1, weekDays.length + 2);
//         const titleCell = worksheet.getCell(1, 1);
//         titleCell.value = `${teamName} Staff Rota - Week ${weekNumber}, ${weekYear}`;
//         titleCell.font = {
//             name: "Arial",
//             size: 16,
//             bold: true,
//             color: { argb: "FFFFFFFF" },
//         };
//         titleCell.fill = {
//             type: "pattern",
//             pattern: "solid",
//             fgColor: { argb: "FF4472C4" },
//         };
//         titleCell.alignment = { horizontal: "center", vertical: "middle" };
//         worksheet.getRow(1).height = 30;
//
//         // --- Header Row ---
//         const headerRow = worksheet.getRow(2);
//         headerRow.values = [
//             "Staff Name",
//             "Role",
//             ...weekDays.map((day) => format(day, "EEE MMM d")),
//         ];
//         headerRow.font = { bold: true };
//         headerRow.height = 25;
//         headerRow.eachCell((cell: Cell) => {
//             cell.fill = {
//                 type: "pattern",
//                 pattern: "solid",
//                 fgColor: { argb: "FFD9E1F2" },
//             };
//             cell.alignment = { horizontal: "center", vertical: "middle" };
//             cell.border = {
//                 top: { style: "thin", color: { argb: "FF000000" } },
//                 left: { style: "thin", color: { argb: "FF000000" } },
//                 bottom: { style: "medium", color: { argb: "FF000000" } },
//                 right: { style: "thin", color: { argb: "FF000000" } },
//             };
//         });
//
//         // --- Data Rows ---
//         let rowIndex = 3;
//         users.forEach((user) => {
//             const dataRow = worksheet.getRow(rowIndex);
//             dataRow.getCell(1).value = user.firstName + " " + user.lastName;
//             dataRow.getCell(2).value = user.jobTitle || user.role || "";
//             dataRow.getCell(1).font = { bold: true };
//             dataRow.getCell(1).alignment = { vertical: "top", wrapText: true };
//             dataRow.getCell(2).alignment = { vertical: "top", wrapText: true };
//
//             weekDays.forEach((day, dayIndex) => {
//                 const cellAssignments = getCellAssignments(
//                     user.id,
//                     dayIndex,
//                     weekId,
//                 );
//                 const cell = dataRow.getCell(dayIndex + 3);
//                 const isWeekend = day.getDay() === 0 || day.getDay() === 6;
//
//                 let cellText = "";
//                 let locationColorArgb = "FFFFFFFF"; // Default White
//                 const defaultGrayArgb = "FFF5F5F5"; // Standard gray for weekends/empty default
//
//                 if (cellAssignments.length > 0) {
//                     const firstAssignment = cellAssignments[0];
//                     // --- Get Location Color ---
//                     const location = firstAssignment.locationId
//                         ? allLocations.find(
//                               (l) => l.id === firstAssignment.locationId,
//                           )
//                         : null;
//                     const locationColorObj = getColorObjectWithDefault(
//                         location?.color,
//                     ); // Get color object
//                     locationColorArgb =
//                         locationColorObj.colorClasses.excelFillArgb ||
//                         "FFFFFFFF"; // Use defined Excel ARGB color
//
//                     cellText = cellAssignments
//                         .map(
//                             (assignment, index) =>
//                                 formatAssignmentForExport(
//                                     assignment,
//                                     allLocations,
//                                     shiftPresets,
//                                     includeNotes,
//                                 ) +
//                                 (index < cellAssignments.length - 1
//                                     ? "\n\n"
//                                     : ""),
//                         )
//                         .join("");
//
//                     cell.value = cellText;
//                     cell.font = { color: { argb: "FF000000" } }; // Default black text, adjust if needed
//                 } else if (includeEmptyCells) {
//                     cell.value = "No assignment";
//                     cell.font = { italic: true, color: { argb: "FF999999" } };
//                     locationColorArgb = "FFFFFFFF"; // Use white for empty cell text
//                 }
//
//                 // Determine final fill color
//                 let finalBgColor = locationColorArgb;
//                 // Apply weekend gray ONLY if the location color is default white/grayish
//                 if (
//                     isWeekend &&
//                     (locationColorArgb === "FFFFFFFF" ||
//                         locationColorArgb === defaultGrayArgb)
//                 ) {
//                     finalBgColor = defaultGrayArgb; // Light Gray for weekends
//                 }
//
//                 cell.fill = {
//                     type: "pattern",
//                     pattern: "solid",
//                     fgColor: { argb: finalBgColor },
//                 };
//                 cell.border = {
//                     top: { style: "thin", color: { argb: "FFBFBFBF" } },
//                     left: { style: "thin", color: { argb: "FFBFBFBF" } },
//                     bottom: { style: "thin", color: { argb: "FFBFBFBF" } },
//                     right: { style: "thin", color: { argb: "FFBFBFBF" } },
//                 };
//                 cell.alignment = { wrapText: true, vertical: "top" };
//
//                 // Adjust row height estimate
//                 const lines = cellText.split("\n").length;
//                 const notesLines =
//                     includeNotes && cellAssignments[0]?.notes
//                         ? cellAssignments[0].notes.split("\n").length
//                         : 0;
//                 const requiredHeight = Math.max(
//                     15,
//                     (lines + notesLines + cellAssignments.length - 1) * 15,
//                 ); // Factor in assignment gaps
//                 dataRow.height = Math.max(dataRow.height || 15, requiredHeight);
//             });
//             dataRow.height = Math.max(dataRow.height || 15, 25); // Ensure minimum row height
//             rowIndex++;
//         });
//
//         // --- Auto-fit columns ---
//         worksheet.columns.forEach((column, i) => {
//             if (i === 0)
//                 column.width = 20; // Staff Name
//             else if (i === 1)
//                 column.width = 15; // Role
//             else {
//                 // Day columns
//                 let maxLength = 0;
//                 column.eachCell?.({ includeEmpty: true }, (cell: Cell) => {
//                     let cellLength = 0;
//                     if (cell.value) {
//                         const lines = cell.value.toString().split("\n");
//                         cellLength = lines.reduce(
//                             (max, line) => Math.max(max, line.length),
//                             0,
//                         );
//                     }
//                     maxLength = Math.max(maxLength, cellLength);
//                 });
//                 column.width = Math.max(
//                     15,
//                     maxLength < 10 ? 12 : maxLength + 4,
//                 ); // Min width 15, padding 4
//             }
//         });
//
//         // --- Legend (Uses SHIFT TYPE colors) ---
//         rowIndex += 1;
//         worksheet.mergeCells(rowIndex, 1, rowIndex, 3);
//         worksheet.getCell(rowIndex, 1).value = "Shift Types Legend";
//         worksheet.getCell(rowIndex, 1).font = { bold: true, size: 12 };
//         rowIndex++;
//         shiftPresets.forEach((shift) => {
//             const legendColorArgb = getShiftTypeLegendColorArgb(shift.id); // Use the legend helper
//             worksheet.getCell(rowIndex, 1).fill = {
//                 type: "pattern",
//                 pattern: "solid",
//                 fgColor: { argb: legendColorArgb },
//             };
//             worksheet.getCell(rowIndex, 1).border = {
//                 /* standard thin border */ top: { style: "thin" },
//                 left: { style: "thin" },
//                 bottom: { style: "thin" },
//                 right: { style: "thin" },
//             };
//             worksheet.getCell(rowIndex, 2).value = shift.name;
//             worksheet.getCell(rowIndex, 3).value = shift.description;
//             worksheet.getRow(rowIndex).height = 20;
//             rowIndex++;
//         });
//
//         // --- Generate file ---
//         const buffer = await workbook.xlsx.writeBuffer();
//         const blob = new Blob([buffer], {
//             type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//         });
//         const url = URL.createObjectURL(blob);
//         const link = document.createElement("a");
//         link.href = url;
//         const safeTeamNameFile = teamName
//             .replace(/[^a-z0-9]/gi, "_")
//             .toLowerCase();
//         link.download = `${safeTeamNameFile}-rota-week-${weekNumber}-${weekYear}.xlsx`;
//         link.click();
//         setTimeout(() => URL.revokeObjectURL(url), 100);
//     } catch (error) {
//         console.error("Error exporting to Excel:", error);
//         throw error;
//     }
// };
//
// // --- Load PDF Library ---
// export const loadPdfLibrary = async (): Promise<{
//     jsPDF: typeof jsPDF;
//     html2canvas: typeof html2canvas;
// }> => {
//     // Dynamic imports
//     const jsPDFModule = await import("jspdf");
//     const html2canvasModule = await import("html2canvas");
//     // Handle potential default exports
//     const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
//     const html2canvas = html2canvasModule.default || html2canvasModule;
//     // Ensure the imported values are constructors or objects with expected methods
//     if (
//         typeof jsPDF !== "function" ||
//         !html2canvas ||
//         typeof html2canvas !== "function"
//     ) {
//         throw new Error("Failed to load PDF generation libraries correctly.");
//     }
//     return { jsPDF, html2canvas };
// };
//
// // --- Get Shift Color (LEGACY/FOR LEGEND ONLY - PDF Hex) ---
// const getShiftTypeLegendColorHex = (
//     shiftType: string | null,
// ): string | null => {
//     switch (shiftType) {
//         case "COTE":
//             return "#DCFCE7";
//         case "MEDS":
//             return "#FFF7ED";
//         case "EMRG":
//             return "#DBEAFE";
//         case "SURG":
//             return "#FEE2E2";
//         default:
//             return null; // Return null for default/normal to allow weekend shading if needed
//     }
// };
//
// // --- Export to PDF ---
// export const exportToPDF = async (
//     users: User[],
//     weekDays: Date[],
//     weekId: string,
//     weekNumber: number,
//     weekYear: string,
//     teamName: string, // Added
//     getCellAssignments: (
//         userId: string,
//         dayIndex: number,
//         weekId: string,
//     ) => StoredAssignment[],
//     allLocations: HospLoc[],
//     shiftPresets: ShiftPreset[],
//     includeNotes: boolean,
//     includeEmptyCells: boolean,
// ): Promise<void> => {
//     try {
//         const { jsPDF } = await loadPdfLibrary(); // Only jsPDF needed here for autoTable
//         const doc = new jsPDF({
//             orientation: "landscape",
//             unit: "pt",
//             format: "a4",
//         });
//         const pageMargin = 40;
//         const pageWidth = doc.internal.pageSize.getWidth();
//         const usableWidth = pageWidth - 2 * pageMargin;
//
//         // --- Title ---
//         doc.setFontSize(16);
//         doc.setFont("helvetica", "bold");
//         doc.text(
//             `${teamName} Staff Rota - Week ${weekNumber}, ${weekYear}`,
//             pageWidth / 2,
//             pageMargin,
//             { align: "center" },
//         );
//
//         // --- Prepare Table Data ---
//         const head = [
//             [
//                 {
//                     content: "Staff Name",
//                     styles: { fontStyle: "bold", halign: "left" },
//                 },
//                 {
//                     content: "Role",
//                     styles: { fontStyle: "bold", halign: "left" },
//                 },
//                 ...weekDays.map((day) => ({
//                     content: format(day, "EEE\nMMM d"),
//                     styles: { fontStyle: "bold", halign: "center" },
//                 })),
//             ],
//         ];
//
//         const body = users.map((user) => {
//             const userNameCell = {
//                 content: `${user.firstName} ${user.lastName}`,
//                 styles: { fontStyle: "bold" },
//             };
//             const userRole = user.jobTitle || user.role || "";
//
//             const assignmentCells = weekDays.map((day, dayIndex) => {
//                 const cellAssignments = getCellAssignments(
//                     user.id,
//                     dayIndex,
//                     weekId,
//                 );
//                 const isWeekend = day.getDay() === 0 || day.getDay() === 6;
//                 const defaultGrayHex = "#F5F5F5"; // Weekend/Empty gray
//                 const defaultWhiteHex = "#FFFFFF";
//
//                 let cellContent: string | { content: string; styles } = "";
//                 const styles: {
//                     fillColor?: string;
//                     textColor?: string;
//                     fontStyle?: string;
//                 } = {};
//                 let locationColorHex: string | null = null;
//
//                 if (cellAssignments.length > 0) {
//                     const firstAssignment = cellAssignments[0];
//                     // --- Get Location Color ---
//                     const location = firstAssignment.locationId
//                         ? allLocations.find(
//                               (l) => l.id === firstAssignment.locationId,
//                           )
//                         : null;
//                     const locationColorObj = getColorObjectWithDefault(
//                         location?.color,
//                     );
//                     locationColorHex =
//                         locationColorObj.colorClasses.pdfFillHex || null; // Use defined PDF Hex color
//
//                     cellContent = cellAssignments
//                         .map((assignment) =>
//                             formatAssignmentForExport(
//                                 assignment,
//                                 allLocations,
//                                 shiftPresets,
//                                 includeNotes,
//                             ),
//                         )
//                         .join("\n\n"); // Double newline for separation
//                 } else if (includeEmptyCells) {
//                     cellContent = "No assignment";
//                     styles.textColor = "#999999";
//                     styles.fontStyle = "italic";
//                     locationColorHex = null; // No specific color for empty text cells
//                 }
//
//                 // Determine final fill color
//                 let finalFillColor = locationColorHex;
//                 // Apply weekend gray ONLY if the location color is null/default white/grayish
//                 if (
//                     isWeekend &&
//                     (!finalFillColor ||
//                         finalFillColor === defaultWhiteHex ||
//                         finalFillColor === defaultGrayHex)
//                 ) {
//                     finalFillColor = defaultGrayHex;
//                 }
//                 // Only add fillColor style if it's not null/white (which is default)
//                 if (finalFillColor && finalFillColor !== defaultWhiteHex) {
//                     styles.fillColor = finalFillColor;
//                 }
//
//                 if (Object.keys(styles).length > 0) {
//                     return { content: cellContent, styles: styles };
//                 } else {
//                     return cellContent;
//                 }
//             });
//
//             return [userNameCell, userRole, ...assignmentCells];
//         });
//
//         // --- Calculate Column Widths ---
//         const nameColWidth = usableWidth * 0.12;
//         const roleColWidth = usableWidth * 0.08;
//         const dayColWidth =
//             (usableWidth - nameColWidth - roleColWidth) / weekDays.length;
//         const columnWidths = [
//             nameColWidth,
//             roleColWidth,
//             ...Array(weekDays.length).fill(dayColWidth),
//         ];
//
//         // --- Generate Table ---
//         let finalY = pageMargin + 20;
//         autoTable(doc, {
//             head: head,
//             body: body,
//             startY: finalY,
//             theme: "grid",
//             styles: {
//                 fontSize: 7,
//                 cellPadding: 3,
//                 overflow: "linebreak",
//                 valign: "top",
//                 lineWidth: 0.5,
//                 lineColor: "#CCCCCC",
//             },
//             headStyles: {
//                 fillColor: "#E0E0E0",
//                 textColor: "#000000",
//                 fontStyle: "bold",
//                 lineWidth: 0.5,
//                 lineColor: "#999999",
//             },
//             columnStyles: {
//                 0: { cellWidth: columnWidths[0] },
//                 1: { cellWidth: columnWidths[1] },
//                 ...weekDays.reduce((acc, _, index) => {
//                     acc[index + 2] = { cellWidth: columnWidths[index + 2] };
//                     return acc;
//                 }, {}),
//             },
//         });
//
//         finalY = doc.lastAutoTable.finalY || finalY + 20;
//
//         // --- Add Legend (Uses SHIFT TYPE colors) ---
//         finalY += 20;
//         if (finalY > doc.internal.pageSize.getHeight() - pageMargin - 50) {
//             doc.addPage();
//             finalY = pageMargin;
//         }
//         doc.setFontSize(10);
//         doc.setFont("helvetica", "bold");
//         doc.text("Shift Types Legend", pageMargin, finalY);
//         finalY += 15;
//
//         const legendBody = shiftPresets.map((shift) => {
//             const legendColorHex = getShiftTypeLegendColorHex(shift.id); // Use legend helper
//             return [
//                 {
//                     content: "",
//                     styles: {
//                         fillColor: legendColorHex || "#FFFFFF",
//                         cellPadding: 1,
//                     },
//                 }, // Apply fill color
//                 shift.name,
//                 shift.description || "",
//             ];
//         });
//
//         autoTable(doc, {
//             startY: finalY,
//             head: [["", "Shift", "Description"]],
//             body: legendBody,
//             theme: "plain",
//             styles: { fontSize: 9, cellPadding: 3 },
//             headStyles: { fontStyle: "bold" },
//             columnStyles: {
//                 0: { cellWidth: 20 },
//                 1: { cellWidth: 80 },
//                 2: { cellWidth: "auto" },
//             },
//             didDrawCell: (data) => {
//                 // Draw border for swatch
//                 if (data.section === "body" && data.column.index === 0) {
//                     const shift = shiftPresets[data.row.index];
//                     const legendColorHex = getShiftTypeLegendColorHex(shift.id);
//                     if (legendColorHex) {
//                         // Only draw border if there's a color
//                         doc.setDrawColor("#666666");
//                         doc.setLineWidth(0.5);
//                         doc.rect(
//                             data.cell.x + 1,
//                             data.cell.y + 1,
//                             data.cell.width - 2,
//                             data.cell.height - 2,
//                             "S",
//                         );
//                     }
//                 }
//             },
//         });
//
//         // --- Save PDF ---
//         const safeTeamNameFile = teamName
//             .replace(/[^a-z0-9]/gi, "_")
//             .toLowerCase();
//         doc.save(
//             `${safeTeamNameFile}-rota-week-${weekNumber}-year-${weekYear}.pdf`,
//         );
//     } catch (error) {
//         console.error("Error exporting to PDF:", error);
//         alert("Failed to export PDF. Please check data and try again.");
//         throw error;
//     }
// };

// src/components/rota/utils/export-utils.ts

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import { format } from "date-fns";
import type { Assignment, ShiftPreset } from "@/types/rotaTypes";
import { StoredAssignment } from "@/types/rotaTypes";
import { formatTimeDisplay, getShiftPreset } from "./rota-utils";
import { HospLoc } from "@/types/subDepTypes";
import { User } from "@/types/userTypes";
import { getColorObjectWithDefault } from "@/lib/helper/hospLoc/hospLocColors";
import type Cell from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type html2canvas from "html2canvas";

const ROTA_LEGEND_ITEMS = [
    { text: "COTE", excelFillArgb: "FFDCFCE7", pdfFillHex: "#DCFCE7" },
    { text: "MEDS", excelFillArgb: "FFFFF7ED", pdfFillHex: "#FFF7ED" },
    { text: "EMRG", excelFillArgb: "FFDBEAFE", pdfFillHex: "#DBEAFE" },
    { text: "SURG", excelFillArgb: "FFFEE2E2", pdfFillHex: "#FEE2E2" },
];

export const getLocationName = (
    assignment: Assignment,
    allLocations: HospLoc[],
): string => {
    if (assignment.customLocation) {
        return assignment.customLocation;
    } else if (assignment.locationId) {
        const location = allLocations.find(
            (l) => l.id === assignment.locationId,
        );
        return location ? location.name : `Loc ID: ${assignment.locationId}`;
    }
    return "";
};

export const formatAssignmentForExport = (
    assignment: Assignment,
    allLocations: HospLoc[],
    shiftPresets: ShiftPreset[],
    includeNotes: boolean,
): string => {
    const locationName = getLocationName(assignment, allLocations);
    const shiftPreset = assignment.shiftType
        ? getShiftPreset(assignment.shiftType)
        : null;
    let result = "";

    if (locationName) {
        if (shiftPreset) {
            if (
                assignment.shiftType === "custom" &&
                assignment.customStartTime &&
                assignment.customEndTime
            ) {
                result = `${locationName} (CUSTOM: ${formatTimeDisplay(assignment.customStartTime)} - ${formatTimeDisplay(assignment.customEndTime)})`;
            } else {
                result = `${locationName} (${shiftPreset.name})`;
            }
        } else {
            result = locationName;
        }

        if (includeNotes && assignment.notes) {
            result += `\nNotes: ${assignment.notes}`;
        }
    }
    return result;
};

export const exportToCSV = (
    users: User[],
    weekDays: Date[],
    weekId: string,
    weekNumber: number,
    weekYear: string,
    teamName: string,
    getCellAssignments: (
        userId: string,
        dayIndex: number,
        weekId: string,
    ) => StoredAssignment[],
    allLocations: HospLoc[],
    shiftPresets: ShiftPreset[],
    includeNotes: boolean,
    includeEmptyCells: boolean,
): void => {
    let csv = "User,Role,";
    weekDays.forEach((day) => {
        csv += `${format(day, "EEE MMM d")},`;
    });
    csv += "\n";

    users.forEach((user) => {
        csv += `"${user.firstName + " " + user.lastName}","${user.jobTitle || user.role || ""}",`;
        weekDays.forEach((_, dayIndex) => {
            const cellAssignments = getCellAssignments(
                user.id,
                dayIndex,
                weekId,
            );
            let cellText = "";
            if (cellAssignments.length > 0) {
                cellText = cellAssignments
                    .map((assignment) =>
                        formatAssignmentForExport(
                            assignment,
                            allLocations,
                            shiftPresets,
                            includeNotes,
                        ).replace(/\n/g, "; "),
                    )
                    .join("; ");
            } else if (includeEmptyCells) {
                cellText = "No assignment";
            }
            csv += `"${cellText.replace(/"/g, '""')}",`;
        });
        csv += "\n";
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const safeTeamName = teamName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    link.setAttribute(
        "download",
        `rota-${safeTeamName}-week-${weekNumber}-${weekYear}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const loadExcelLibrary = async (): Promise<typeof import("exceljs")> => {
    const ExcelJS = await import("exceljs");
    return ExcelJS.default || ExcelJS;
};

export const exportToExcel = async (
    users: User[],
    weekDays: Date[],
    weekId: string,
    weekNumber: number,
    weekYear: string,
    teamName: string,
    getCellAssignments: (
        userId: string,
        dayIndex: number,
        weekId: string,
    ) => StoredAssignment[],
    allLocations: HospLoc[],
    shiftPresets: ShiftPreset[],
    includeNotes: boolean,
    includeEmptyCells: boolean,
): Promise<void> => {
    try {
        const ExcelJS = await loadExcelLibrary();
        const workbook = new ExcelJS.Workbook();
        workbook.creator = "Weekly Rota System";
        workbook.lastModifiedBy = "Weekly Rota System";
        workbook.created = new Date();
        workbook.modified = new Date();

        const safeTeamNameSheet = teamName
            .replace(/[*?:\\/\[\]]/g, "_")
            .substring(0, 31);
        const worksheet = workbook.addWorksheet(
            `${safeTeamNameSheet} W${weekNumber}`,
            {
                properties: { tabColor: { argb: "FF4472C4" } },
            },
        );

        worksheet.mergeCells(1, 1, 1, weekDays.length + 2);
        const titleCell = worksheet.getCell(1, 1);
        titleCell.value = `${teamName} Staff Rota - Week ${weekNumber}, ${weekYear}`;
        titleCell.font = {
            name: "Arial",
            size: 16,
            bold: true,
            color: { argb: "FFFFFFFF" },
        };
        titleCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF4472C4" },
        };
        titleCell.alignment = { horizontal: "center", vertical: "middle" };
        worksheet.getRow(1).height = 30;

        const headerRow = worksheet.getRow(2);
        headerRow.values = [
            "Staff Name",
            "Role",
            ...weekDays.map((day) => format(day, "EEE MMM d")),
        ];
        headerRow.font = { bold: true };
        headerRow.height = 25;
        headerRow.eachCell((cell: Cell) => {
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFD9E1F2" },
            };
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.border = {
                top: { style: "thin", color: { argb: "FF000000" } },
                left: { style: "thin", color: { argb: "FF000000" } },
                bottom: { style: "medium", color: { argb: "FF000000" } },
                right: { style: "thin", color: { argb: "FF000000" } },
            };
        });

        let rowIndex = 3;
        users.forEach((user) => {
            const dataRow = worksheet.getRow(rowIndex);
            dataRow.getCell(1).value = user.firstName + " " + user.lastName;
            dataRow.getCell(2).value = user.jobTitle || user.role || "";
            dataRow.getCell(1).font = { bold: true };
            dataRow.getCell(1).alignment = { vertical: "top", wrapText: true };
            dataRow.getCell(2).alignment = { vertical: "top", wrapText: true };

            weekDays.forEach((day, dayIndex) => {
                const cellAssignments = getCellAssignments(
                    user.id,
                    dayIndex,
                    weekId,
                );
                const cell = dataRow.getCell(dayIndex + 3);
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                let cellText = "";
                let locationColorArgb = "FFFFFFFF";
                const defaultGrayArgb = "FFF5F5F5";

                if (cellAssignments.length > 0) {
                    const firstAssignment = cellAssignments[0];
                    const location = firstAssignment.locationId
                        ? allLocations.find(
                              (l) => l.id === firstAssignment.locationId,
                          )
                        : null;
                    const locationColorObj = getColorObjectWithDefault(
                        location?.color,
                    );
                    locationColorArgb =
                        locationColorObj.colorClasses.excelFillArgb ||
                        "FFFFFFFF";

                    cellText = cellAssignments
                        .map(
                            (assignment, index) =>
                                formatAssignmentForExport(
                                    assignment,
                                    allLocations,
                                    shiftPresets,
                                    includeNotes,
                                ) +
                                (index < cellAssignments.length - 1
                                    ? "\n\n"
                                    : ""),
                        )
                        .join("");

                    cell.value = cellText;
                    cell.font = { color: { argb: "FF000000" } };
                } else if (includeEmptyCells) {
                    cell.value = "No assignment";
                    cell.font = { italic: true, color: { argb: "FF999999" } };
                    locationColorArgb = "FFFFFFFF";
                }

                let finalBgColor = locationColorArgb;
                if (
                    isWeekend &&
                    (locationColorArgb === "FFFFFFFF" ||
                        locationColorArgb === defaultGrayArgb)
                ) {
                    finalBgColor = defaultGrayArgb;
                }

                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: finalBgColor },
                };
                cell.border = {
                    top: { style: "thin", color: { argb: "FFBFBFBF" } },
                    left: { style: "thin", color: { argb: "FFBFBFBF" } },
                    bottom: { style: "thin", color: { argb: "FFBFBFBF" } },
                    right: { style: "thin", color: { argb: "FFBFBFBF" } },
                };
                cell.alignment = { wrapText: true, vertical: "top" };

                const lines = cellText.split("\n").length;
                const notesLines =
                    includeNotes && cellAssignments[0]?.notes
                        ? cellAssignments[0].notes.split("\n").length
                        : 0;
                const requiredHeight = Math.max(
                    15,
                    (lines + notesLines + cellAssignments.length - 1) * 15,
                );
                dataRow.height = Math.max(dataRow.height || 15, requiredHeight);
            });
            dataRow.height = Math.max(dataRow.height || 15, 25);
            rowIndex++;
        });

        worksheet.columns.forEach((column, i) => {
            if (i === 0) column.width = 20;
            else if (i === 1) column.width = 15;
            else {
                let maxLength = 0;
                column.eachCell?.({ includeEmpty: true }, (cell: Cell) => {
                    let cellLength = 0;
                    if (cell.value) {
                        const lines = cell.value.toString().split("\n");
                        cellLength = lines.reduce(
                            (max, line) => Math.max(max, line.length),
                            0,
                        );
                    }
                    maxLength = Math.max(maxLength, cellLength);
                });
                column.width = Math.max(
                    15,
                    maxLength < 10 ? 12 : maxLength + 4,
                );
            }
        });

        rowIndex += 1;
        worksheet.mergeCells(rowIndex, 1, rowIndex, 2);
        const legendTitle = worksheet.getCell(rowIndex, 1);
        legendTitle.value = "Rota Legend";
        legendTitle.font = { bold: true, size: 12 };
        legendTitle.alignment = { horizontal: "left" };
        rowIndex++;

        ROTA_LEGEND_ITEMS.forEach((item) => {
            const swatchCell = worksheet.getCell(rowIndex, 1);
            swatchCell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: item.excelFillArgb },
            };
            swatchCell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };

            const textCell = worksheet.getCell(rowIndex, 2);
            textCell.value = item.text;
            textCell.alignment = { vertical: "middle", horizontal: "left" };

            worksheet.getRow(rowIndex).height = 20;
            rowIndex++;
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const safeTeamNameFile = teamName
            .replace(/[^a-z0-9]/gi, "_")
            .toLowerCase();
        link.download = `${safeTeamNameFile}-rota-week-${weekNumber}-${weekYear}.xlsx`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
        console.error("Error exporting to Excel:", error);
        throw error;
    }
};

export const loadPdfLibrary = async (): Promise<{
    jsPDF: typeof jsPDF;
    html2canvas: typeof html2canvas;
}> => {
    const jsPDFModule = await import("jspdf");
    const html2canvasModule = await import("html2canvas");
    const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
    const html2canvas = html2canvasModule.default || html2canvasModule;
    if (
        typeof jsPDF !== "function" ||
        !html2canvas ||
        typeof html2canvas !== "function"
    ) {
        throw new Error("Failed to load PDF generation libraries correctly.");
    }
    return { jsPDF, html2canvas };
};

export const exportToPDF = async (
    users: User[],
    weekDays: Date[],
    weekId: string,
    weekNumber: number,
    weekYear: string,
    teamName: string,
    getCellAssignments: (
        userId: string,
        dayIndex: number,
        weekId: string,
    ) => StoredAssignment[],
    allLocations: HospLoc[],
    shiftPresets: ShiftPreset[],
    includeNotes: boolean,
    includeEmptyCells: boolean,
): Promise<void> => {
    try {
        const { jsPDF } = await loadPdfLibrary();
        const doc = new jsPDF({
            orientation: "landscape",
            unit: "pt",
            format: "a4",
        });
        const pageMargin = 40;
        const pageWidth = doc.internal.pageSize.getWidth();
        const usableWidth = pageWidth - 2 * pageMargin;

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(
            `${teamName} Staff Rota - Week ${weekNumber}, ${weekYear}`,
            pageWidth / 2,
            pageMargin,
            { align: "center" },
        );

        const head = [
            [
                {
                    content: "Staff Name",
                    styles: { fontStyle: "bold", halign: "left" },
                },
                {
                    content: "Role",
                    styles: { fontStyle: "bold", halign: "left" },
                },
                ...weekDays.map((day) => ({
                    content: format(day, "EEE\nMMM d"),
                    styles: { fontStyle: "bold", halign: "center" },
                })),
            ],
        ];

        const body = users.map((user) => {
            const userNameCell = {
                content: `${user.firstName} ${user.lastName}`,
                styles: { fontStyle: "bold" },
            };
            const userRole = user.jobTitle || user.role || "";

            const assignmentCells = weekDays.map((day, dayIndex) => {
                const cellAssignments = getCellAssignments(
                    user.id,
                    dayIndex,
                    weekId,
                );
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                const defaultGrayHex = "#F5F5F5";
                const defaultWhiteHex = "#FFFFFF";

                let cellContent: string | { content: string; styles } = "";
                const styles: {
                    fillColor?: string;
                    textColor?: string;
                    fontStyle?: string;
                } = {};
                let locationColorHex: string | null = null;

                if (cellAssignments.length > 0) {
                    const firstAssignment = cellAssignments[0];
                    const location = firstAssignment.locationId
                        ? allLocations.find(
                              (l) => l.id === firstAssignment.locationId,
                          )
                        : null;
                    const locationColorObj = getColorObjectWithDefault(
                        location?.color,
                    );
                    locationColorHex =
                        locationColorObj.colorClasses.pdfFillHex || null;

                    cellContent = cellAssignments
                        .map((assignment) =>
                            formatAssignmentForExport(
                                assignment,
                                allLocations,
                                shiftPresets,
                                includeNotes,
                            ),
                        )
                        .join("\n\n");
                } else if (includeEmptyCells) {
                    cellContent = "No assignment";
                    styles.textColor = "#999999";
                    styles.fontStyle = "italic";
                    locationColorHex = null;
                }

                let finalFillColor = locationColorHex;
                if (
                    isWeekend &&
                    (!finalFillColor ||
                        finalFillColor === defaultWhiteHex ||
                        finalFillColor === defaultGrayHex)
                ) {
                    finalFillColor = defaultGrayHex;
                }
                if (finalFillColor && finalFillColor !== defaultWhiteHex) {
                    styles.fillColor = finalFillColor;
                }

                if (Object.keys(styles).length > 0) {
                    return { content: cellContent, styles: styles };
                } else {
                    return cellContent;
                }
            });

            return [userNameCell, userRole, ...assignmentCells];
        });

        const nameColWidth = usableWidth * 0.12;
        const roleColWidth = usableWidth * 0.08;
        const dayColWidth =
            (usableWidth - nameColWidth - roleColWidth) / weekDays.length;
        const columnWidths = [
            nameColWidth,
            roleColWidth,
            ...Array(weekDays.length).fill(dayColWidth),
        ];

        let finalY = pageMargin + 20;
        autoTable(doc, {
            head: head,
            body: body,
            startY: finalY,
            theme: "grid",
            styles: {
                fontSize: 7,
                cellPadding: 3,
                overflow: "linebreak",
                valign: "top",
                lineWidth: 0.5,
                lineColor: "#CCCCCC",
            },
            headStyles: {
                fillColor: "#E0E0E0",
                textColor: "#000000",
                fontStyle: "bold",
                lineWidth: 0.5,
                lineColor: "#999999",
            },
            columnStyles: {
                0: { cellWidth: columnWidths[0] },
                1: { cellWidth: columnWidths[1] },
                ...weekDays.reduce((acc, _, index) => {
                    acc[index + 2] = { cellWidth: columnWidths[index + 2] };
                    return acc;
                }, {}),
            },
        });

        finalY = doc.lastAutoTable.finalY || finalY + 20;

        finalY += 20;
        if (finalY > doc.internal.pageSize.getHeight() - pageMargin - 50) {
            doc.addPage();
            finalY = pageMargin;
        }
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Rota Legend", pageMargin, finalY);
        finalY += 15;

        const legendBody = ROTA_LEGEND_ITEMS.map((item) => [
            {
                content: "",
                styles: { fillColor: item.pdfFillHex, cellPadding: 1 },
            },
            item.text,
        ]);

        autoTable(doc, {
            startY: finalY,
            body: legendBody,
            theme: "plain",
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fontStyle: "bold" },
            columnStyles: {
                0: { cellWidth: 20, halign: "center" },
                1: { cellWidth: "auto", halign: "left" },
            },
            didDrawCell: (data) => {
                if (data.section === "body" && data.column.index === 0) {
                    doc.setDrawColor("#666666");
                    doc.setLineWidth(0.5);
                    doc.rect(
                        data.cell.x + 1,
                        data.cell.y + 1,
                        data.cell.width - 2,
                        data.cell.height - 2,
                        "S",
                    );
                }
            },
        });

        const safeTeamNameFile = teamName
            .replace(/[^a-z0-9]/gi, "_")
            .toLowerCase();
        doc.save(
            `${safeTeamNameFile}-rota-week-${weekNumber}-year-${weekYear}.pdf`,
        );
    } catch (error) {
        console.error("Error exporting to PDF:", error);
        alert("Failed to export PDF. Please check data and try again.");
        throw error;
    }
};
