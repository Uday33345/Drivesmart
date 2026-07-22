import zipfile
import xml.etree.ElementTree as ET
import os

def extract_docx_text(docx_path, output_path):
    print(f"Extracting text from DOCX: {docx_path}")
    if not os.path.exists(docx_path):
        print(f"Error: {docx_path} does not exist.")
        return
    try:
        with zipfile.ZipFile(docx_path, 'r') as docx:
            doc_xml = docx.read('word/document.xml')
            root = ET.fromstring(doc_xml)
            
            paragraphs = []
            for para in root.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
                texts = []
                for run in para.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t'):
                    if run.text:
                        texts.append(run.text)
                if texts:
                    paragraphs.append(''.join(texts))
            
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write('\n'.join(paragraphs))
            print(f"Successfully extracted DOCX text to {output_path}")
    except Exception as e:
        print(f"Error extracting DOCX: {e}")

def extract_xlsx_structure(xlsx_path, output_path):
    print(f"Extracting structure from XLSX: {xlsx_path}")
    if not os.path.exists(xlsx_path):
        print(f"Error: {xlsx_path} does not exist.")
        return
    try:
        with zipfile.ZipFile(xlsx_path, 'r') as xlsx:
            # 1. Read shared strings
            shared_strings = []
            try:
                ss_xml = xlsx.read('xl/sharedStrings.xml')
                ss_root = ET.fromstring(ss_xml)
                for si in ss_root.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t'):
                    shared_strings.append(si.text or '')
            except KeyError:
                pass
            
            # 2. Read workbook to map sheet IDs to names
            wb_xml = xlsx.read('xl/workbook.xml')
            wb_root = ET.fromstring(wb_xml)
            sheets = []
            for sheet in wb_root.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}sheet'):
                name = sheet.attrib.get('name')
                sheet_id = sheet.attrib.get('sheetId')
                r_id = sheet.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
                sheets.append({'name': name, 'id': sheet_id, 'r_id': r_id})
            
            # 3. Read sheets and parse cells
            output = []
            output.append(f"Sheets in file: {[s['name'] for s in sheets]}")
            
            file_names = xlsx.namelist()
            worksheet_files = [f for f in file_names if f.startswith('xl/worksheets/sheet')]
            worksheet_files.sort()
            
            for i, sheet_file in enumerate(worksheet_files):
                sheet_name = sheets[i]['name'] if i < len(sheets) else f"Sheet{i+1}"
                output.append(f"\n--- Sheet: {sheet_name} ({sheet_file}) ---")
                
                sheet_xml = xlsx.read(sheet_file)
                sheet_root = ET.fromstring(sheet_xml)
                
                rows = {}
                for row_el in sheet_root.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row'):
                    row_num = int(row_el.attrib.get('r', 1))
                    row_data = {}
                    for cell_el in row_el.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
                        cell_ref = cell_el.attrib.get('r', '')
                        cell_type = cell_el.attrib.get('t', '')
                        
                        val_el = cell_el.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                        val = val_el.text if val_el is not None else ''
                        
                        if cell_type == 's' and val:
                            idx = int(val)
                            if idx < len(shared_strings):
                                val = shared_strings[idx]
                        
                        col_ref = ''.join([c for c in cell_ref if c.isalpha()])
                        row_data[col_ref] = val
                    
                    rows[row_num] = row_data
                
                if rows:
                    max_row = max(rows.keys())
                    for r in range(1, max_row + 1):
                        if r in rows:
                            row_dict = rows[r]
                            # Get all columns sorted alphabetically
                            cols = sorted(row_dict.keys(), key=lambda x: (len(x), x))
                            row_str = " | ".join([f"{col}: {row_dict[col]}" for col in cols if row_dict[col]])
                            if row_str:
                                output.append(f"Row {r:02d}: {row_str}")
                else:
                    output.append("Empty sheet")
            
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write('\n'.join(output))
            print(f"Successfully extracted XLSX structure to {output_path}")
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error extracting XLSX: {e}")

if __name__ == "__main__":
    extract_docx_text("Git Live Automation Testing Setup.docx", "docx_content.txt")
    extract_xlsx_structure(r"e:\PDD App\node_modules\E2E_Test_Report_PancreaScan_2026-06-09T16-22-48.xlsx", "xlsx_content.txt")
