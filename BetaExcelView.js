import React, { useState } from 'react';
import { ExcelRenderer } from 'react-excel-renderer';
import { FaEdit, FaTrash, FaPlus, FaSave, FaFileExport } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import './ExcelEditor.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function ExcelEditor() {
    const [excelData, setExcelData] = useState([]);
    const [editingRow, setEditingRow] = useState(null);
    const [editingColumn, setEditingColumn] = useState(null);
    const [fileName, setFileName] = useState("");
    const [newColumnName, setNewColumnName] = useState("");

    const fileHandler = (event) => {
        const fileObj = event.target.files[0];
        if (!fileObj) return;

        setFileName(fileObj.name);
        ExcelRenderer(fileObj, (err, resp) => {
            if (err) {
                console.error("ExcelRenderer Error:", err);
                alert("Failed to read Excel file.");
                return;
            }

            if (resp?.rows) {
                const header = resp.rows[0] || [];
                const normalizedRows = resp.rows.map(row => {
                    const newRow = [...row];
                    while (newRow.length < header.length) {
                        newRow.push('');
                    }
                    return newRow;
                });
                setExcelData(normalizedRows);
            }
        });
    };

    // Row operations
    const handleEdit = (rowIndex) => {
        setEditingRow(rowIndex);
    };

    const handleSave = () => {
        setEditingRow(null);
    };

    const handleDelete = (rowIndex) => {
        const updated = [...excelData];
        updated.splice(rowIndex + 1, 1);
        setExcelData(updated);
        if (editingRow === rowIndex) setEditingRow(null);
    };

    const handleAdd = (rowIndex) => {
        const emptyRow = new Array(excelData[0].length).fill('');
        const updated = [...excelData];
        updated.splice(rowIndex + 1, 0, emptyRow);
        setExcelData(updated);
        setEditingRow(rowIndex + 1);
    };

    const handleChange = (rowIndex, cellIndex, value) => {
        const updated = [...excelData];
        updated[rowIndex + 1][cellIndex] = value;
        setExcelData(updated);
    };

    // Column operations
    const handleEditColumn = (colIndex) => {
        setEditingColumn(colIndex);
    };

    const handleSaveColumn = () => {
        setEditingColumn(null);
    };

    const handleDeleteColumn = (colIndex) => {
        const updated = excelData.map(row => {
            const newRow = [...row];
            newRow.splice(colIndex, 1);
            return newRow;
        });
        setExcelData(updated);
        if (editingColumn === colIndex) setEditingColumn(null);
    };

    const handleAddColumn = () => {
        const columnName = newColumnName || `Column ${excelData[0].length + 1}`;
        const updated = excelData.map((row, index) => {
            if (index === 0) {
                return [...row, columnName];
            }
            return [...row, ''];
        });
        setExcelData(updated);
        setNewColumnName("");
    };

    const handleColumnNameChange = (colIndex, value) => {
        const updated = [...excelData];
        updated[0][colIndex] = value;
        setExcelData(updated);
    };

    const exportToExcel = () => {
        if (excelData.length === 0) {
            alert("No data to export!");
            return;
        }

        // Create a new workbook
        const wb = XLSX.utils.book_new();

        // Convert our data to worksheet
        const ws = XLSX.utils.aoa_to_sheet(excelData);

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        // Generate file name
        const exportFileName = fileName ? `edited_${fileName}` : 'exported_data.xlsx';

        // Write the file and trigger download
        XLSX.writeFile(wb, exportFileName);
    };

    return (
        <div className="excel-editor-container">
            <div className="header-container">
                <h2 className="color-green">Excel Table Editor</h2>
                {excelData.length > 0 && (
                    <button
                        onClick={exportToExcel}
                        className="btn-export"
                        title=" Export to Excel"
                    >
                        <FaFileExport /> Export Excel
                    </button>
                )}
            </div>
            <div className="file-upload-container">
                <input
                    type="file"
                    onChange={fileHandler}
                    accept=".xlsx,.xls"
                    className="file-input"
                />
                {fileName && <p className="file-name">Loaded: {fileName}</p>}
            </div>
            <div className="container mt-5">
                <div
                    className="bg-gray text-white d-flex justify-content-center align-items-center"
                    style={{ width: '90%', height: '10px' }}
                >
                    APPLY REDUCTION
                </div>
            </div>

            {excelData.length > 0 && (
                <>
                    <div className="column-controls mb-3">
                        <div className="add-column-container">
                            <input
                                type="text"
                                value={newColumnName}
                                onChange={(e) => setNewColumnName(e.target.value)}
                                placeholder="New column name"
                                className="column-input"
                            />
                            <button
                                onClick={handleAddColumn}
                                className="btn-add-column"
                                title="Add Column"
                            >
                                <FaPlus /> Add Column
                            </button>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="excel-table">
                            <thead>
                                <tr className="table-header">
                                    <th className="action-column">Actions</th>
                                    {excelData[0].map((header, index) => (
                                        <th key={index} className="table-cell">
                                            {editingColumn === index ? (
                                                <div className="column-edit-container">
                                                    <input
                                                        value={header}
                                                        onChange={(e) => handleColumnNameChange(index, e.target.value)}
                                                        className="column-name-input"
                                                    />
                                                    <button
                                                        onClick={handleSaveColumn}
                                                        className="btn-save-column"
                                                        title="Save"
                                                    >
                                                        <FaSave />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="column-header-content">
                                                    {header || `Column ${index + 1}`}
                                                    <div className="column-actions">
                                                        <button
                                                            onClick={() => handleEditColumn(index)}
                                                            className="btn-edit-column"
                                                            title="Edit Column"
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteColumn(index)}
                                                            className="btn-delete-column"
                                                            title="Delete Column"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {excelData.slice(1).map((row, rowIndex) => (
                                    <tr key={rowIndex} className="table-row">
                                        <td className="action-buttons">
                                            {editingRow === rowIndex ? (
                                                <button
                                                    onClick={handleSave}
                                                    className="btn-save"
                                                    title="Save"
                                                >
                                                    <FaSave /> Save
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleEdit(rowIndex)}
                                                    className="btn-edit"
                                                    title="Edit"
                                                >
                                                    <FaEdit /> Edit
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(rowIndex)}
                                                className="btn-delete"
                                                title="Delete"
                                            >
                                                <FaTrash /> Delete
                                            </button>
                                            <button
                                                onClick={() => handleAdd(rowIndex)}
                                                className="btn-add"
                                                title="Add Row Below"
                                            >
                                                <FaPlus /> Add
                                            </button>
                                        </td>
                                        {row.map((cell, cellIndex) => (
                                            <td key={cellIndex} className="table-cell">
                                                {editingRow === rowIndex ? (
                                                    <input
                                                        value={cell}
                                                        onChange={(e) => handleChange(rowIndex, cellIndex, e.target.value)}
                                                        className="cell-input"
                                                    />
                                                ) : (
                                                    cell || ''
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

export default ExcelEditor;



// import React, { useState } from 'react';
// import { ExcelRenderer } from 'react-excel-renderer';
// import { FaEdit, FaTrash, FaPlus, FaSave, FaTimes } from 'react-icons/fa';
// import './ExcelEditor.css'; // Create this CSS file for custom styles
// import 'bootstrap/dist/css/bootstrap.min.css';

// function ExcelEditor() {
//     const [excelData, setExcelData] = useState([]);
//     const [editingRow, setEditingRow] = useState(null);
//     const [editingColumn, setEditingColumn] = useState(null);
//     const [fileName, setFileName] = useState("");
//     const [newColumnName, setNewColumnName] = useState("");

//     const fileHandler = (event) => {
//         const fileObj = event.target.files[0];
//         if (!fileObj) return;

//         setFileName(fileObj.name);
//         ExcelRenderer(fileObj, (err, resp) => {
//             if (err) {
//                 console.error("ExcelRenderer Error:", err);
//                 alert("Failed to read Excel file.");
//                 return;
//             }

//             if (resp?.rows) {
//                 const header = resp.rows[0] || [];
//                 const normalizedRows = resp.rows.map(row => {
//                     const newRow = [...row];
//                     while (newRow.length < header.length) {
//                         newRow.push('');
//                     }
//                     return newRow;
//                 });
//                 setExcelData(normalizedRows);
//             }
//         });
//     };

//     // Row operations
//     const handleEdit = (rowIndex) => {
//         setEditingRow(rowIndex);
//     };

//     const handleSave = () => {
//         setEditingRow(null);
//     };

//     const handleDelete = (rowIndex) => {
//         const updated = [...excelData];
//         updated.splice(rowIndex + 1, 1);
//         setExcelData(updated);
//         if (editingRow === rowIndex) setEditingRow(null);
//     };

//     const handleAdd = (rowIndex) => {
//         const emptyRow = new Array(excelData[0].length).fill('');
//         const updated = [...excelData];
//         updated.splice(rowIndex + 1, 0, emptyRow);
//         setExcelData(updated);
//         setEditingRow(rowIndex + 1);
//     };

//     const handleChange = (rowIndex, cellIndex, value) => {
//         const updated = [...excelData];
//         updated[rowIndex + 1][cellIndex] = value;
//         setExcelData(updated);
//     };

//     // Column operations
//     const handleEditColumn = (colIndex) => {
//         setEditingColumn(colIndex);
//     };

//     const handleSaveColumn = () => {
//         setEditingColumn(null);
//     };

//     const handleDeleteColumn = (colIndex) => {
//         const updated = excelData.map(row => {
//             const newRow = [...row];
//             newRow.splice(colIndex, 1);
//             return newRow;
//         });
//         setExcelData(updated);
//         if (editingColumn === colIndex) setEditingColumn(null);
//     };

//     const handleAddColumn = () => {
//         const columnName = newColumnName || `Column ${excelData[0].length + 1}`;
//         const updated = excelData.map((row, index) => {
//             if (index === 0) {
//                 return [...row, columnName];
//             }
//             return [...row, ''];
//         });
//         setExcelData(updated);
//         setNewColumnName("");
//     };

//     const handleColumnNameChange = (colIndex, value) => {
//         const updated = [...excelData];
//         updated[0][colIndex] = value;
//         setExcelData(updated);
//     };

//     return (
//         <div className="excel-editor-container">
//             <h2 className="color-green">Excel Table Editor</h2>
//             <div className="file-upload-container">
//                 <input
//                     type="file"
//                     onChange={fileHandler}
//                     accept=".xlsx,.xls"
//                     className="file-input"
//                 />
//                 {fileName && <p className="file-name">Loaded: {fileName}</p>}
//             </div>
//             <div className="container mt-5">
//                 <div
//                     className="bg-gray text-white d-flex justify-content-center align-items-center"
//                     style={{ width: '90%', height: '10px' }}
//                 >
//                     APPLY REDUCTION
//                 </div>
//             </div>

//             {excelData.length > 0 && (
//                 <>
//                     <div className="column-controls mb-3">
//                         <div className="add-column-container">
//                             <input
//                                 type="text"
//                                 value={newColumnName}
//                                 onChange={(e) => setNewColumnName(e.target.value)}
//                                 placeholder="New column name"
//                                 className="column-input"
//                             />
//                             <button
//                                 onClick={handleAddColumn}
//                                 className="btn-add-column"
//                                 title="Add Column"
//                             >
//                                 <FaPlus /> Add Column
//                             </button>
//                         </div>
//                     </div>

//                     <div className="table-responsive">
//                         <table className="excel-table">
//                             <thead>
//                                 <tr className="table-header">
//                                     <th className="action-column">Actions</th>
//                                     {excelData[0].map((header, index) => (
//                                         <th key={index} className="table-cell">
//                                             {editingColumn === index ? (
//                                                 <div className="column-edit-container">
//                                                     <input
//                                                         value={header}
//                                                         onChange={(e) => handleColumnNameChange(index, e.target.value)}
//                                                         className="column-name-input"
//                                                     />
//                                                     <button
//                                                         onClick={handleSaveColumn}
//                                                         className="btn-save-column"
//                                                         title="Save"
//                                                     >
//                                                         <FaSave />
//                                                     </button>
//                                                 </div>
//                                             ) : (
//                                                 <div className="column-header-content">
//                                                     {header || `Column ${index + 1}`}
//                                                     <div className="column-actions">
//                                                         <button
//                                                             onClick={() => handleEditColumn(index)}
//                                                             className="btn-edit-column"
//                                                             title="Edit Column"
//                                                         >
//                                                             <FaEdit />
//                                                         </button>
//                                                         <button
//                                                             onClick={() => handleDeleteColumn(index)}
//                                                             className="btn-delete-column"
//                                                             title="Delete Column"
//                                                         >
//                                                             <FaTrash />
//                                                         </button>
//                                                     </div>
//                                                 </div>
//                                             )}
//                                         </th>
//                                     ))}
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {excelData.slice(1).map((row, rowIndex) => (
//                                     <tr key={rowIndex} className="table-row">
//                                         <td className="action-buttons">
//                                             {editingRow === rowIndex ? (
//                                                 <button
//                                                     onClick={handleSave}
//                                                     className="btn-save"
//                                                     title="Save"
//                                                 >
//                                                     <FaSave /> Save
//                                                 </button>
//                                             ) : (
//                                                 <button
//                                                     onClick={() => handleEdit(rowIndex)}
//                                                     className="btn-edit"
//                                                     title="Edit"
//                                                 >
//                                                     <FaEdit /> Edit
//                                                 </button>
//                                             )}
//                                             <button
//                                                 onClick={() => handleDelete(rowIndex)}
//                                                 className="btn-delete"
//                                                 title="Delete"
//                                             >
//                                                 <FaTrash /> Delete
//                                             </button>
//                                             <button
//                                                 onClick={() => handleAdd(rowIndex)}
//                                                 className="btn-add"
//                                                 title="Add Row Below"
//                                             >
//                                                 <FaPlus /> Add
//                                             </button>
//                                         </td>
//                                         {row.map((cell, cellIndex) => (
//                                             <td key={cellIndex} className="table-cell">
//                                                 {editingRow === rowIndex ? (
//                                                     <input
//                                                         value={cell}
//                                                         onChange={(e) => handleChange(rowIndex, cellIndex, e.target.value)}
//                                                         className="cell-input"
//                                                     />
//                                                 ) : (
//                                                     cell || ''
//                                                 )}
//                                             </td>
//                                         ))}
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// }

// export default ExcelEditor;