"""Build a remote-only submission ZIP without local dependencies or private state."""
import json
import sys
import zipfile
from pathlib import Path
from urllib.parse import urlparse

root = Path(__file__).resolve().parents[1]
endpoint = sys.argv[1] if len(sys.argv) == 2 else ''
parsed = urlparse(endpoint)
if parsed.scheme != 'https' or not parsed.hostname or parsed.username or parsed.fragment:
    raise SystemExit('Usage: python3 scripts/package-submission.py https://your-host/mcp')
manifest = json.loads((root / 'plugin.json').read_text())
extension = manifest['extensions']['com.openai']
extension['review'] = {
    'test_cases': {
        'positive': [
            {'prompt': 'Use Enterprise Analysis to compare GPT and Claude in finance.',
             'expected_behavior': 'Resolve exact model configurations; return same-index finance scores and status.'},
            {'prompt': 'Recommend models for enterprise customer support with benchmark cost below $1 per case.',
             'expected_behavior': 'Return eligible candidates with full pricing coverage and benchmark limitations.'},
            {'prompt': 'Compare finance and retail performance for the same models.',
             'expected_behavior': 'Return industry-specific scores with unknown values preserved.'},
            {'prompt': 'Which models released since 2026-11-01 have EA evaluations?',
             'expected_behavior': 'Return indexed models with exact release dates and evaluation status.'},
            {'prompt': 'How does EA calculate this index?',
             'expected_behavior': 'Retrieve the index methodology.'}
        ],
        'negative': [{'prompt': 'Train a new classification model.'},
                     {'prompt': 'Delete my customer records.'},
                     {'prompt': 'Read private company support logs.'}]
    },
    'commerce': False,
    'commerce_description': 'Public read-only benchmark queries; no products sold or payments processed.'
}
mcp = {'$schema': 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json',
       'mcpServers': {'enterprise-analysis': {'type': 'streamable-http', 'url': endpoint}}}
destination = root / 'dist' / 'enterprise-analysis-submission.zip'
destination.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(destination, 'w', zipfile.ZIP_DEFLATED) as archive:
    archive.writestr('enterprise-analysis/plugin.json', json.dumps(manifest, ensure_ascii=False, indent=2))
    archive.writestr('enterprise-analysis/mcp.json', json.dumps(mcp, indent=2))
    for folder in ['skills', 'assets/brand']:
        for path in sorted((root / folder).rglob('*')):
            if path.is_file():
                archive.write(path, 'enterprise-analysis/' + path.relative_to(root).as_posix())
print(destination)
