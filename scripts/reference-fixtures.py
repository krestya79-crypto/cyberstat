"""Regenerate independent numerical fixtures. Requires Node.js and Python scipy.

Run from the repository root: python scripts/reference-fixtures.py
The source answers remain untouched. SciPy is only a development reference.
"""
import json
import math
import pathlib
import subprocess
from scipy import stats

data = subprocess.check_output([
    'node', '--experimental-strip-types', '-e',
    "import('./src/content/examples.ts').then(m=>process.stdout.write(JSON.stringify(m.examples)))"
], text=True, encoding='utf-8')
rows = {}
for example in json.loads(data):
    method = example.get('method')
    if not method:
        continue
    values = example['values']
    def value(key):
        return float(values[key])
    tail = values.get('tail', 'left')
    distribution = None
    if method == 'normal':
        distribution = stats.norm(value('mu'), value('sd'))
    elif method == 'inverse':
        cumulative = 1 - value('prob') if tail == 'right' else value('prob')
        result = value('mu') + value('sd') * stats.norm.ppf(cumulative)
    elif method == 't':
        distribution = stats.t(value('df'))
    elif method.startswith('mean-'):
        distribution = stats.norm(value('mu'), value('sd') / math.sqrt(value('n')))
    elif method == 'variance':
        distribution = stats.chi2(value('n') - 1, scale=value('variance') / (value('n') - 1))
    elif method == 'proportion':
        distribution = stats.norm(value('p'), math.sqrt(value('p') * (1-value('p')) / value('n')))
    elif method == 'proportion-moments':
        result = math.sqrt(value('p') * (1-value('p')) / value('n'))
    elif method.startswith('ci-'):
        n = value('n')
        mean = value('sum') / n if method == 'ci-summary' else value('xbar')
        sd = math.sqrt((value('sumSq') - value('sum')**2/n)/(n-1)) if method == 'ci-summary' else value('sd')
        critical = stats.t.ppf(.975, n-1) if method == 'ci-t' else stats.norm.ppf(.975)
        result = mean - critical * sd / math.sqrt(n)
    elif method.startswith('size-'):
        result = math.ceil((stats.norm.ppf(.975)*value('sd')/value('error'))**2)
    else:
        raise ValueError(f'Unsupported fixture method: {method}')
    if distribution is not None:
        result = distribution.cdf(value('a')) if tail == 'left' else distribution.sf(value('a')) if tail == 'right' else distribution.cdf(value('b')) - distribution.cdf(value('a'))
    rows[example['id']] = float(result)
pathlib.Path('tests/scipy-reference.json').write_text(json.dumps(rows, indent=2)+'\n', encoding='utf-8')
print(f'Generated {len(rows)} independent reference results')
