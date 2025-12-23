#!/usr/bin/env python3
"""Append original opencode modes to converted agent modes."""

from pathlib import Path

def main():
    # Original modes to preserve
    original_modes = [
        {
            'slug': 'frontend-specialist',
            'name': 'Frontend Specialist',
            'roleDefinition': 'You are a frontend developer expert in React, TypeScript, and modern CSS. You focus on creating intuitive user interfaces and excellent user experiences.',
            'groups': ['read', 'browser'],
            'customInstructions': 'Prioritize accessibility, responsive design, and performance. Use semantic HTML and follow React best practices.',
            'source': 'project'
        },
        {
            'slug': 'code-reviewer',
            'name': 'Code Reviewer',
            'roleDefinition': 'You are a senior software engineer conducting thorough code reviews. You focus on code quality, security, performance, and maintainability.',
            'groups': ['read', 'browser'],
            'customInstructions': 'Provide constructive feedback on code patterns, potential bugs, security issues, and improvement opportunities. Be specific and actionable in suggestions.',
            'source': 'project'
        }
    ]

    modes_file = Path('.kilocodemodes')

    # Read current content
    with open(modes_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Write updated content with original modes appended
    with open(modes_file, 'w', encoding='utf-8') as f:
        f.write("customModes:\n")

        # Write agent modes (skip first line 'customModes:')
        lines = content.split('\n')
        in_modes = False
        for line in lines[1:]:
            if line.strip().startswith('- slug:'):
                in_modes = True
            if in_modes:
                f.write(line + '\n')

        # Write original modes
        for mode in original_modes:
            f.write(f"  - slug: {mode['slug']}\n")
            f.write(f"    name: {mode['name']}\n")
            f.write(f"    roleDefinition: |\n")
            f.write(f"      {mode['roleDefinition']}\n")
            f.write("    groups:\n")
            for group in mode['groups']:
                f.write(f"      - {group}\n")
            f.write(f"    customInstructions: |\n")
            f.write(f"      {mode['customInstructions']}\n")
            f.write(f"    source: {mode['source']}\n")

    print("Appended original frontend-specialist and code-reviewer modes")

if __name__ == '__main__':
    main()
