"""Build the graph from compact, auditable publisher-data snapshots.

Offline: python site/scripts/build-graph-observations.py
Refresh and re-verify primary sources: python site/scripts/build-graph-observations.py --refresh

The optional refresh requires PyYAML and PyMuPDF. The offline build uses only
Python's standard library. It never fits historical values to a desired shape.
"""
from __future__ import annotations

import argparse
import csv
import datetime as dt
import hashlib
import io
import json
import math
from pathlib import Path
import statistics
import urllib.request
import zipfile

SITE = Path(__file__).resolve().parents[1]
INPUT = SITE / 'data' / 'observed-inputs.json'
REVIEWED = '2026-11-17'
BASELINE_YEAR = 2025

URLS = {
    'metr': 'https://metr.org/assets/benchmark_results_1_1.yaml',
    'boj': 'https://www.stat-search.boj.or.jp/info/cgpi_m_en.zip',
    'ifr2026': 'https://ifr.org/img/worldrobotics/Executive_Summary_WR_2026_-_Industrial_Robots.pdf',
    'ifr2025': 'https://ifr.org/img/worldrobotics/Executive_Summary_WR_2025_Industrial_Robots.pdf',
    'ifrChart2026': 'https://ifr.org/downloads/press_docs/Market_Presentation_WR_Press_Conference_2026.pdf',
    'ifrChart2024': 'https://ifr.org/img/worldrobotics/Press_Conference_2024.pdf',
    'simba': 'https://raw.githubusercontent.com/mlresearch/v267/main/assets/lee25u/lee25u.pdf',
    'drq': 'https://huggingface.co/dmux/DR.Q/raw/main/README.md',
    'robonet': 'https://www.tensorflow.org/datasets/catalog/robonet',
    'droid': 'https://storage.googleapis.com/gresearch/robotics/droid/1.0.0/dataset_info.json',
    'agibot': 'https://raw.githubusercontent.com/OpenDriveLab/AgiBot-World/main/README.md',
}


def dump(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False, allow_nan=False) + '\n', encoding='utf-8')


