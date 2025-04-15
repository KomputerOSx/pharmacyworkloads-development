// // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// //@ts-nocheck
// import { format } from "date-fns";
// import type { Assignment, ShiftPreset } from "@/types/rotaTypes";
// import { getShiftPreset, formatTimeDisplay } from "./rota-utils";
// import { StoredAssignment } from "@/types/rotaTypes";
// import { HospLoc } from "@/types/subDepTypes";
// import { User } from "@/types/userTypes";
// import Cell from "exceljs/index";
//
// // Helper function to get location name
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
//         return location ? location.name : "";
//     }
//     return "";
// };
//
// // Helper function to format assignment for display
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
//     let csv = "user,Role,";
//
//     // Add days of the week to header
//     weekDays.forEach((day) => {
//         csv += `${format(day, "EEE MMM d")},`;
//     });
//     csv += "\n";
//
//     // Add data for each user member
//     users.forEach((user) => {
//         csv += `${user.firstName + " " + user.lastName},${user.jobTitle},`;
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
//                         cellText += formattedAssignment;
//                         if (index < cellAssignments.length - 1) {
//                             cellText += "; ";
//                         }
//                     }
//                 });
//             } else if (includeEmptyCells) {
//                 cellText = "No assignment";
//             }
//
//             csv += `"${cellText.replace(/"/g, '""')}",`;
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
//     link.setAttribute("download", `rota-week-${weekNumber}-${weekYear}.csv`);
//     link.style.visibility = "hidden";
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
// };
//
// // Function to load the Excel library dynamically
// export const loadExcelLibrary = async (): Promise<> => {
//     // We'll use the ExcelJS library
//     const ExcelJS = await import("exceljs");
//     return ExcelJS.default;
// };
//
// // Get color for shift type - update to use lighter colors
// const getShiftColor = (shiftType: string | null): string => {
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
// // Get CSS color for shift type (for PDF export)
// const getShiftCssColor = (shiftType: string | null): string => {
//     switch (shiftType) {
//         case "normal":
//             return "#FFFFFF"; // White/bland for normal shifts
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
//             return "#FFFFFF"; // White/bland
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
//         const worksheet = workbook.addWorksheet(`Week ${weekNumber}`, {
//             properties: { tabColor: { argb: "FF4472C4" } }, // Blue tab
//         });
//
//         // Create a title row
//         worksheet.mergeCells(1, 1, 1, weekDays.length + 2); // Merge cells for the title (user + role + days)
//         const titleCell = worksheet.getCell(1, 1);
//         titleCell.value = `Staff Rota - Week ${weekNumber}, ${weekYear}`;
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
//         // Style the header row
//         headerRow.font = { bold: true };
//         headerRow.height = 25;
//
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
//         // Add data for each user member
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
//             // Style user cells
//             dataRow.getCell(1).font = { bold: true };
//             dataRow.getCell(1).fill = {
//                 type: "pattern",
//                 pattern: "solid",
//                 fgColor: {
//                     argb: userIndex % 2 === 0 ? "FFF2F2F2" : "FFFFFFFF",
//                 }, // Alternating light gray/white
//             };
//             dataRow.getCell(2).fill = {
//                 type: "pattern",
//                 pattern: "solid",
//                 fgColor: {
//                     argb: userIndex % 2 === 0 ? "FFF2F2F2" : "FFFFFFFF",
//                 }, // Alternating light gray/white
//             };
//
//             // Add assignments for each day
//             weekDays.forEach((day, dayIndex) => {
//                 const cellAssignments = getCellAssignments(
//                     user.id,
//                     dayIndex,
//                     weekId,
//                 );
//                 const cell = dataRow.getCell(dayIndex + 3); // +3 because columns start at 1 and we have user and role
//
//                 // Check if it's a weekend
//                 const isWeekend = day.getDay() === 0 || day.getDay() === 6;
//                 const baseColor = isWeekend ? "FFF2F2F2" : "FFFFFFFF"; // Light gray for weekends, white for weekdays
//
//                 if (cellAssignments.length > 0) {
//                     // Format cell text - stack multiple assignments vertically
//                     let cellText = "";
//                     cellAssignments.forEach((assignment, index) => {
//                         const formattedAssignment = formatAssignmentForExport(
//                             assignment,
//                             allLocations,
//                             shiftPresets,
//                             includeNotes,
//                         );
//                         if (formattedAssignment) {
//                             if (index > 0) {
//                                 cellText += "\n\n"; // Add extra line between assignments
//                             }
//                             cellText += formattedAssignment;
//                         }
//                     });
//
//                     cell.value = cellText;
//
//                     // Apply styling based on the first assignment's shift type only
//                     const firstAssignment = cellAssignments[0];
//                     const shiftColor = getShiftColor(firstAssignment.shiftType);
//
//                     // Only apply background color if it's not a normal shift
//                     if (firstAssignment.shiftType !== "normal") {
//                         cell.fill = {
//                             type: "pattern",
//                             pattern: "solid",
//                             fgColor: { argb: "FF" + shiftColor },
//                         };
//                     } else {
//                         // For normal shifts, use the base color
//                         cell.fill = {
//                             type: "pattern",
//                             pattern: "solid",
//                             fgColor: { argb: baseColor },
//                         };
//                     }
//
//                     // Add borders
//                     cell.border = {
//                         top: { style: "thin", color: { argb: "FF000000" } },
//                         left: { style: "thin", color: { argb: "FF000000" } },
//                         bottom: { style: "thin", color: { argb: "FF000000" } },
//                         right: { style: "thin", color: { argb: "FF000000" } },
//                     };
//
//                     // Style text
//                     cell.font = {
//                         color: { argb: "FF000000" },
//                         bold: firstAssignment.shiftType === "longday", // Bold for long days
//                     };
//
//                     // Increase row height for multiple assignments
//                     if (cellAssignments.length > 1) {
//                         dataRow.height = Math.max(
//                             dataRow.height || 15,
//                             30 * cellAssignments.length,
//                         );
//                     }
//
//                     // Add notes styling
//                     if (includeNotes && firstAssignment.notes) {
//                         // Notes are already included in the text, just make sure the cell is tall enough
//                         dataRow.height = Math.max(dataRow.height || 15, 60); // Minimum height for cells with notes
//                     }
//                 } else if (includeEmptyCells) {
//                     cell.value = "No assignment";
//                     cell.font = { italic: true, color: { argb: "FF999999" } };
//                     cell.fill = {
//                         type: "pattern",
//                         pattern: "solid",
//                         fgColor: { argb: baseColor },
//                     };
//                 } else {
//                     // Empty cell with base color
//                     cell.fill = {
//                         type: "pattern",
//                         pattern: "solid",
//                         fgColor: { argb: baseColor },
//                     };
//                 }
//
//                 // Common cell styling
//                 cell.alignment = { wrapText: true, vertical: "top" };
//
//                 // Add thin borders to all cells
//                 if (!cell.border) {
//                     cell.border = {
//                         top: { style: "thin", color: { argb: "FF000000" } },
//                         left: { style: "thin", color: { argb: "FF000000" } },
//                         bottom: { style: "thin", color: { argb: "FF000000" } },
//                         right: { style: "thin", color: { argb: "FF000000" } },
//                     };
//                 }
//             });
//
//             // Set row height based on content
//             dataRow.height = Math.max(dataRow.height || 15, 30); // Minimum height
//
//             rowIndex++;
//         });
//
//         // Auto-fit columns based on content
//         const columnWidths = [25, 15]; // Default widths for user Name and Role
//
//         // Add default widths for day columns
//         weekDays.forEach(() => {
//             columnWidths.push(30);
//         });
//
//         // Set column widths
//         worksheet.columns.forEach((column, index) => {
//             if (index < columnWidths.length) {
//                 column.width = columnWidths[index];
//             }
//         });
//
//         // Add a legend
//         rowIndex += 2; // Add some space
//
//         // Legend title
//         worksheet.mergeCells(rowIndex, 1, rowIndex, 3);
//         const legendTitle = worksheet.getCell(rowIndex, 1);
//         legendTitle.value = "Shift Types Legend";
//         legendTitle.font = { bold: true, size: 12 };
//         legendTitle.alignment = { horizontal: "center" };
//         rowIndex++;
//
//         // Add each shift type with its color
//         shiftPresets.forEach((shift) => {
//             const shiftColor = getShiftColor(shift.id);
//             worksheet.getCell(rowIndex, 1).value = shift.name;
//             worksheet.getCell(rowIndex, 2).value = shift.description;
//
//             // Color the cell with the shift color
//             worksheet.getCell(rowIndex, 1).fill = {
//                 type: "pattern",
//                 pattern: "solid",
//                 fgColor: { argb: "FF" + shiftColor },
//             };
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
//         link.download = `rota-week-${weekNumber}-${weekYear}.xlsx`;
//         link.click();
//     } catch (error) {
//         console.error("Error exporting to Excel:", error);
//         throw error;
//     }
// };
//
// // Function to load the PDF library dynamically
// export const loadPdfLibrary = async (): Promise<> => {
//     // We'll use the jsPDF library with html2canvas
//     const jsPDF = await import("jspdf");
//     const html2canvas = await import("html2canvas");
//     return { jsPDF: jsPDF.default, html2canvas: html2canvas.default };
// };
//
// // Export to PDF
// export const exportToPDF = async (
//     users: User[],
//     weekDays: Date[],
//     weekId: string,
//     weekNumber: number,
//     weekYear: string,
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
//         // Create a temporary HTML table for the PDF with matching Excel styling
//         const tempTable = document.createElement("table");
//         tempTable.style.width = "100%";
//         tempTable.style.borderCollapse = "collapse";
//         tempTable.style.fontFamily = "Arial, sans-serif";
//         tempTable.style.fontSize = "10px";
//
//         // Create title row
//         const titleRow = document.createElement("tr");
//         const titleCell = document.createElement("th");
//         titleCell.textContent = `user Rota - Week ${weekNumber}, ${weekYear}`;
//         titleCell.style.backgroundColor = "#4472C4";
//         titleCell.style.color = "white";
//         titleCell.style.padding = "10px";
//         titleCell.style.fontSize = "16px";
//         titleCell.style.fontWeight = "bold";
//         titleCell.style.textAlign = "center";
//         titleCell.colSpan = weekDays.length + 2; // user + Role + Days
//         titleRow.appendChild(titleCell);
//         tempTable.appendChild(titleRow);
//
//         // Create header row
//         const headerRow = document.createElement("tr");
//
//         // user Name header
//         const userHeader = document.createElement("th");
//         userHeader.textContent = "Staff Name";
//         userHeader.style.border = "1px solid #000";
//         userHeader.style.borderBottom = "2px solid #000";
//         userHeader.style.padding = "8px";
//         userHeader.style.backgroundColor = "#D9E1F2";
//         userHeader.style.fontWeight = "bold";
//         userHeader.style.textAlign = "center";
//         headerRow.appendChild(userHeader);
//
//         // Role header
//         const roleHeader = document.createElement("th");
//         roleHeader.textContent = "Role";
//         roleHeader.style.border = "1px solid #000";
//         roleHeader.style.borderBottom = "2px solid #000";
//         roleHeader.style.padding = "8px";
//         roleHeader.style.backgroundColor = "#D9E1F2";
//         roleHeader.style.fontWeight = "bold";
//         roleHeader.style.textAlign = "center";
//         headerRow.appendChild(roleHeader);
//
//         // Day headers
//         weekDays.forEach((day) => {
//             const dayHeader = document.createElement("th");
//             dayHeader.textContent = format(day, "EEE MMM d");
//             dayHeader.style.border = "1px solid #000";
//             dayHeader.style.borderBottom = "2px solid #000";
//             dayHeader.style.padding = "8px";
//             dayHeader.style.backgroundColor = "#D9E1F2";
//             dayHeader.style.fontWeight = "bold";
//             dayHeader.style.textAlign = "center";
//             headerRow.appendChild(dayHeader);
//         });
//
//         tempTable.appendChild(headerRow);
//
//         // Add data rows
//         users.forEach((user, userIndex) => {
//             const row = document.createElement("tr");
//
//             // Alternating row background
//             const rowBgColor = userIndex % 2 === 0 ? "#F2F2F2" : "#FFFFFF";
//
//             // user name cell
//             const nameCell = document.createElement("td");
//             nameCell.textContent = user.firstName + " " + user.lastName;
//             nameCell.style.border = "1px solid #000";
//             nameCell.style.padding = "8px";
//             nameCell.style.backgroundColor = rowBgColor;
//             nameCell.style.fontWeight = "bold";
//             row.appendChild(nameCell);
//
//             // Role cell
//             const roleCell = document.createElement("td");
//             roleCell.textContent = user.jobTitle ? user.jobTitle : user.role;
//             roleCell.style.border = "1px solid #000";
//             roleCell.style.padding = "8px";
//             roleCell.style.backgroundColor = rowBgColor;
//             row.appendChild(roleCell);
//
//             // Day cells
//             weekDays.forEach((day, dayIndex) => {
//                 const cellAssignments = getCellAssignments(
//                     user.id,
//                     dayIndex,
//                     weekId,
//                 );
//                 const dayCell = document.createElement("td");
//                 dayCell.style.border = "1px solid #000";
//                 dayCell.style.padding = "8px";
//                 dayCell.style.verticalAlign = "top";
//
//                 // Check if it's a weekend
//                 const isWeekend = day.getDay() === 0 || day.getDay() === 6;
//                 const baseBgColor = isWeekend ? "#F2F2F2" : rowBgColor;
//
//                 if (cellAssignments.length > 0) {
//                     // Apply styling based on the first assignment's shift type
//                     const firstAssignment = cellAssignments[0];
//                     if (firstAssignment.shiftType !== "normal") {
//                         dayCell.style.backgroundColor = getShiftCssColor(
//                             firstAssignment.shiftType,
//                         );
//                     } else {
//                         dayCell.style.backgroundColor = baseBgColor;
//                     }
//
//                     // Add each assignment with proper spacing
//                     cellAssignments.forEach((assignment, i) => {
//                         const formattedAssignment = formatAssignmentForExport(
//                             assignment,
//                             allLocations,
//                             shiftPresets,
//                             includeNotes,
//                         );
//                         if (formattedAssignment) {
//                             if (i > 0) {
//                                 // Add spacing between assignments
//                                 dayCell.appendChild(
//                                     document.createElement("br"),
//                                 );
//                                 dayCell.appendChild(
//                                     document.createElement("br"),
//                                 );
//                             }
//
//                             // Split by newlines to handle notes properly
//                             const lines = formattedAssignment.split("\n");
//                             lines.forEach((line, lineIndex) => {
//                                 if (lineIndex > 0) {
//                                     dayCell.appendChild(
//                                         document.createElement("br"),
//                                     );
//                                 }
//                                 dayCell.appendChild(
//                                     document.createTextNode(line),
//                                 );
//                             });
//                         }
//                     });
//
//                     // If it's a long day shift, make text bold
//                     if (firstAssignment.shiftType === "longday") {
//                         dayCell.style.fontWeight = "bold";
//                     }
//                 } else if (includeEmptyCells) {
//                     dayCell.textContent = "No assignment";
//                     dayCell.style.color = "#999999";
//                     dayCell.style.fontStyle = "italic";
//                     dayCell.style.backgroundColor = baseBgColor;
//                 } else {
//                     dayCell.style.backgroundColor = baseBgColor;
//                 }
//
//                 row.appendChild(dayCell);
//             });
//
//             tempTable.appendChild(row);
//         });
//
//         // Add legend
//         const legendRow = document.createElement("tr");
//         const legendCell = document.createElement("td");
//         legendCell.colSpan = weekDays.length + 2;
//         legendCell.style.padding = "15px 8px 8px 8px";
//
//         const legendTitle = document.createElement("div");
//         legendTitle.textContent = "Shift Types Legend";
//         legendTitle.style.fontWeight = "bold";
//         legendTitle.style.fontSize = "12px";
//         legendTitle.style.marginBottom = "8px";
//         legendTitle.style.textAlign = "center";
//         legendCell.appendChild(legendTitle);
//
//         // Create legend table
//         const legendTable = document.createElement("table");
//         legendTable.style.width = "50%";
//         legendTable.style.margin = "0 auto";
//         legendTable.style.borderCollapse = "collapse";
//
//         shiftPresets.forEach((shift) => {
//             const shiftRow = document.createElement("tr");
//
//             const colorCell = document.createElement("td");
//             colorCell.style.width = "30px";
//             colorCell.style.backgroundColor = getShiftCssColor(shift.id);
//             colorCell.style.border = "1px solid #000";
//             colorCell.style.padding = "4px";
//             shiftRow.appendChild(colorCell);
//
//             const nameCell = document.createElement("td");
//             nameCell.textContent = shift.name;
//             nameCell.style.border = "1px solid #000";
//             nameCell.style.padding = "4px";
//             shiftRow.appendChild(nameCell);
//
//             const descCell = document.createElement("td");
//             descCell.textContent = shift.description;
//             descCell.style.border = "1px solid #000";
//             descCell.style.padding = "4px";
//             shiftRow.appendChild(descCell);
//
//             legendTable.appendChild(shiftRow);
//         });
//
//         legendCell.appendChild(legendTable);
//         legendRow.appendChild(legendCell);
//         tempTable.appendChild(legendRow);
//
//         // Add the table to the document temporarily
//         tempTable.style.position = "absolute";
//         tempTable.style.left = "-9999px";
//         document.body.appendChild(tempTable);
//
//         // Load the PDF library
//         const { jsPDF, html2canvas } = await loadPdfLibrary();
//
//         // Convert the table to canvas
//         const canvas = await html2canvas(tempTable, {
//             scale: 1,
//             useCORS: true,
//             logging: false,
//             allowTaint: true,
//         });
//
//         // Calculate PDF dimensions (landscape for wide tables)
//         const imgData = canvas.toDataURL("image/png");
//         const pdf = new jsPDF({
//             orientation: "landscape",
//             unit: "mm",
//         });
//
//         // Add the table image
//         const pdfWidth = pdf.internal.pageSize.getWidth();
//         const pdfHeight = pdf.internal.pageSize.getHeight();
//         const imgWidth = canvas.width;
//         const imgHeight = canvas.height;
//
//         // Scale to fit page width with margins
//         const scale = (pdfWidth - 20) / imgWidth;
//         const scaledHeight = imgHeight * scale;
//
//         pdf.addImage(imgData, "PNG", 10, 10, pdfWidth - 20, scaledHeight);
//
//         // If the table is too tall, handle pagination
//         if (scaledHeight > pdfHeight - 20) {
//             let remainingHeight = scaledHeight;
//             let currentPosition = 0;
//             let pagePosition = 10;
//
//             while (remainingHeight > 0) {
//                 const pageHeight = pdfHeight - 20;
//
//                 if (currentPosition > 0) {
//                     pdf.addPage();
//                     pagePosition = 10;
//                 }
//
//                 pdf.addImage(
//                     imgData,
//                     "PNG",
//                     10,
//                     pagePosition - currentPosition * scale,
//                     pdfWidth - 20,
//                     scaledHeight,
//                 );
//
//                 currentPosition += pageHeight / scale;
//                 remainingHeight -= pageHeight;
//             }
//         }
//
//         // Save the PDF
//         pdf.save(`rota-week-${weekNumber}-${weekYear}.pdf`);
//
//         // Remove the temporary table
//         document.body.removeChild(tempTable);
//     } catch (error) {
//         console.error("Error exporting to PDF:", error);
//         throw error;
//     }
// };

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import { format } from "date-fns";
import type { Assignment, ShiftPreset } from "@/types/rotaTypes";
import { StoredAssignment } from "@/types/rotaTypes";
import { formatTimeDisplay, getShiftPreset } from "./rota-utils";
import { HospLoc } from "@/types/subDepTypes";
import { User } from "@/types/userTypes";
import Cell from "exceljs/index";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Helper function to get location name (no changes needed)
export const getLocationName = (
    assignment: Assignment,
    allLocations: HospLoc[],
): string => {
    // ... (keep existing implementation)
    if (assignment.customLocation) {
        return assignment.customLocation;
    } else if (assignment.locationId) {
        const location = allLocations.find(
            (l) => l.id === assignment.locationId,
        );
        return location ? location.name : "";
    }
    return "";
};

