"""Build the graph from compact, auditable publisher-data snapshots.

Offline: python site/scripts/build-graph-observations.py
Refresh and re-verify primary sources: python site/scripts/build-graph-observations.py --refresh

Install the pinned interpolation dependencies from requirements-graph.txt.
The optional refresh also requires PyYAML and PyMuPDF. Observations remain
unchanged; missing history is explicitly reconstructed, never called measured.
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

import scipy
from scipy.interpolate import PchipInterpolator

SITE = Path(__file__).resolve().parents[1]
INPUT = SITE / 'data' / 'observed-inputs.json'
REVIEWED = '2026-11-17'
BASELINE_YEAR = 2025
FIRST_YEAR = 2015
LAST_YEAR = 2040
SAMPLE_STEP = .05


def display_value(index):
    """One common coordinate transform, matching D3 scaleSymlog(constant=1)."""
    z = math.log(index / 100)
    return math.copysign(math.log1p(abs(z)), z)


def inverse_display_value(value):
    return 100 * math.exp(math.copysign(math.expm1(abs(value)), value))

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
    'counterpoint2025': 'https://counterpointresearch.com/en/insights/Global-Humanoid-Robot-Installations-Reach-16,000-Units-in-2025-as-Mass-Production-Picks-Pace',
    'counterpoint2026': 'https://counterpointresearch.com/en/insights/global-humanoid-robot-shipments-soar-nearly-300-percent-yoy-in-h1-2026',
}


def dump(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False, allow_nan=False) + '\n', encoding='utf-8')


def refresh():
    import yaml
    import pymupdf
    sources = {}
    previous = json.loads(INPUT.read_text(encoding='utf-8')) if INPUT.exists() else {}

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

    # These two public articles block direct clients. Their bounded numerical
    # snapshot was verified from the rendered primary articles, not error HTML.
    # Retain that audit explicitly rather than pretending a failed refresh is new data.
    for key in ['counterpoint2025', 'counterpoint2026']:
        if key not in previous.get('sources', {}):
            raise RuntimeError('Verify the Counterpoint rendered articles and add the humanoid deployment snapshot before refreshing.')
        sources[key] = {**previous['sources'][key], 'refreshStatus': 'Retained verified rendered-article snapshot; direct HTML requires provider access.'}
    humanoid_deployments = previous.get('humanoidDeployments')
    if not humanoid_deployments:
        raise RuntimeError('Missing audited annual humanoid deployment snapshot.')

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
        'humanoidDeployments': humanoid_deployments,
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
        'methodology': 'Annual record-setting results by model release year. METR stitches Horizon 1.0 results before 2023 to Horizon 1.1 afterward. Earlier results are retrospective evaluations. Source intervals are divided by the fixed 2025 point estimate; they are not jointly estimated ratio intervals. Missing annual history is separately identified as reconstructed; it is not a METR measurement.',
        'baselineValue': annual[2025]['estimate'], 'observations': llm_observations,
    }
    h = inputs['humanoidDeployments']
    series['humanoid'] = {
        'metric': 'Annual humanoid robot deployments, installations and shipments proxy', 'definition': 'Counterpoint · annual humanoid deployments',
        'unit': 'robots/year', 'sourceName': 'Counterpoint Research', 'sourceUrl': source('counterpoint2025'),
        'scope': h['scope'],
        'methodology': 'The reported approximate 2025 installation count is the only full-year historical anchor. Earlier counts are unavailable, not backcast from a benchmark. The 2026 shipment forecast is a conservative scenario anchor, not an observed full-year total. Installations and shipments are proxies with different coverage; normalized line heights do not measure market share.',
        'baselineValue': 16000,
        'observations': [observation(row['year'], row['value'], row['source'], sourceName='Counterpoint Research',
            date=f"{row['year']}-12-31", coverage='annual-installations-estimate', approximate=True,
            precision=row['precision'], detail=row['detail']) for row in h['observations']],
    }
    ifr = inputs['ifr']
    for identity, key, exact_key, metric, definition, unit in [
        ('specialist', 'installations', 'installationExactYears', 'IFR annual industrial robot installations', 'IFR · annual industrial installations', 'robots/year'),
        ('deployment', 'installations', 'installationExactYears', 'Annual robot deployments, industrial installations proxy', 'IFR · annual industrial deployment proxy', 'robots/year'),
    ]:
        observations = []
        for offset, raw in enumerate(ifr[key]):
            year = ifr['firstYear'] + offset
            exact = year in ifr[exact_key]
            source_key = 'ifr2026' if year == 2025 else ('ifr2025' if exact else 'ifrChart2026')
            observations.append(observation(year, raw, source_key, sourceName='International Federation of Robotics',
                date=f'{year}-12-31', approximate=not exact,
                precision='Published unit count' if exact else 'Rounded to nearest 1,000 robots in source chart',
                detail='Annual installations' +
                    '; industrial robots worldwide. ' + ('Exact count from executive summary.' if exact else 'Chart value retains source rounding.')))
        series[identity] = {'metric': metric, 'definition': definition, 'unit': unit,
            'sourceName': 'International Federation of Robotics', 'sourceUrl': source('ifr2026'),
            'scope': 'Industrial robots worldwide; excludes a comprehensive count of service, medical and general-purpose humanoid robots. ' + ('Installations are a specialist-adoption proxy, not task performance.' if identity == 'specialist' else 'Annual installations anchor the authored future deployment scenario; historical observations are not a census of all robot categories.'),
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
        'methodology': inputs['corpusAudit'] + ' Alpha is replaced by Beta, adding only the difference. Initial DROID 1.0.0 is pinned; later repackaging is not new collection. RoboNet uses a later pinned TFDS representation of the 2019 corpus. Exact annual release-inventory totals are retained. Curves between annual snapshots are visual interpolation, not the actual timing of collection or release. Before 2019, the curve is an explicitly hypothetical historical reconstruction, not an inventory of these not-yet-released datasets.',
        'baselineValue': next(point['raw'] for point in inventory if point['year'] == 2025),
        'observations': inventory}

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
    installed = {row['year']: row['raw'] for row in series['specialist']['observations']}
    data_anchor = series['data']['baselineValue']
    # User-directed scenario targets, not inferred publisher forecasts.
    data_factor = 30
    parameters = {
        'llm': {'growthRate': growth, 'fitRecordCount': len(fit), 'fitRecords': [{'model': row['model'], 'date': row['date'], 'minutes': row['estimate']} for row in fit],
                'ceilingMinutes': 10 * 2000 * 60, 'anchorYear': 2026, 'anchorMinutes': annual[2026]['estimate'], 'pauseYear': 2035, 'workHoursPerYear': 2000},
        'humanoid': {'anchorYear': 2026, 'anchorDeployments': h['forecast2026Shipments'], 'growthExponent': .6,
                     'growthTransition': 10, 'linkedSeries': 'deployment', 'forecastQualifier': h['forecastQualifier']},
        'data': {'anchorYear': 2026, 'anchorEpisodes': data_anchor, 'ceilingFactor': data_factor, 'ceilingEpisodes': data_anchor * data_factor,
                 'growthRate': math.log(19 * (data_factor - 1)) / 5, 'plateauYear': 2031, 'plateauFraction': .95},
        'specialist': {'anchorYear': 2026, 'anchorInstallations': ifr['forecast2026Installations'], 'peakYear': 2031,
                       'peakInstallations': 4 * installed[2025], 'endYear': 2040, 'endInstallations': .25 * installed[2025]},
        'deployment': {'anchorYear': 2026, 'anchorDeployments': ifr['forecast2026Installations'], 'linkedSeries': 'llm',
                       'scope': 'Author-selected total-deployment scenario anchored to the annual industrial proxy, not a published forecast for all robots.'},
        'hardware': {'anchorYear': 2026, 'anchorPrice': prices[-1]['raw'], 'floorFraction': .03, 'halfLifeYears': 1.1},
    }

    def specialists(year):
        p = parameters['specialist']
        if year <= 2026:
            return installed[2025] * (p['anchorInstallations'] / installed[2025]) ** (year - 2025)
        if year <= 2031:
            return p['anchorInstallations'] * (p['peakInstallations'] / p['anchorInstallations']) ** ((year - 2026) / 5)
        return p['peakInstallations'] * (p['endInstallations'] / p['peakInstallations']) ** ((year - 2031) / 9)

    # A restrained, monotone change of pace gives the future the same varied
    # curvature as historical PCHIP paths. Inspection milestones and the existing
    # 2031 peak/plateau, 2035 pause and 2040 endpoints remain exactly in place.
    timing_years = list(range(2026, LAST_YEAR + 1))
    timing_offsets = {
        'llm': [0, -.25, .12, -.22, 0, 0, .18, -.15, .08, 0, .20, .06, -.18, .10, 0],
        'data': [0, -.18, .24, -.12, 0, 0, .12, -.20, .16, 0, .18, -.08, -.12, .16, 0],
        'specialist': [0, -.20, .16, -.15, 0, 0, .14, -.18, .10, 0, .16, -.10, .18, -.12, 0],
        'hardware': [0, -.14, .18, -.20, 0, 0, .16, -.12, .20, 0, .12, -.18, .08, -.10, 0],
    }
    timing_curves = {identity: PchipInterpolator(timing_years, [year + offset for year, offset in zip(timing_years, offsets)])
                     for identity, offsets in timing_offsets.items()}
    parameters['timing'] = {'method': 'Monotone PCHIP pace variation; not additional observations',
                            'years': timing_years, 'offsetYears': timing_offsets,
                            'fixedYears': [2026, 2030, 2031, 2035, 2040]}

    def scenario_year(identity, year):
        return float(timing_curves[identity](year)) if year > 2026 and identity in timing_curves else year

    def forecast(identity, year):
        p = parameters[identity]
        phase = scenario_year(identity, year)
        if identity == 'llm':
            return p['ceilingMinutes'] / (1 + (p['ceilingMinutes'] / p['anchorMinutes'] - 1) * math.exp(-p['growthRate'] * (min(phase, p['pauseYear']) - 2026)))
        if identity == 'humanoid':
            if year == 2025:
                return series['humanoid']['baselineValue']
            growth_factor = forecast('deployment', year) / parameters['deployment']['anchorDeployments']
            transition, exponent = p['growthTransition'], p['growthExponent']
            humanoid_growth = 1 + transition / exponent * ((1 + (growth_factor - 1) / transition) ** exponent - 1)
            return p['anchorDeployments'] * humanoid_growth
        if identity == 'data':
            return p['ceilingEpisodes'] / (1 + (p['ceilingFactor'] - 1) * math.exp(-p['growthRate'] * (phase - 2026)))
        if identity == 'hardware':
            return p['anchorPrice'] * (p['floorFraction'] + (1 - p['floorFraction']) * 2 ** (-(phase - 2026) / p['halfLifeYears']))
        if identity == 'specialist':
            return specialists(phase)
        if identity == 'deployment':
            if year == 2025:
                return series['deployment']['baselineValue']
            return p['anchorDeployments'] * forecast('llm', year) / parameters['llm']['anchorMinutes']
        raise ValueError(identity)

    parameters['humanoid']['initialModeledShare'] = h['forecast2026Shipments'] / parameters['deployment']['anchorDeployments']
    parameters['humanoid']['endModeledShare'] = forecast('humanoid', LAST_YEAR) / forecast('deployment', LAST_YEAR)

    scenario_notes = {
        'llm': ('https://ai-2040.com/supplements/takeoff-forecast', 'METR trend / Plan A-inspired scenario',
                'Logistic scenario anchored to the latest measured 2026 p80 horizon. Initial growth is fitted to 2023–2026 Horizon 1.1 records; a 10-work-year ceiling (2,000 hours/year) is an author-set anchor informed by AI 2040’s autonomous-coding threshold, not a measured maximum or a TED-AI equivalence. The 2035 level is held through 2040; no numerical resumption jump is invented.'),
        'humanoid': (source('counterpoint2026'), 'Annual humanoid-deployment scenario',
                     'The approximate 16,000 additional installations reported for 2025 replace the former benchmark-return measure. The 2026 anchor of 50,000 is a conservative reference to a published forecast of more than 50,000 shipments, not an observed full-year count. Future humanoid deployments initially follow modeled robot deployment growth, then grow sublinearly with exponent 0.6 and transition multiplier 10. Counts keep rising while their ratio to the modeled total shrinks. This ratio is an author-set relationship, not observed market share; the historical industrial proxy and humanoid shipment survey cover different populations.'),
        'data': ('https://github.com/OpenDriveLab/AgiBot-World', 'Public-corpus growth scenario',
                 'Logistic growth from the fixed inventory to an author-selected ceiling of 30 times its 2025 episode count; the curve reaches 95% of that ceiling in 2031. The ceiling, timing and saturation are scenario assumptions, not a prediction by the dataset publishers or an extrapolated historical CAGR.'),
        'specialist': (source('ifr2026'), 'IFR forecast / specialist-adoption scenario',
                       '2026 uses IFR’s 655,000-installation forecast. The site-authored annual scenario then grows geometrically to four times the 2025 count in 2031 and declines to one quarter of that 2025 count in 2040. A shape-preserving cubic rounds the peak between annual values without overshoot. These later targets are assumptions, not historical observations or IFR forecasts.'),
        'deployment': (source('ifr2026'), 'LLM-linked annual deployment scenario',
                       'Annual industrial installations replace the former operating-stock measure so both deployment series use robots per year. The authored future total-deployment scenario starts at the IFR 2026 industrial forecast of 655,000 and follows the same proportional growth, slowdown and 2035 pause as the LLM path. It is independent of the specialist-adoption curve. Industrial installations are a historical proxy, not a census of all robots, and the future count trajectory is not an IFR forecast.'),
        'hardware': ('https://www.boj.or.jp/en/statistics/outline/exp/pi/cgpi_2020/outline.htm', 'Robot-cost scenario',
                     'Author-selected cost decline from the January–October 2026 observed average: a 3% floor and a 1.1-year halving time for the distance above that floor. This reaches approximately 7.15% of the 2026 anchor in 2031; it is not a Bank of Japan price forecast.'),
    }

    interpolation_note = (
        'SciPy PCHIP in one common display coordinate T(I) = sign(z) * ln(1 + abs(z)), '
        'where z = ln(I / 100). This is D3 symlog with constant 1 applied to the '
        'logarithm of the normalized index. All six series use the same transform. '
        'The cubic passes through every annual knot, is continuously differentiable, '
        'and does not overshoot adjacent knots. Fractional-year values are visual '
        'interpolation, not additional measurements. Annual source values are unchanged.'
    )

    for identity, item in series.items():
        baseline = item['baselineValue']
        item['baselineYear'] = BASELINE_YEAR
        for point in item['observations']:
            point['value'] = point['raw'] / baseline * 100
            if 'ciLowRaw' in point:
                point['ciLow'] = point['ciLowRaw'] / baseline * 100
                point['ciHigh'] = point['ciHighRaw'] / baseline * 100
        assert next(row['raw'] for row in item['observations'] if row['year'] == 2025) == baseline
        start = 2025 if identity in ['humanoid', 'specialist', 'deployment'] else 2026
        url, name, detail = scenario_notes[identity]
        item['scenario'] = {'startYear': start, 'sourceUrl': url, 'sourceName': name, 'detail': detail, 'coverage': 'modeled-scenario'}
        observed = {point['year']: point for point in item['observations']}
        item['projections'] = []
        for year in range(start, LAST_YEAR + 1):
            # Copy the shared measured anchor exactly rather than round-tripping
            # through a formula and accidentally changing its final binary digit.
            raw = observed[year]['raw'] if year == start and year in observed else forecast(identity, year)
            projection = {'year': year, 'raw': raw, 'value': raw / baseline * 100}
            if identity == 'humanoid' and year >= 2026:
                projection['modeledRobotDeployments'] = forecast('deployment', year)
                projection['modeledShare'] = raw / projection['modeledRobotDeployments']
            item['projections'].append(projection)

        anchors = item['observations']
        first = anchors[0]
        # Skip repeated inventory totals when choosing the first supported trend.
        # A negative measured trend (e.g. BOJ prices in 2020–21) is kept negative.
        second = next((point for point in anchors[1:] if point['raw'] != first['raw']), first)
        first_rate = math.log(second['raw'] / first['raw']) / (second['year'] - first['year'] or 1)
        measured_curve = PchipInterpolator(
            [point['year'] for point in anchors],
            [display_value(point['value']) for point in anchors], extrapolate=False) if len(anchors) > 1 else None
        reconstruction = []
        history_start = first['year'] if identity == 'humanoid' else FIRST_YEAR
        for year in range(history_start, start + 1):
            if year in observed:
                continue
            if year < first['year']:
                supporting = [first, second]
                raw = first['raw'] * math.exp(first_rate * (year - first['year']))
                method = 'log-linear-backcast'
                explanation = (
                    f"The log(raw) slope between the first distinct observed anchors "
                    f"({first['year']} and {second['year']}) is extended backward. "
                    'This is an extrapolated estimate, not a publisher observation.'
                )
                if identity == 'data':
                    explanation += (
                        ' These corpora were not yet released; the value is a hypothetical '
                        'antecedent trajectory, not episodes available in the named inventory.'
                    )
                slope = first_rate
            else:
                before = max((point for point in anchors if point['year'] < year), key=lambda point: point['year'])
                after = min((point for point in anchors if point['year'] > year), key=lambda point: point['year'])
                supporting = [before, after]
                raw = inverse_display_value(float(measured_curve(year))) / 100 * baseline
                method = 'pchip-interpolation'
                slope = None
                explanation = (
                    f"Estimated between the {before['year']} and {after['year']} source observations "
                    'with shape-preserving PCHIP in the common display coordinate. '
                    'No new observation is implied.'
                )
            point = {
                'year': year, 'raw': raw, 'value': raw / baseline * 100,
                'kind': 'reconstructed', 'coverage': 'reconstructed-history',
                'date': str(year), 'approximate': True,
                'sourceName': 'Historical reconstruction', 'sourceUrl': 'sources/#trajectories',
                'precision': 'Estimated from source anchors; not reported data',
                'reconstructionMethod': method, 'detail': explanation,
                'anchorYears': [anchor['year'] for anchor in supporting],
                'anchors': [{key: anchor[key] for key in ['year', 'raw', 'value', 'date', 'sourceName', 'sourceUrl']}
                            for anchor in supporting],
            }
            if slope is not None:
                point['backcastSlopePerYear'] = slope
            reconstruction.append(point)
        item['reconstructed'] = reconstruction
        item['interpolation'] = {'method': 'PCHIP in common symlog-log coordinates', 'stepYears': SAMPLE_STEP, 'detail': interpolation_note}
        item['reconstruction'] = {
            'firstYear': history_start, 'firstObservedYear': first['year'],
            'method': 'unreported-before-first-observation' if identity == 'humanoid' else 'log-linear-backcast',
            'detail': 'No humanoid deployment counts are invented before 2025.' if identity == 'humanoid' else 'Estimated historical years are separate from unchanged source observations. No confidence intervals are invented for estimates.',
        }

        # One interpolator spans history and future so joins at 2025/2026 are C1,
        # while the annual model/accounting values remain exactly inspectable.
        annual_knots = {point['year']: point for point in item['projections']}
        annual_knots.update({point['year']: point for point in reconstruction})
        annual_knots.update(observed)
        years = list(range(history_start, LAST_YEAR + 1))
        curve = PchipInterpolator(years, [display_value(annual_knots[year]['value']) for year in years])
        samples = []
        for tick in range(history_start * 20, LAST_YEAR * 20 + 1):
            year = tick / 20
            if tick % 20 == 0:
                point = annual_knots[int(year)]
                samples.append({key: point[key] for key in ['year', 'raw', 'value']})
            else:
                value = inverse_display_value(float(curve(year)))
                samples.append({'year': year, 'raw': value / 100 * baseline, 'value': value})
        item['samples'] = samples

    positive = [point['value'] for item in series.values() for point in item['samples'] if point['value'] > 0]
    intervals = [point[key] for item in series.values() for point in item['observations'] for key in ['ciLow', 'ciHigh'] if point.get(key, 0) > 0]
    positive.extend(intervals)
    display_minimum = display_value(min(positive)) - .08
    display_maximum = display_value(max(positive)) + .08
    result = {
        'schemaVersion': 2, 'reviewedOn': inputs['reviewedOn'],
        'normalization': {'baselineYear': BASELINE_YEAR, 'formula': '100 * raw value / the same measure’s observed 2025 value',
                          'interpretation': 'Multiples compare each measure with its own baseline, not absolute capability across unlike measures.',
                          'displayTransform': 'D3 symlog(ln(index / 100)), constant 1, shared by every series; axis labels and readouts use the actual normalized index.'},
        'domain': {'firstYear': 2015, 'lastYear': 2040, 'dividerYear': 2026, 'baselineYear': BASELINE_YEAR,
                   'minimum': inverse_display_value(display_minimum), 'maximum': inverse_display_value(display_maximum),
                   'displayMinimum': display_minimum, 'displayMaximum': display_maximum,
                   'scale': 'symlog-log', 'symlogConstant': 1},
        'scenarioParameters': parameters, 'series': series,
        'audit': {'inputFile': 'data/observed-inputs.json', 'inputSha256': hashlib.sha256(INPUT.read_bytes()).hexdigest(),
                  'generator': 'scripts/build-graph-observations.py', 'sources': sources,
                  'interpolationLibrary': 'SciPy', 'interpolationVersion': scipy.__version__, 'interpolation': interpolation_note,
                  'requirements': 'scripts/requirements-graph.txt', 'corpora': corpora, 'corpusAudit': inputs['corpusAudit']},
    }
    dump(SITE / 'graph-observations.json', result)
    (SITE / 'graph-observations.js').write_text(
        '// Generated by scripts/build-graph-observations.py; edit publisher snapshots or the generator, then rebuild.\n'
        + 'export const observedGraph = ' + json.dumps(result, ensure_ascii=False, separators=(',', ':'), allow_nan=False) + ';\n', encoding='utf-8')
    print(json.dumps({'baselines': {key: item['baselineValue'] for key, item in series.items()},
                      'hardware2026Ytd': prices[-1]['raw'], 'domain': result['domain'],
                      'llmGrowthRate': growth,
                      'humanoidModeledShares': {key: parameters['humanoid'][key] for key in ['initialModeledShare', 'endModeledShare']},
                      'endpoints': {key: item['projections'][-1]['value'] for key, item in series.items()}}, indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--refresh', action='store_true', help='Re-download and validate primary sources before rebuilding; review resulting changes.')
    args = parser.parse_args()
    if args.refresh:
        refresh()
    build()