def refresh():
    import yaml
    import pymupdf
    sources = {}

    def get(key):
        request = urllib.request.Request(URLS[key], headers={'User-Agent': 'Mozilla/5.0', 'Referer': 'https://ifr.org/'})
        with urllib.request.urlopen(request, timeout=60) as response:
            body = response.read()
            sources[key] = {
                'url': URLS[key], 'retrievedOn': dt.datetime.now(dt.timezone.utc).date().isoformat(),
                'originalSha256': hashlib.sha256(body).hexdigest(),
                'originalBytes': len(body), 'lastModified': response.headers.get('Last-Modified'),
                'snapshot': 'Selected numerical facts; the full source document is not redistributed.',
            }
        return body

    metr = yaml.safe_load(get('metr'))
    results = []
    for model, row in metr['results'].items():
        metric = row['metrics'].get('p80_horizon_length')
        if metric and metric.get('estimate') is not None:
            results.append({'model': model, 'date': str(row['release_date']),
                            'benchmark': row['benchmark_name'], **metric})
    results.sort(key=lambda row: (row['date'], row['model']))

    archive = zipfile.ZipFile(io.BytesIO(get('boj')))
    csv_bytes = archive.read('cgpi_m_en.csv')
    rows = list(csv.reader(io.StringIO(csv_bytes.decode('utf-8-sig'))))
    series = next(row for row in rows if row[0] == 'PRCG20_1201350029')
    assert 'excluding Consumption Tax' in series[1] and 'Robots' in series[2]
    months = [{'month': month, 'value': float(value)} for month, value in zip(rows[0][3:], series[3:])
              if value and month <= '202610']
    assert len([row for row in months if row['month'].startswith('2026')]) == 10

    def pdf_text(key):
        body = get(key)
        with pymupdf.open(stream=body, filetype='pdf') as document:
            return '\n'.join(page.get_text() for page in document)

    ifr26 = pdf_text('ifr2026')
    ifr25 = pdf_text('ifr2025')
    # Validate the exact observations against publisher text, not a scenario.
    compact26 = ''.join(ifr26.split()).replace(',', '')
    compact25 = ''.join(ifr25.split()).replace(',', '')
    for number in [603307, 5079078]:
        assert str(number) in compact26, f'IFR 2026 observation changed: {number}'
    for number in [552946, 541302, 542076, 4663698]:
        assert str(number) in compact25, f'IFR 2025 observation changed: {number}'
    pdf_text('ifrChart2026')
    pdf_text('ifrChart2024')
    # Rounded chart transcriptions were visually reviewed, slides 8-9 (2026)
    # and slide 9 (2024, for the omitted 2019 stock). Preserve their precision.
    installations = [254000, 304000, 400000, 423000, 387000, 390000, 526000, 552946, 541302, 542076, 603307]
    stocks = [1632000, 1838000, 2125000, 2441000, 2737000, 3027000, 3479000, 3904000, 4282000, 4663698, 5079078]

    simba = pdf_text('simba')
    assert '0.776 [0.705, 0.849]' in simba and '14 locomotion tasks' in simba
    drq = get('drq').decode('utf-8')
    section = drq.split('### HumanoidBench')[1]
    assert '0.825' in section and '0.748' in section and '0.902' in section
    assert 'action repeat 2' in section

    robonet = get('robonet').decode('utf-8')
    assert '162,417' in robonet and '4.0.1' in robonet
    droid = json.loads(get('droid'))
    lengths = [int(length) for split in droid['splits'] for length in split['shardLengths']]
    assert len(lengths) == 2048 and sum(lengths) == 92233
    agibot = get('agibot').decode('utf-8')
    for count in ['1,003,672', '92,214']:
        assert count in agibot, f'AgiBot source count changed: {count}'
    assert '2025/03/01' in agibot and '2024/12/30' in agibot

    input_data = {
        'schemaVersion': 1, 'reviewedOn': REVIEWED, 'sources': sources,
        'metr': {'benchmark': metr['benchmark_name'], 'metric': 'p80_horizon_length', 'unit': 'minutes', 'results': results},
        'boj': {'seriesCode': series[0], 'category': series[1], 'commodity': series[2],
                'csvSha256': hashlib.sha256(csv_bytes).hexdigest(), 'months': months},
        'ifr': {'firstYear': 2015, 'installations': installations, 'stock': stocks,
                'installationExactYears': [2022, 2023, 2024, 2025], 'stockExactYears': [2024, 2025],
                'forecast2026Installations': 655000,
                'chartTranscription': 'Rounded to the nearest 1,000 where no exact count is supplied. 2026 presentation slides 8-9; 2019 stock from 2024 presentation slide 9.'},
        'humanoid': {'protocol': '14 H1 locomotion tasks, without dexterous hands; 1M environment steps; mean success-normalized return.',
                     'observations': [
                         {'year': 2025, 'method': 'SimbaV2', 'value': .776, 'ciLow': .705, 'ciHigh': .849, 'source': 'simba', 'sourceLocation': 'Table 20, PDF page 44'},
                         {'year': 2026, 'method': 'DR.Q', 'value': .825, 'ciLow': .748, 'ciHigh': .902, 'source': 'drq', 'sourceLocation': 'HumanoidBench without dexterous hands: Mean; 500K steps with action repeat 2 = 1M environment steps'},
                     ]},
        'corpora': [
            {'id': 'robonet', 'family': 'robonet', 'releaseYear': 2019, 'releaseDate': '2019', 'datePrecision': 'publication year', 'count': 162417, 'source': 'robonet', 'version': 'TFDS 4.0.1',
             'detail': '2019 corpus; exact episode count reconstructed from its pinned TFDS 4.0.1 representation. The original paper reports approximately 162k trajectories. Not a contemporaneous 2019 manifest audit.'},
            {'id': 'droid-1.0.0', 'family': 'droid', 'releaseYear': 2024, 'releaseDate': '2024-03-15', 'datePrecision': 'initial metadata last-modified date', 'count': 92233, 'source': 'droid', 'version': 'RLDS 1.0.0',
             'detail': 'Sum of 2,048 shard lengths in the initial full RLDS release. Includes more than the approximately 76k successful demonstrations; later revisions are not added as new collections.'},
            {'id': 'agibot-alpha', 'family': 'agibot', 'releaseYear': 2024, 'releaseDate': '2024-12-30', 'count': 92214, 'source': 'agibot', 'version': 'Alpha',
             'detail': 'Alpha is included in Beta; this family contributes one version at any given time.'},
            {'id': 'agibot-beta', 'family': 'agibot', 'releaseYear': 2025, 'releaseDate': '2025-03-01', 'count': 1003672, 'source': 'agibot', 'version': 'Beta', 'replaces': 'agibot-alpha',
             'detail': 'Replaces the Alpha subset. Adds 911,458 episodes, not a second full Alpha plus Beta count.'},
        ],
        'corpusAudit': 'Fixed inventory of independently collected source families; no OXE/Octo aggregates, RoboNet components, relabeled copies, resolution variants, or simulation added. Source-level overlap audit, not hash-level deduplication. Episode lengths and segmentation differ.',
        'droidShardLengths': lengths,
    }
    dump(INPUT, input_data)


