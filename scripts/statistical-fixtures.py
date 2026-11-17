"""Independent SciPy/NumPy references for every default statistical formula.
Run from the checkout root with Node.js, scipy and numpy installed.
"""
import json
import math
import subprocess
from pathlib import Path
import numpy as np
from scipy import stats

loader = """import {build} from 'esbuild';const b=await build({entryPoints:['src/content/statistics.ts'],bundle:true,platform:'node',format:'esm',write:false});const m=await import('data:text/javascript;base64,'+Buffer.from(b.outputFiles[0].text).toString('base64'));process.stdout.write(JSON.stringify(m.statisticalFormulas.map(f=>({id:f.id,values:f.initial}))));"""
catalog = json.loads(subprocess.check_output(['node','--input-type=module','-e',loader],text=True,encoding='utf-8'))
references = []
for item in catalog:
    key, v = item['id'], item['values']
    def number(name): return float(v[name])
    def data(name): return np.array([float(x) for x in v[name].replace(';',',').replace('\n',',').replace(' ', '').split(',') if x])
    distribution = None
    tail = v.get('tail','left')
    if key == 'arithmetic-mean': result = np.mean(data('data'))
    elif key == 'median': result = np.median(data('data'))
    elif key.endswith('variance') and key != 'variance': result = np.var(data('data'),ddof=int(key.startswith('sample')))
    elif key.endswith('-sd'): result = np.std(data('data'),ddof=int(key.startswith('sample')))
    elif key == 'classical-probability': result = number('favorable') / number('total')
    elif key == 'event-union': result = number('pa') + number('pb') - number('joint')
    elif key == 'conditional-probability': result = number('joint') / number('pb')
    elif key == 'independent-events': result = number('pa') * number('pb')
    elif key == 'probability-tree': result = number('pa') * number('givenA') + (1-number('pa')) * number('givenNotA')
    elif key == 'z-score': result = (number('x')-number('mu')) / number('sd')
    elif key == 'standard-error': result = number('sd') / math.sqrt(number('n'))
    elif key == 'normal': distribution = stats.norm(number('mu'),number('sd'))
    elif key == 'inverse': result = stats.norm.ppf(1-number('prob') if tail=='right' else number('prob'),loc=number('mu'),scale=number('sd'))
    elif key == 't': distribution = stats.t(number('df'))
    elif key == 'chi': distribution = stats.chi2(number('df'))
    elif key == 'f': distribution = stats.f(number('df'),number('df2'))
    elif key.startswith('mean-'):
        distribution = stats.t(number('n')-1,loc=number('mu'),scale=number('sd')/math.sqrt(number('n'))) if key=='mean-t' else stats.norm(number('mu'),number('sd')/math.sqrt(number('n')))
    elif key == 'variance': distribution = stats.chi2(number('n')-1,scale=number('variance')/(number('n')-1))
    elif key == 'proportion': distribution = stats.norm(number('p'),math.sqrt(number('p')*(1-number('p'))/number('n')))
    elif key == 'proportion-moments': result = math.sqrt(number('p')*(1-number('p'))/number('n'))
    elif key.startswith('ci-'):
        n = number('n')
        mean = number('sum')/n if key=='ci-summary' else number('xbar')
        sd = math.sqrt((number('sumSq')-number('sum')**2/n)/(n-1)) if key=='ci-summary' else number('sd')
        q = (1+number('confidence')/100)/2
        result = mean - (stats.t.ppf(q,n-1) if key=='ci-t' else stats.norm.ppf(q))*sd/math.sqrt(n)
    elif key.startswith('size-'):
        q = (1+number('confidence')/100)/2
        result = next(n for n in range(2,30) if stats.t.ppf(q,n-1)*number('sd')/math.sqrt(n)<=number('error')) if key=='size-t' else max(30 if key=='size-large' else 1, math.ceil((stats.norm.ppf(q)*number('sd')/number('error'))**2))
    elif key == 'bounds': result = number('upper')-number('lower')
    elif key in ['binomial','poisson']:
        d = stats.binom(int(number('n')),number('p')) if key=='binomial' else stats.poisson(number('lambda'))
        k = number('k')
        result = d.pmf(k) if tail=='exact' else d.cdf(k) if tail=='left' else d.sf(k-1)
    elif key in ['z-test','t-test','proportion-test']:
        if key=='proportion-test': z=(number('successes')/number('n')-number('p0'))/math.sqrt(number('p0')*(1-number('p0'))/number('n'))
        else: z=(number('xbar')-number('mu0'))/(number('sd')/math.sqrt(number('n')))
        d=stats.t(number('n')-1) if key=='t-test' else stats.norm()
        result=2*d.sf(abs(z)) if tail=='two' else d.cdf(z) if tail=='left' else d.sf(z)
    elif key=='chi-square-test': result=stats.chi2.sf(np.sum((data('observed')-data('expected'))**2/data('expected')),len(data('observed'))-1-number('estimated'))
    elif key=='correlation': result=stats.pearsonr(data('xs'),data('ys')).statistic
    elif key=='regression': result=stats.linregress(data('xs'),data('ys')).slope
    else: raise ValueError(key)
    if distribution is not None:
        result=distribution.cdf(number('a')) if tail=='left' else distribution.sf(number('a')) if tail=='right' else distribution.cdf(number('b'))-distribution.cdf(number('a'))
    references.append({'id':key,'values':v,'expected':float(result)})
Path('tests/statistical-reference.json').write_text(json.dumps(references,indent=2)+'\n',encoding='utf-8')
print(f'Generated {len(references)} independent statistical references')
