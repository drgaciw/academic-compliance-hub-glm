#!/usr/bin/env python3
"""Convert Claude Code agents to opencode custom modes."""

import re
from pathlib import Path
from typing import Dict, List, Optional

def parse_frontmatter(content: str) -> Dict[str, str]:
    """Parse YAML frontmatter."""
    frontmatter_match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if not frontmatter_match:
        return {}

    result: Dict[str, str] = {}
    frontmatter_text = frontmatter_match.group(1)

    for line in frontmatter_text.split('\n'):
        line = line.strip()
        if ':' in line and not line.startswith('#'):
            parts = line.split(':', 1)
            key = parts[0].strip()
            value = parts[1].strip().strip('"').strip("'")
            result[key] = value

    return result

def parse_agent_markdown(file_path: Path) -> Optional[Dict]:
    """Parse agent markdown file and extract metadata."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception:
        return None

    frontmatter = parse_frontmatter(content)
    name = frontmatter.get('name')

    if not name:
        return None

    frontmatter_match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    main_content = content[frontmatter_match.end():].strip() if frontmatter_match else content

    return {
        'name': name,
        'description': frontmatter.get('description', ''),
        'content': main_content,
        'path': file_path
    }

def find_all_agents(agents_dir: Path) -> List[Path]:
    """Find all agent markdown files."""
    agents: List[Path] = []
    for plugin_dir in agents_dir.glob('plugins/*'):
        agents_dir_path = plugin_dir / 'agents'
        if agents_dir_path.exists():
            agents.extend(agents_dir_path.glob('*.md'))
    return agents

def agent_to_opencode_mode(agent: Dict) -> Dict:
    """Convert agent to opencode custom mode format."""
    name = agent['name']
    description = agent['description']
    slug = name.replace('_', '-').lower()

    role_def = f"You are a {name}. {description[:300] if description else ''}. Expert in specialized domain with deep knowledge and production best practices."

    examples = extract_examples(agent['content'])

    custom_instructions = f"""## Expertise
{extract_capabilities(agent['content'])}

## Approach
{extract_response_approach(agent['content'])}

## Example Tasks
{chr(10).join(f'- {ex}' for ex in examples[:3])}

Reference: wshobson/agents repository"""

    return {
        'slug': slug,
        'name': name.replace('-', ' ').replace('_', ' ').title(),
        'roleDefinition': role_def,
        'groups': ['read', 'browser', 'edit', 'bash', 'search'],
        'customInstructions': custom_instructions,
        'source': 'project'
    }

def extract_capabilities(content: str) -> str:
    """Extract key capabilities section from content."""
    cap_match = re.search(r'## Capabilities\s*\n(.*?)(?=##|$)', content, re.DOTALL)
    if cap_match:
        caps = cap_match.group(1).strip()
        lines = caps.split('\n')
        result: List[str] = []
        for line in lines:
            if line.strip().startswith('-') or line.strip().startswith('*'):
                result.append(line.strip())
        return '\n'.join(result[:5])
    return "Expert knowledge and production best practices."

def extract_response_approach(content: str) -> str:
    """Extract response approach section."""
    approach_match = re.search(r'## Response Approach\s*\n(.*?)(?=##|$)', content, re.DOTALL)
    if approach_match:
        approach = approach_match.group(1).strip()
        lines = approach.split('\n')
        steps = [l.strip() for l in lines if l.strip()]
        return ' '.join(steps[:3])
    return "Analyze requirements and provide expert solutions."

def extract_examples(content: str) -> List[str]:
    """Extract example interactions."""
    examples_match = re.search(r'## Example Interactions\s*\n(.*?)(?=##|$)', content, re.DOTALL)
    if examples_match:
        examples_text = examples_match.group(1).strip()
        quoted = re.findall(r'"([^"]+)"', examples_text)
        return quoted
    return []

def main():
    agents_dir = Path('agents')
    if not agents_dir.exists():
        print(f"Agents directory not found: {agents_dir}")
        return

    agent_files = find_all_agents(agents_dir)

    # Parse and deduplicate by slug
    modes_by_slug: Dict[str, Dict] = {}
    for agent_file in agent_files:
        agent = parse_agent_markdown(agent_file)
        if agent and agent['name']:
            mode = agent_to_opencode_mode(agent)
            slug = mode['slug']
            if slug not in modes_by_slug:
                modes_by_slug[slug] = mode

    modes = list(modes_by_slug.values())
    print(f"Converted {len(modes)} unique agents (from {len(agent_files)} files)")

    # Write new .kilocodemodes
    modes_file = Path('.kilocodemodes')

    with open(modes_file, 'w', encoding='utf-8') as f:
        f.write("customModes:\n")

        # Write agent modes
        for mode in modes:
            f.write(f"  - slug: {mode['slug']}\n")
            f.write(f"    name: {mode['name']}\n")
            f.write(f"    roleDefinition: {mode['roleDefinition']}\n")
            f.write("    groups:\n")
            for group in mode['groups']:
                f.write(f"      - {group}\n")
            f.write(f"    customInstructions: |\n")
            for line in mode['customInstructions'].split('\n'):
                f.write(f"      {line}\n")
            f.write(f"    source: {mode['source']}\n")

    print(f"Updated .kilocodemodes with {len(modes)} agent modes")

if __name__ == '__main__':
    main()
