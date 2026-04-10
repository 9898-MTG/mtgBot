"""
Generate a Table of Contents (TOC) from the project directory structure.

Improvements over original:
- Error handling for filesystem operations
- Configurable exclusion patterns
- Nested directory support with depth limiting
- Link validation for referenced files
- Command-line arguments support

Usage:
    python scripts/generate_toc.py [directory] [--max-depth N] [--validate-links]
"""

import os
import sys
import argparse

# Directories to exclude from the TOC
EXCLUDED_DIRS = {
    'node_modules', '.git', 'obj', 'bin', '.vs', '__pycache__',
    '__tests__', '.github'
}

# File extensions to include
INCLUDED_EXTENSIONS = {
    '.md', '.html', '.js', '.json', '.py', '.css', '.cs', '.razor',
    '.yml', '.yaml', '.txt'
}


def generate_toc(start_path, max_depth=None, validate_links=False):
    """
    Generate a table of contents from the directory structure.

    Args:
        start_path: Root directory to scan
        max_depth: Maximum directory depth (None for unlimited)
        validate_links: Whether to validate that linked files exist

    Returns:
        tuple: (toc_string, broken_links_list)
    """
    toc = []
    broken_links = []

    if not os.path.isdir(start_path):
        print(f"Error: '{start_path}' is not a valid directory", file=sys.stderr)
        sys.exit(1)

    for root, dirs, files in os.walk(start_path):
        # Filter excluded directories (modifying dirs in-place skips them)
        dirs[:] = sorted([d for d in dirs if d not in EXCLUDED_DIRS and not d.startswith('.')])

        # Calculate depth relative to start
        rel_path = os.path.relpath(root, start_path)
        level = 0 if rel_path == '.' else rel_path.count(os.sep) + 1

        # Enforce max depth
        if max_depth is not None and level > max_depth:
            dirs.clear()
            continue

        # Directory entry
        indent = '    ' * level
        dir_name = os.path.basename(root) if rel_path != '.' else os.path.basename(os.path.abspath(start_path))
        toc.append(f'{indent}- **{dir_name}/**')

        # File entries
        sub_indent = '    ' * (level + 1)
        for f in sorted(files):
            ext = os.path.splitext(f)[1].lower()
            if ext not in INCLUDED_EXTENSIONS:
                continue

            file_path = os.path.join(root, f)
            rel_file = os.path.relpath(file_path, start_path)

            # Create a markdown link
            toc.append(f'{sub_indent}- [{f}]({rel_file})')

            # Validate link if requested
            if validate_links and not os.path.exists(file_path):
                broken_links.append(rel_file)

    return '\n'.join(toc), broken_links


def main():
    parser = argparse.ArgumentParser(description='Generate Table of Contents from directory structure')
    parser.add_argument('directory', nargs='?', default='.', help='Root directory to scan (default: current)')
    parser.add_argument('--max-depth', type=int, default=3, help='Maximum directory depth (default: 3)')
    parser.add_argument('--validate-links', action='store_true', help='Validate that linked files exist')
    parser.add_argument('--output', default='TOC.md', help='Output file name (default: TOC.md)')

    args = parser.parse_args()

    start_path = os.path.abspath(args.directory)
    print(f"Scanning: {start_path}")
    print(f"Max depth: {args.max_depth}")

    toc_content, broken_links = generate_toc(start_path, args.max_depth, args.validate_links)

    output_path = os.path.join(start_path, args.output)
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write('# Table of Contents\n\n')
            f.write(f'> Auto-generated from `{os.path.basename(start_path)}/`\n\n')
            f.write('---\n\n')
            f.write(toc_content)
            f.write('\n')
    except IOError as e:
        print(f"Error writing {output_path}: {e}", file=sys.stderr)
        sys.exit(1)

    print(f"\n✅ Table of Contents generated at {args.output}")

    if broken_links:
        print(f"\n⚠️  {len(broken_links)} broken link(s) found:")
        for link in broken_links:
            print(f"   - {link}")


if __name__ == '__main__':
    main()