// Helper function to format assignment for display (no changes needed)
export const formatAssignmentForExport = (
    assignment: Assignment,
    allLocations: HospLoc[],
    shiftPresets: ShiftPreset[],
    includeNotes: boolean,
): string => {
    // ... (keep existing implementation)
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
                // For custom shifts, include the actual times
                result = `${locationName} (CUSTOM: ${formatTimeDisplay(assignment.customStartTime)} - ${formatTimeDisplay(assignment.customEndTime)})`;
            } else {
                result = `${locationName} (${shiftPreset.name})`;
            }
        } else {
            result = locationName;
        }

        // Add notes if requested
        if (includeNotes && assignment.notes) {
            result += `\nNotes: ${assignment.notes}`;
        }
    }

    return result;
};

// Export to CSV
export const exportToCSV = (
    users: User[],
    weekDays: Date[],
    weekId: string,
    weekNumber: number,
    weekYear: string,
    teamName: string, // <-- Add teamName parameter
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
    // Create CSV header
    let csv = "User,Role,"; // Changed 'user' to 'User' for consistency

    // Add days of the week to header
    weekDays.forEach((day) => {
        csv += `${format(day, "EEE MMM d")},`;
    });
    csv += "\n";

    // Add data for each user member
    users.forEach((user) => {
        csv += `"${user.firstName + " " + user.lastName}","${user.jobTitle || user.role}",`; // Ensure names/roles with commas are quoted

        // Add assignments for each day
        weekDays.forEach((_, dayIndex) => {
            const cellAssignments = getCellAssignments(
                user.id,
                dayIndex,
                weekId,
            );
            let cellText = "";

            if (cellAssignments.length > 0) {
                cellAssignments.forEach((assignment, index) => {
                    const formattedAssignment = formatAssignmentForExport(
                        assignment,
                        allLocations,
                        shiftPresets,
                        includeNotes,
                    );
                    if (formattedAssignment) {
                        // Replace internal newlines with a character CSV readers might handle better,
                        // or just use space/semicolon. Sticking with semicolon for now.
                        const cleanAssignment = formattedAssignment.replace(
                            /\n/g,
                            "; ",
                        );
                        cellText += cleanAssignment;
                        if (index < cellAssignments.length - 1) {
                            cellText += "; "; // Separator for multiple assignments in one cell
                        }
                    }
                });
            } else if (includeEmptyCells) {
                cellText = "No assignment";
            }

            csv += `"${cellText.replace(/"/g, '""')}",`; // Ensure cell content is quoted and internal quotes escaped
        });

        csv += "\n";
    });

    // Create download link
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    // Use teamName in the filename
    const safeTeamName = teamName.replace(/[^a-z0-9]/gi, "_").toLowerCase(); // Sanitize team name for filename
    link.setAttribute(
        "download",
        `rota-${safeTeamName}-week-${weekNumber}-${weekYear}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Function to load the Excel library dynamically (no changes needed)
export const loadExcelLibrary = async (): Promise<> => {
    // Use `any` or specific ExcelJS type if preferred
    // We'll use the ExcelJS library
    const ExcelJS = await import("exceljs");
    return ExcelJS.default;
};

// Get color for shift type (no changes needed)
const getShiftColor = (shiftType: string | null): string => {
    // ... (keep existing implementation)
    switch (shiftType) {
        case "normal":
            return "FFFFFF"; // White/bland for normal shifts
        case "am":
            return "C6E0B4"; // Light Green
        case "pm":
            return "F8CBAD"; // Light Orange
        case "late":
            return "D9D2E9"; // Light Purple
        case "longday":
            return "F4B4B4"; // Light Red
        case "custom":
            return "BDD7EE"; // Light Blue
        default:
            return "FFFFFF"; // White/bland
    }
};

// Get CSS color for shift type (for PDF export) (no changes needed)
const getShiftCssColor = (shiftType: string | null): string | null => {
    switch (shiftType) {
        // case "normal": return "#FFFFFF"; // Let's use null for normal to allow weekend shading
        case "am":
            return "#C6E0B4"; // Light Green
        case "pm":
            return "#F8CBAD"; // Light Orange
        case "late":
            return "#D9D2E9"; // Light Purple
        case "longday":
            return "#F4B4B4"; // Light Red
        case "custom":
            return "#BDD7EE"; // Light Blue
        default:
            return null; // Return null for default/normal or unknown
    }
};

// Export to Excel with styling
export const exportToExcel = async (
    users: User[],
    weekDays: Date[],
    weekId: string,
    weekNumber: number,
    weekYear: string,
    teamName: string, // <-- Add teamName parameter
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

        // Add metadata
        workbook.creator = "Weekly Rota System";
        workbook.lastModifiedBy = "Weekly Rota System";
        workbook.created = new Date();
        workbook.modified = new Date();

        // Use teamName in worksheet name
        const safeTeamNameSheet = teamName
            .replace(/[*?:\\/\[\]]/g, "_")
            .substring(0, 31); // Sanitize for sheet name rules
        const worksheet = workbook.addWorksheet(
            `${safeTeamNameSheet} W${weekNumber}`,
            {
                properties: { tabColor: { argb: "FF4472C4" } }, // Blue tab
            },
        );

        // Create a title row - include teamName
        worksheet.mergeCells(1, 1, 1, weekDays.length + 2); // Merge cells for the title (user + role + days)
        const titleCell = worksheet.getCell(1, 1);
        titleCell.value = `${teamName} Staff Rota - Week ${weekNumber}, ${weekYear}`; // Use teamName here
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

        // Add column headers in row 2
        const headerRow = worksheet.getRow(2);
        headerRow.values = ["Staff Name", "Role"];

        // Add days of the week with dates
        weekDays.forEach((day, index) => {
            headerRow.getCell(index + 3).value = format(day, "EEE MMM d");
        });

        // Style the header row (no changes needed here)
        headerRow.font = { bold: true };
        headerRow.height = 25;
        headerRow.eachCell((cell: Cell) => {
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFD9E1F2" }, // Light blue background
            };
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.border = {
                top: { style: "thin", color: { argb: "FF000000" } },
                left: { style: "thin", color: { argb: "FF000000" } },
                bottom: { style: "medium", color: { argb: "FF000000" } },
                right: { style: "thin", color: { argb: "FF000000" } },
            };
        });

        // Add data for each user member (logic remains the same)
        let rowIndex = 3; // Start after header and title
        users.forEach((user, userIndex) => {
            const dataRow = worksheet.getRow(rowIndex);

            // user name and role cells
            dataRow.getCell(1).value = user.firstName + " " + user.lastName;
            dataRow.getCell(2).value = user.jobTitle
                ? user.jobTitle
                : user.role;

            // Style user cells (logic remains the same)
            dataRow.getCell(1).font = { bold: true };
            const rowBgColor = userIndex % 2 === 0 ? "FFF2F2F2" : "FFFFFFFF";
            dataRow.getCell(1).alignment = { vertical: "top", wrapText: true };
            dataRow.getCell(1).fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: rowBgColor },
            };

            dataRow.getCell(2).alignment = { vertical: "top", wrapText: true };
            dataRow.getCell(2).fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: rowBgColor },
            };

            // Add assignments for each day (logic remains the same)
            weekDays.forEach((day, dayIndex) => {
                const cellAssignments = getCellAssignments(
                    user.id,
                    dayIndex,
                    weekId,
                );
                const cell = dataRow.getCell(dayIndex + 3);

                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                const baseColor = isWeekend ? "FFF2F2F2" : "FFFFFFFF"; // Base color, might be overridden by shift color

                if (cellAssignments.length > 0) {
                    let cellText = "";
                    cellAssignments.forEach((assignment, index) => {
                        const formattedAssignment = formatAssignmentForExport(
                            assignment,
                            allLocations,
                            shiftPresets,
                            includeNotes,
                        );
                        if (formattedAssignment) {
                            if (index > 0) cellText += "\n\n"; // Use newline for Excel
                            cellText += formattedAssignment;
                        }
                    });
                    cell.value = cellText;

                    const firstAssignment = cellAssignments[0];
                    const shiftColor = getShiftColor(firstAssignment.shiftType);
                    // Apply specific shift color OR the alternating row background color
                    const finalBgColor =
                        firstAssignment.shiftType !== "normal"
                            ? "FF" + shiftColor
                            : baseColor;

                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: finalBgColor },
                    };

                    cell.border = {
                        top: { style: "thin", color: { argb: "FF000000" } },
                        left: { style: "thin", color: { argb: "FF000000" } },
                        bottom: { style: "thin", color: { argb: "FF000000" } },
                        right: { style: "thin", color: { argb: "FF000000" } },
                    };
                    cell.font = {
                        color: { argb: "FF000000" },
                        bold: firstAssignment.shiftType === "longday",
                    };

                    // Adjust row height based on content
                    const lines = cellText.split("\n").length;
                    const notesLines =
                        includeNotes && firstAssignment.notes
                            ? firstAssignment.notes.split("\n").length
                            : 0;
                    const requiredHeight = Math.max(
                        15,
                        (lines + notesLines) * 15,
                    ); // Estimate height
                    dataRow.height = Math.max(
                        dataRow.height || 15,
                        requiredHeight,
                        cellAssignments.length > 1
                            ? 30 * cellAssignments.length
                            : 0,
                    );
                } else if (includeEmptyCells) {
                    cell.value = "No assignment";
                    cell.font = { italic: true, color: { argb: "FF999999" } };
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: baseColor },
                    };
                    cell.border = {
                        top: { style: "thin", color: { argb: "FF000000" } },
                        left: { style: "thin", color: { argb: "FF000000" } },
                        bottom: { style: "thin", color: { argb: "FF000000" } },
                        right: { style: "thin", color: { argb: "FF000000" } },
                    };
                } else {
                    // Empty cell with base color and borders
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: baseColor },
                    };
                    cell.border = {
                        top: { style: "thin", color: { argb: "FF000000" } },
                        left: { style: "thin", color: { argb: "FF000000" } },
                        bottom: { style: "thin", color: { argb: "FF000000" } },
                        right: { style: "thin", color: { argb: "FF000000" } },
                    };
                }

                cell.alignment = { wrapText: true, vertical: "top" };
            });

            // Ensure minimum row height
            dataRow.height = Math.max(dataRow.height || 15, 25);

            rowIndex++;
        });

        // Auto-fit columns based on content (Adjusted for better fit)
        // worksheet.columns.forEach((column, i) => {
        //     let maxLength = 0;
        //     column.eachCell?.({ includeEmpty: true }, (cell) => {
        //         let cellLength = 0;
        //         if (cell.value) {
        //             // Consider newlines for width calculation
        //             const lines = cell.value.toString().split("\n");
        //             cellLength = lines.reduce(
        //                 (max, line) => Math.max(max, line.length),
        //                 0,
        //             );
        //         }
        //         if (cellLength > maxLength) {
        //             maxLength = cellLength;
        //         }
        //     });
        //     // Set width with padding, respecting defined minimums/defaults
        //     const defaultWidths = [10, 10, 30, 30, 30, 30, 30, 30, 30]; // User, Role, Days...
        //     const baseWidth = defaultWidths[i] || 30;
        //     column.width = Math.max(
        //         baseWidth,
        //         maxLength < 10 ? 10 : maxLength + 4,
        //     );
        // });
        worksheet.columns.forEach((column, i) => {
            if (i === 0) {
                column.width = 20;
            } else if (i === 1) {
                column.width = 15;
            } else {
                let maxLength = 0;
                column.eachCell?.({ includeEmpty: true }, (cell) => {
                    let cellLength = 0;
                    if (cell.value) {
                        // Consider newlines for width calculation
                        const lines = cell.value.toString().split("\n");
                        cellLength = lines.reduce(
                            (max, line) => Math.max(max, line.length),
                            0,
                        );
                    }
                    if (cellLength > maxLength) {
                        maxLength = cellLength;
                    }
                });

                const baseWidthForDays = 30;

                column.width = Math.max(
                    baseWidthForDays,
                    maxLength < 10 ? 10 : maxLength + 4, // Calculate width based on content + padding
                );
            }
        });

        // Add a legend (logic remains the same)
        rowIndex += 1; // Add some space
        worksheet.mergeCells(rowIndex, 1, rowIndex, 3);
        const legendTitle = worksheet.getCell(rowIndex, 1);
        legendTitle.value = "Shift Types Legend";
        legendTitle.font = { bold: true, size: 12 };
        legendTitle.alignment = { horizontal: "left" }; // Align left might look better
        rowIndex++;

        shiftPresets.forEach((shift) => {
            const shiftColor = getShiftColor(shift.id);
            // Color cell
            worksheet.getCell(rowIndex, 1).fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FF" + shiftColor },
            };
            worksheet.getCell(rowIndex, 1).border = {
                top: { style: "thin", color: { argb: "FF000000" } },
                left: { style: "thin", color: { argb: "FF000000" } },
                bottom: { style: "thin", color: { argb: "FF000000" } },
                right: { style: "thin", color: { argb: "FF000000" } },
            };
            // Shift Name
            worksheet.getCell(rowIndex, 2).value = shift.name;
            worksheet.getCell(rowIndex, 2).alignment = { vertical: "middle" };
            // Shift Description
            worksheet.getCell(rowIndex, 3).value = shift.description;
            worksheet.getCell(rowIndex, 3).alignment = { vertical: "middle" };
            worksheet.getRow(rowIndex).height = 20; // Ensure legend rows are tall enough

            rowIndex++;
        });

        // Generate the Excel file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        // Use teamName in the filename
        const safeTeamNameFile = teamName
            .replace(/[^a-z0-9]/gi, "_")
            .toLowerCase();
        link.download = `${safeTeamNameFile}-rota-week-${weekNumber}-${weekYear}.xlsx`;
        link.click();
        // Clean up the URL object after download initiation
        setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
        console.error("Error exporting to Excel:", error);
        throw error; // Re-throw to be caught by the caller
    }
};

// Function to load the PDF library dynamically (no changes needed)
export const loadPdfLibrary = async (): Promise<{
    jsPDF: typeof jsPDF;
    html2canvas: typeof html2canvas;
}> => {
    const jsPDFModule = await import("jspdf");
    const html2canvasModule = await import("html2canvas");
    const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
    const html2canvas = html2canvasModule.default || html2canvasModule;
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
        const doc = new jsPDF({
            orientation: "landscape",
            unit: "pt",
            format: "a4",
        });

        const pageMargin = 40;
        const pageWidth = doc.internal.pageSize.getWidth();
        const usableWidth = pageWidth - 2 * pageMargin;

        // --- Title ---
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        const title = `${teamName} Staff Rota - Week ${weekNumber}, ${weekYear}`;
        doc.text(title, pageWidth / 2, pageMargin, { align: "center" });

        // --- Prepare Table Data (with inline styles for colors) ---
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
            const userName = `${user.firstName} ${user.lastName}`;
            const userRole = user.jobTitle || user.role || "";

            const assignmentCells = weekDays.map((day, dayIndex) => {
                const cellAssignments = getCellAssignments(
                    user.id,
                    dayIndex,
                    weekId,
                );
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                // --- Determine cell content and styles ---
                let cellContent: string | { content: string; styles } = "";
                const styles: {
                    fillColor?: string;
                    textColor?: string;
                    fontStyle?: string;
                } = {};

                // 1. Determine Background Color
                let finalFillColor: string | null = null;
                if (cellAssignments.length > 0) {
                    const firstShift = cellAssignments[0];
                    const shiftColorHex = getShiftCssColor(
                        firstShift.shiftType,
                    );
                    // Validate hex before assigning
                    if (
                        shiftColorHex &&
                        /^#[0-9A-F]{6}$/i.test(shiftColorHex)
                    ) {
                        finalFillColor = shiftColorHex;
                    }
                }
                // Apply weekend shading ONLY if no shift color is present
                if (!finalFillColor && isWeekend) {
                    finalFillColor = "#F5F5F5"; // Light grey HEX for weekends
                }

                if (finalFillColor) {
                    styles.fillColor = finalFillColor;
                }

                // 2. Determine Text Content and Text Styles
                if (cellAssignments.length > 0) {
                    cellContent = cellAssignments
                        .map((assignment) =>
                            formatAssignmentForExport(
                                assignment,
                                allLocations,
                                shiftPresets,
                                includeNotes,
                            ),
                        )
                        .join("\n\n"); // Double newline for separation
                } else if (includeEmptyCells) {
                    cellContent = "No assignment";
                    styles.textColor = "#999999"; // Grey text
                    styles.fontStyle = "italic"; // Italic text
                } else {
                    cellContent = ""; // Empty string for no assignment and not including empty cells
                }

                // 3. Return content with styles if styles are present
                if (Object.keys(styles).length > 0) {
                    return { content: cellContent, styles: styles };
                } else {
                    return cellContent; // Return plain string if no specific styles needed
                }
            });

            // Make user name cell bold directly in the data array
            const nameCell = {
                content: userName,
                styles: { fontStyle: "bold" },
            };

            return [nameCell, userRole, ...assignmentCells];
        });

        // --- Calculate Column Widths ---
        const nameColWidth = usableWidth * 0.1;
        const roleColWidth = usableWidth * 0.08;
        const dayColWidth =
            (usableWidth - nameColWidth - roleColWidth) / weekDays.length;
        const columnWidths = [
            nameColWidth,
            roleColWidth,
            ...Array(weekDays.length).fill(dayColWidth),
        ];

        // --- Generate Table ---
        let finalY = pageMargin + 20;
        autoTable(doc, {
            head: head,
            body: body, // Body now contains content and styles objects
            startY: finalY,
            theme: "grid",
            styles: {
                fontSize: 8,
                cellPadding: 4,
                overflow: "linebreak",
                valign: "top",
                lineWidth: 0.5,
                lineColor: "#CCCCCC", // Hex grid lines
            },
            headStyles: {
                fillColor: "#E0E0E0", // Hex header fill
                textColor: "#000000", // Hex header text
                fontStyle: "bold",
                lineWidth: 0.5,
                lineColor: "#999999", // Hex
            },
            columnStyles: {
                // Apply calculated widths
                // Name (col 0) is styled bold via the body data now
                0: { cellWidth: columnWidths[0] }, // Just set width
                1: { cellWidth: columnWidths[1] }, // Role column width
                ...weekDays.reduce((acc, _, index) => {
                    acc[index + 2] = { cellWidth: columnWidths[index + 2] };
                    return acc;
                }, {}),
            },
            // REMOVE or COMMENT OUT background drawing from didDrawCell
            didDrawCell: (data) => {
                // Background color is now handled by styles in the 'body' data.
                // Keep this hook if you need to draw something *else* on top later.
                // Example: Maybe draw a small icon based on assignment type?
                if (data.section === "body" && data.column.index >= 2) {
                    const cellData = data.cell.raw; // Access the raw data (string or object)
                    if (
                        typeof cellData === "object" &&
                        cellData.content?.includes("On Call")
                    ) {
                        // Draw a phone icon or something
                    }
                }
            },
        });

        finalY = doc.lastAutoTable.finalY || finalY + 20;

        // --- Add Legend ---
        finalY += 20;
        if (finalY > doc.internal.pageSize.getHeight() - pageMargin - 50) {
            doc.addPage();
            finalY = pageMargin;
        }

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Shift Types Legend", pageMargin, finalY);
        finalY += 15;

        // Prepare legend body with styles for the color swatch cell
        const legendBody = shiftPresets.map((shift) => {
            const colorHex = getShiftCssColor(shift.id);
            const validatedColorHex =
                colorHex && /^#[0-9A-F]{6}$/i.test(colorHex)
                    ? colorHex
                    : "#FFFFFF"; // Default white

            return [
                // Define the fillColor directly for the first cell
                {
                    content: "",
                    styles: { fillColor: validatedColorHex, cellPadding: 1 },
                },
                shift.name,
                shift.description || "",
            ];
        });

        autoTable(doc, {
            startY: finalY,
            head: [["", "Shift", "Description"]],
            body: legendBody, // Body contains the styled cells
            theme: "plain", // Keep plain for legend clarity around swatches
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fontStyle: "bold" },
            columnStyles: {
                0: { cellWidth: 20 }, // Width for swatch column
                1: { cellWidth: 80 },
                2: { cellWidth: "auto" },
            },
            // No need for didDrawCell for the swatch background now,
            // but keep it if you want the border *around* the swatch fill
            didDrawCell: (data) => {
                if (data.section === "body" && data.column.index === 0) {
                    const shift = shiftPresets[data.row.index];
                    const colorHex = getShiftCssColor(shift.id);
                    if (colorHex && /^#[0-9A-F]{6}$/i.test(colorHex)) {
                        // Draw border *around* the filled cell (autotable handles fill)
                        doc.setDrawColor("#666666"); // Darker grey border for swatch
                        doc.setLineWidth(0.5);
                        const padding = 1; // Small padding inside the cell borders
                        doc.rect(
                            data.cell.x + padding,
                            data.cell.y + padding,
                            data.cell.width - 2 * padding,
                            data.cell.height - 2 * padding,
                            "S",
                        ); // 'S' for Stroke (border only)
                    }
                }
            },
        });

        // --- Save PDF ---
        const safeTeamNameFile = teamName
            .replace(/[^a-z0-9]/gi, "_")
            .toLowerCase();
        const filename = `${safeTeamNameFile}-rota-week-${weekNumber}-year-${weekYear}.pdf`;
        doc.save(filename);
    } catch (error) {
        console.error("Error exporting to PDF:", error);
        alert("Failed to export PDF. Please check data and try again.");
        throw error;
    }
};
