import os
import string

def get_drives():
    drives = []
    for letter in string.ascii_uppercase:
        drive = f"{letter}:\\"
        if os.path.exists(drive):
            drives.append(drive)
    return drives

output = []
drives = get_drives()
output.append(f"Available drives: {drives}")

found_files = []
for drive in drives:
    output.append(f"Scanning drive: {drive} ...")
    try:
        for root, dirs, files in os.walk(drive):
            dirs_to_exclude = [
                "Windows", "Program Files", "Program Files (x86)", 
                "AppData", "node_modules", ".git", ".gradle", ".cargo"
            ]
            dirs[:] = [d for d in dirs if d not in dirs_to_exclude]
            
            for file in files:
                if file.lower().endswith(".xlsx"):
                    full_path = os.path.join(root, file)
                    found_files.append(full_path)
                    output.append(f"Found xlsx: {full_path}")
                    if len(found_files) >= 50:
                        break
            if len(found_files) >= 50:
                break
    except Exception as e:
        output.append(f"Error scanning {drive}: {e}")

output.append(f"Search completed. Found {len(found_files)} files total.")
for f in found_files:
    output.append(f" - {f}")

with open("find_results_v3.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(output))
print("Search done. Written to find_results_v3.txt")
