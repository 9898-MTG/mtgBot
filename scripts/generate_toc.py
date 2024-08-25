import os

def generate_toc(start_path):
    toc = []
    for root, dirs, files in os.walk(start_path):
        level = root.replace(start_path, '').count(os.sep)
        indent = ' ' * 4 * level
        toc.append(f'{indent}- {os.path.basename(root)}/')
        sub_indent = ' ' * 4 * (level + 1)
        for f in files:
            toc.append(f'{sub_indent}- {f}')
    return '\n'.join(toc)

start_path = '.'  # Change this to your directory path
toc = generate_toc(start_path)

with open('TOC.md', 'w') as f:
    f.write('# Table of Contents\n\n')
    f.write(toc)

print("Table of Contents generated in TOC.md")