def build():
    inputs = json.loads(INPUT.read_text(encoding='utf-8'))
    sources = inputs['sources']
    source = lambda key: sources[key]['url']
    series = {}

    def observation(year, raw, key, **extra):
        return {'year': year, 'raw': raw, 'kind': 'observed', 'sourceUrl': source(key),
                'date': str(year), 'coverage': 'calendar-year', 'approximate': False, **extra}

    frontier, high = [], 0
    for row in inputs['metr']['results']:
        if row['date'] > REVIEWED or not row['estimate'] > high:
            continue
        high = row['estimate']
        frontier.append(row)
    annual = {int(row['date'][:4]): row for row in frontier}
    llm_observations = [observation(year, row['estimate'], 'metr', date=row['date'],
        sourceName='METR', coverage='model-release', model=row['model'], benchmarkVersion=row['benchmark'],
        ciLowRaw=row['ci_low'], ciHighRaw=row['ci_high'], intervalLabel='Reported 95% interval for task horizon',
        precision='Six decimal places in source, displayed at appropriate time-unit precision',
        detail=f"Best record-setting 80% horizon among evaluated model releases in {year}: {row['model']}. {row['benchmark']}. No observation is supplied for years without a new record in this snapshot.")
        for year, row in sorted(annual.items())]
    series['llm'] = {
        'metric': 'METR task-completion horizon at 80% success', 'definition': 'METR · 80% task horizon',
        'unit': 'minutes', 'sourceName': 'METR', 'sourceUrl': 'https://metr.org/time-horizons/',
        'scope': 'Task difficulty measured by human completion time, primarily software, ML and cybersecurity work. This is neither general intelligence nor AI running time.',
        'methodology': 'Annual record-setting results by model release year. METR stitches Horizon 1.0 results before 2023 to Horizon 1.1 afterward. Earlier results are retrospective evaluations. Source intervals are divided by the fixed 2025 point estimate; they are not jointly estimated ratio intervals. No new values are invented for unmeasured years.',
        'baselineValue': annual[2025]['estimate'], 'observations': llm_observations,
    }
    h = inputs['humanoid']
    series['humanoid'] = {
        'metric': 'HumanoidBench locomotion: mean success-normalized return', 'definition': 'HumanoidBench · 14-task locomotion',
        'unit': 'success-normalized return', 'sourceName': 'SimbaV2 / DR.Q evaluations', 'sourceUrl': 'https://proceedings.mlr.press/v306/lyu26f.html',
        'scope': h['protocol'] + ' Two selected comparable published methods; not a census of the globally best humanoid or general physical capability.',
        'methodology': 'Each task return is normalized as (return − random-policy return) / (target-success return − random-policy return), then the 14 tasks are averaged. A value of 1 denotes the success reference, not a success percentage or a mathematical maximum. Earlier task suites and training budgets are not mixed into this series.',
        'baselineValue': .776,
        'observations': [observation(row['year'], row['value'], row['source'], sourceName=row['method'], coverage='selected-method',
            ciLowRaw=row['ciLow'], ciHighRaw=row['ciHigh'], intervalLabel='Reported 95% bootstrap interval',
            precision='Three decimal places in published table', detail=f"{row['method']}; {h['protocol']} {row['sourceLocation']}. Publication year, not an inferred earlier measurement.") for row in h['observations']],
    }
    ifr = inputs['ifr']
    for identity, key, exact_key, metric, definition, unit in [
        ('specialist', 'installations', 'installationExactYears', 'IFR annual industrial robot installations', 'IFR · annual industrial installations', 'robots/year'),
        ('deployment', 'stock', 'stockExactYears', 'IFR operational industrial robot stock', 'IFR · industrial robots in operation', 'robots'),
    ]:
        observations = []
        for offset, raw in enumerate(ifr[key]):
            year = ifr['firstYear'] + offset
            exact = year in ifr[exact_key]
            source_key = 'ifr2026' if year == 2025 else ('ifr2025' if exact else 'ifrChart2026')
            if identity == 'deployment' and year == 2019:
                source_key = 'ifrChart2024'
            observations.append(observation(year, raw, source_key, sourceName='International Federation of Robotics',
                date=f'{year}-12-31', approximate=not exact,
                precision='Published unit count' if exact else 'Rounded to nearest 1,000 robots in source chart',
                detail=('Annual installations' if identity == 'specialist' else 'Year-end operational stock') +
                    '; industrial robots worldwide. ' + ('Exact count from executive summary.' if exact else 'Chart value retains source rounding.')))
        series[identity] = {'metric': metric, 'definition': definition, 'unit': unit,
            'sourceName': 'International Federation of Robotics', 'sourceUrl': source('ifr2026'),
            'scope': 'Industrial robots worldwide; excludes a comprehensive count of service, medical and general-purpose humanoid robots. ' + ('Installations are a specialist-adoption proxy, not task performance.' if identity == 'specialist' else 'Operational stock is a deployment proxy, not robot intelligence.'),
            'methodology': 'Annual publisher totals, preserving the precision and vintage of each source. Historical observations are distinct from IFR and site-authored projections. No changing service-robot survey samples are combined with this industrial series.',
            'baselineValue': observations[-1]['raw'], 'observations': observations}

    corpora = inputs['corpora']
    inventory = []
    for year in range(2019, 2027):
        families = {}
        for item in corpora:
            if item['releaseYear'] <= year:
                families[item['family']] = item
        raw = sum(item['count'] for item in families.values())
        last = max(families.values(), key=lambda item: item['releaseDate'])
        inventory.append(observation(year, raw, last['source'], sourceName='Audited public corpus inventory',
            date=f'{year}-12-31' if year < 2026 else REVIEWED, coverage='release-inventory',
            lastReleaseDate=last['releaseDate'], inventory=[item['id'] for item in families.values()],
            precision='Episode counts in pinned releases',
            detail=f"Available episodes in the fixed RoboNet/DROID/AgiBot inventory; last included release: {last['releaseDate']}. Constant years mean no new included release, not no worldwide data collection. " + inputs['corpusAudit']))
    series['data'] = {'metric': 'Published real-robot training episodes, selected corpora', 'definition': 'Public robot episodes · 3 source families',
        'unit': 'episodes', 'sourceName': 'RoboNet / DROID / AgiBot World', 'sourceUrl': 'https://github.com/OpenDriveLab/AgiBot-World',
        'scope': 'A closed inventory of reported training episodes, not all private robot interaction data, equal-duration physical experience, or a global census.',
        'methodology': inputs['corpusAudit'] + ' Alpha is replaced by Beta, adding only the difference. Initial DROID 1.0.0 is pinned; later repackaging is not new collection. RoboNet uses a later pinned TFDS representation of the 2019 corpus. The history is release accounting and remains flat between included releases.',
        'baselineValue': next(point['raw'] for point in inventory if point['year'] == 2025),
        'historyStep': 'end', 'observations': inventory}

    monthly = inputs['boj']['months']
    prices = []
    for year in range(2020, 2027):
        entries = [row for row in monthly if row['month'].startswith(str(year))]
        if not entries:
            continue
        complete = len(entries) == 12
        assert complete or year == 2026
        value = statistics.mean(row['value'] for row in entries)
        prices.append(observation(year, value, 'boj', sourceName='Bank of Japan',
            date=f"{entries[-1]['month'][:4]}-{entries[-1]['month'][4:]}",
            coverage='calendar-year' if complete else 'year-to-date', months=len(entries), sourceSeries=inputs['boj']['seriesCode'],
            precision='Mean of published monthly indices rounded to one decimal place',
            detail=f"BOJ {inputs['boj']['seriesCode']}, Robots, excluding consumption tax. Arithmetic mean of {len(entries)} monthly observations" + ('. Complete calendar year.' if complete else '; January–October 2026, not a full-year observation.')))
    series['hardware'] = {'metric': 'BOJ robot producer-price index, excluding consumption tax', 'definition': 'BOJ · robot producer-price index',
        'unit': 'source index', 'sourceName': 'Bank of Japan', 'sourceUrl': 'https://www.boj.or.jp/en/statistics/outline/exp/pi/cgpi_2020/outline.htm',
        'scope': 'Japanese domestic robot goods prices. A whole-robot cost proxy, not dollars per actuator, global hardware prices, or an inflation-adjusted affordability index. Lower means cheaper.',
        'methodology': 'BOJ PRCG20_1201350029 (2020 source base), excluding consumption tax. Annual arithmetic means of the twelve reported monthly values; 2026 explicitly uses only the ten available January–October observations. No currency conversion, inversion, or general-inflation adjustment.',
        'baselineValue': next(row['raw'] for row in prices if row['year'] == 2025), 'observations': prices}

    # Fit only the consistent Horizon 1.1 protocol, using record-setting p80
    # model observations, not the provider's p50 doubling-time summary.
    fit = [row for row in frontier if row['date'] >= '2023-01-01' and row['benchmark'] == 'METR-Horizon-v1.1']
    times = [dt.date.fromisoformat(row['date']).toordinal() / 365.2425 for row in fit]
    logs = [math.log(row['estimate']) for row in fit]
    mean_t, mean_log = statistics.mean(times), statistics.mean(logs)
    growth = sum((t - mean_t) * (value - mean_log) for t, value in zip(times, logs)) / sum((t - mean_t) ** 2 for t in times)
    stock = {row['year']: row['raw'] for row in series['deployment']['observations']}
    installed = {row['year']: row['raw'] for row in series['specialist']['observations']}
    attrition = sum(installed[year] - (stock[year] - stock[year-1]) for year in [2023, 2024, 2025]) / sum(stock[year-1] for year in [2023, 2024, 2025])
    data_anchor = series['data']['baselineValue']
    data_factor = (data_anchor / inventory[0]['raw']) ** (5 / 6)
    parameters = {
        'llm': {'growthRate': growth, 'fitRecordCount': len(fit), 'fitRecords': [{'model': row['model'], 'date': row['date'], 'minutes': row['estimate']} for row in fit],
                'ceilingMinutes': 10 * 2000 * 60, 'anchorYear': 2026, 'anchorMinutes': annual[2026]['estimate'], 'pauseYear': 2035, 'workHoursPerYear': 2000},
        'humanoid': {'anchorYear': 2026, 'anchorScore': .825, 'targetYear': 2040, 'targetScore': 1.0, 'midpoint': 2031, 'slope': .33},
        'data': {'anchorYear': 2026, 'anchorEpisodes': data_anchor, 'ceilingFactor': data_factor, 'ceilingEpisodes': data_anchor * data_factor,
                 'growthRate': math.log(19 * (data_factor - 1)) / 5, 'plateauYear': 2031, 'plateauFraction': .95},
        'specialist': {'anchorYear': 2026, 'anchorInstallations': ifr['forecast2026Installations'], 'peakYear': 2031,
                       'peakInstallations': 2 * installed[2025], 'endYear': 2040, 'endInstallations': .5 * installed[2025]},
        'deployment': {'attritionRate': attrition, 'calibrationYears': [2023, 2024, 2025], 'anchorYear': 2025, 'anchorStock': stock[2025]},
        'hardware': {'anchorYear': 2026, 'anchorPrice': prices[-1]['raw'], 'floorFraction': .2, 'halfLifeYears': 2.5},
    }

    def specialists(year):
        p = parameters['specialist']
        if year <= 2026:
            return installed[2025] * (p['anchorInstallations'] / installed[2025]) ** (year - 2025)
        if year <= 2031:
            return p['anchorInstallations'] * (p['peakInstallations'] / p['anchorInstallations']) ** ((year - 2026) / 5)
        return p['peakInstallations'] * (p['endInstallations'] / p['peakInstallations']) ** ((year - 2031) / 9)

    projected_stock = {2025: stock[2025]}
    for year in range(2026, 2041):
        projected_stock[year] = projected_stock[year-1] * (1 - attrition) + specialists(year)

    def forecast(identity, year):
        p = parameters[identity]
        if identity == 'llm':
            return p['ceilingMinutes'] / (1 + (p['ceilingMinutes'] / p['anchorMinutes'] - 1) * math.exp(-p['growthRate'] * (min(year, p['pauseYear']) - 2026)))
        if identity == 'humanoid':
            sigmoid = lambda y: 1 / (1 + math.exp(-p['slope'] * (y - p['midpoint'])))
            fraction = (sigmoid(year) - sigmoid(2026)) / (sigmoid(2040) - sigmoid(2026))
            return p['anchorScore'] + (p['targetScore'] - p['anchorScore']) * fraction
        if identity == 'data':
            return p['ceilingEpisodes'] / (1 + (p['ceilingFactor'] - 1) * math.exp(-p['growthRate'] * (year - 2026)))
        if identity == 'hardware':
            return p['anchorPrice'] * (p['floorFraction'] + (1 - p['floorFraction']) * 2 ** (-(year - 2026) / p['halfLifeYears']))
        if identity == 'specialist':
            return specialists(year)
        if identity == 'deployment':
            start = min(2039, math.floor(year))
            return projected_stock[start] + (projected_stock[start+1] - projected_stock[start]) * (year - start)
        raise ValueError(identity)

    scenario_notes = {
        'llm': ('https://ai-2040.com/supplements/takeoff-forecast', 'METR trend / Plan A-inspired scenario',
                'Logistic scenario anchored to the latest measured 2026 p80 horizon. Initial growth is fitted to 2023–2026 Horizon 1.1 records; a 10-work-year ceiling (2,000 hours/year) is an author-set anchor informed by AI 2040’s autonomous-coding threshold, not a measured maximum or a TED-AI equivalence. The 2035 level is held through 2040; no numerical resumption jump is invented.'),
        'humanoid': ('https://proceedings.mlr.press/v306/lyu26f.html', 'HumanoidBench-anchored scenario',
                     'The retained rising sigmoid timing is rescaled from the measured 2026 score of 0.825 to the task-success reference of 1.0 in 2040. This target is a scenario assumption, not universal humanoid competence or a benchmark ceiling.'),
        'data': ('https://github.com/OpenDriveLab/AgiBot-World', 'Public-corpus growth scenario',
                 'Logistic growth from the fixed inventory. The ceiling equals five years of its 2019–2025 compound growth (5.507657×); the curve reaches 95% of that ceiling in 2031. Timing and saturation are author-selected scenario assumptions, not a prediction by the dataset publishers.'),
        'specialist': (source('ifr2026'), 'IFR forecast / specialist-adoption scenario',
                       '2026 uses IFR’s 655,000-installation forecast. The site-authored scenario then grows geometrically to twice the 2025 count in 2031 and declines to half that 2025 count in 2040. These later targets are assumptions, not historical observations or IFR forecasts.'),
        'deployment': (source('ifr2026'), 'Industrial-stock accounting scenario',
                       'Previous stock plus projected installations minus an annual attrition residual calibrated from the 2023–2025 IFR balance. The residual includes retirements and statistical revisions; it is not a directly measured retirement rate. Fractional-year connectors interpolate the annual accounting results.'),
        'hardware': ('https://www.boj.or.jp/en/statistics/outline/exp/pi/cgpi_2020/outline.htm', 'Robot-cost scenario',
                     'Author-selected cost decline from the January–October 2026 observed average: 20% floor and a 2.5-year halving time for the distance above that floor. This reaches 40% of the 2026 anchor in 2031; it is not a Bank of Japan price forecast.'),
    }

    for identity, item in series.items():
        baseline = item['baselineValue']
        item['baselineYear'] = BASELINE_YEAR
        for point in item['observations']:
            point['value'] = point['raw'] / baseline * 100
            if 'ciLowRaw' in point:
                point['ciLow'] = point['ciLowRaw'] / baseline * 100
                point['ciHigh'] = point['ciHighRaw'] / baseline * 100
        assert next(row['raw'] for row in item['observations'] if row['year'] == 2025) == baseline
        start = 2025 if identity in ['specialist', 'deployment'] else 2026
        url, name, detail = scenario_notes[identity]
        item['scenario'] = {'startYear': start, 'sourceUrl': url, 'sourceName': name, 'detail': detail, 'coverage': 'modeled-scenario'}
        item['projections'] = [{'year': round(t / 10, 1), 'raw': forecast(identity, t / 10),
                                'value': forecast(identity, t / 10) / baseline * 100}
                               for t in range(start * 10, 20401)]

    positive = [point['value'] for item in series.values() for point in item['observations'] + item['projections'] if point['value'] > 0]
    intervals = [point[key] for item in series.values() for point in item['observations'] for key in ['ciLow', 'ciHigh'] if point.get(key, 0) > 0]
    positive.extend(intervals)
    result = {
        'schemaVersion': 1, 'reviewedOn': inputs['reviewedOn'],
        'normalization': {'baselineYear': BASELINE_YEAR, 'formula': '100 * raw value / the same measure’s observed 2025 value',
                          'interpretation': 'Multiples compare each measure with its own baseline, not absolute capability across unlike measures.'},
        'domain': {'firstYear': 2015, 'lastYear': 2040, 'dividerYear': 2026, 'baselineYear': BASELINE_YEAR,
                   'minimum': 10 ** math.floor(math.log10(min(positive))), 'maximum': 10 ** math.ceil(math.log10(max(positive))), 'scale': 'log', 'logBase': 10},
        'scenarioParameters': parameters, 'series': series,
        'audit': {'inputFile': 'data/observed-inputs.json', 'inputSha256': hashlib.sha256(INPUT.read_bytes()).hexdigest(),
                  'generator': 'scripts/build-graph-observations.py', 'sources': sources,
                  'corpora': corpora, 'corpusAudit': inputs['corpusAudit']},
    }
    dump(SITE / 'graph-observations.json', result)
    (SITE / 'graph-observations.js').write_text(
        '// Generated by scripts/build-graph-observations.py; edit publisher snapshots or the generator, then rebuild.\n'
        + 'export const observedGraph = ' + json.dumps(result, ensure_ascii=False, separators=(',', ':'), allow_nan=False) + ';\n', encoding='utf-8')
    print(json.dumps({'baselines': {key: item['baselineValue'] for key, item in series.items()},
                      'hardware2026Ytd': prices[-1]['raw'], 'domain': result['domain'],
                      'llmGrowthRate': growth, 'attritionRate': attrition,
                      'endpoints': {key: item['projections'][-1]['value'] for key, item in series.items()}}, indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--refresh', action='store_true', help='Re-download and validate primary sources before rebuilding; review resulting changes.')
    args = parser.parse_args()
    if args.refresh:
        refresh()
    build()
