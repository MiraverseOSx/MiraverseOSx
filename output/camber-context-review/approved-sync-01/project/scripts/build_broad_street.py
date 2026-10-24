"""Build the authored Broad Street desktop pilot. Python is needed only at build time."""
import argparse
import json
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CANONICAL = ROOT / 'frontend/src/dgaos/data/cases/case-002-broad-street-vault.json'
DESTINATION = ROOT / 'frontend/src/data'

def build(seed=42):
    original = json.loads(CANONICAL.read_text(encoding='utf-8-sig'))
    rng = random.Random(seed)
    reference = f"BS-REVIEW-{rng.randrange(10000, 99999)}"
    sources = [
        dict(id='access-audit', app='files', title='Vault access audit', publisher='Depository access-control custodian', body='''FS-2026-00422 / Restricted access audit
2026-09-12, 01:58 UTC. Sub-Level 2 accepted credential CRUZ-9012. The audit service flags this transaction as a duplicated credential replay rather than a fresh presentation by a verified person. A valid badge identifier is an identifier of the credential, not a photograph or biometric identification of its user.

At 02:11 UTC the emergency duress record identifies an assault on night security officer Mateo Cruz. The badge acceptance precedes the duress alarm. The audit cannot place Cruz at the reader when the replay occurred; access logs record transactions rather than continuous human presence.

The exported entries retain UTC timestamps. Do not treat a local display setting as a change to the underlying sequence. The replay determination concerns the credential transaction; it does not identify who created or used the duplicate. Compare the guard's account, physical findings, and published maintenance arrangements before attributing responsibility.

Custody: original audit export received from the access-control custodian; this read-only copy retains the original case reference. No badge secret or replay procedure is included.'''),
        dict(id='thermal-log', app='files', title='HVAC thermal and smoke record', publisher='Depository facilities custodian', body='''FS-2026-00422 / Facilities sensor export
2026-09-12, 02:24 UTC. The upper vault-door hinge sensor recorded an extreme localized temperature excursion exceeding 2,400 degrees Celsius, accompanied by smoke. The spatially concentrated trace is different from an ordinary room-wide HVAC temperature rise.

The sensor establishes when and where unusual heating was observed. It does not identify an operator or determine an exact chemical composition. Facilities staff preserved the original export and did not reset its clock after the incident.

The access audit contains an earlier sub-level credential event. Compare the two records without assuming that digital access alone opened the reinforced vault door. A physical breach can follow an electronic access event. The metallurgy examination of the recovered hinge-area slag is the relevant comparison for the mechanism of heating.

The recorded 02:24 observation is not the incident header's 02:15 timestamp; the header is a summary reference, not a replacement for individual source times. Retain source-level times in your reconstruction and state any remaining uncertainty about unobserved events.'''),
        dict(id='guard-statement', app='mail', title='Mateo Cruz — requested clarification', publisher='Mateo Cruz / recorded statement', body='''Question: What do you remember about your badge, the alarm, and the sequence of events?

Mateo Cruz: I was the night security officer. I did not authorize another person to use my badge. I was attacked from behind and restrained with nylon zip-ties. The duress record at 02:11 UTC is the available timing reference for that assault; I cannot give a reliable second-by-second account while restrained.

I cannot identify the person at the reader from the badge number. I did not see who operated the cutting equipment. I heard activity later, but hearing noise is not enough for me to name a tool or an operator. Please distinguish what I saw from what I inferred afterward.

Routine contractors have to follow the depository's published maintenance arrangements. A maintenance listing alone would not prove that someone was present during the incident. Please compare the facilities notice with the case records.

Recorder's note: this is a requested clarification, not independent corroboration of every assertion. Assess it alongside the transaction audit and laboratory findings. No statement of guilt or innocence is issued by this correspondence.'''),
        dict(id='metallurgy', app='dgaos', title='EV-0010 — metallurgy examination', publisher='Dr. Soren Dahl / Trace Metallurgy', evidenceId='EV-0010', body='''FS-2026-00422 / EV-0010
Item: Thermite Cutting Lance Slag & Copper Wire Core. Seal: intact. Custody begins with CSI Officer Jenkins transferring the item to Dr. Soren Dahl at 05:00 UTC on 2026-09-12 for SEM-EDS elemental characterization in Metallurgy Bay M-01.

Recovered hinge-area material contains iron, copper, and aluminum oxide residues. The case examination identifies an exothermic cutting-lance composition; comparison material from Silas Drake's welding gloves shows an elemental profile consistent with the recovered slag. The thermal log provides a separate record of localized heating at the hinge.

Elemental consistency supports comparison of materials. It is not an individualizing identification of the person holding a tool, and this examination alone cannot establish when material reached the gloves. Describe the correspondence accurately rather than calling it a personal identification.

Review the chain of custody and compare the source with the thermal record. The combined material and heat findings inform a physical-entry explanation. They do not, by themselves, resolve every participant's role. This laboratory source is a finding, not a courtroom verdict.'''),
        dict(id='dna', app='dgaos', title='EV-0011 — bloodstain DNA findings', publisher='Maya Patel / Forensic Biology', evidenceId='EV-0011', body='''FS-2026-00422 / EV-0011
Item: Hinge Bloodstain Swab. Seal: intact. CSI Officer Jenkins transferred the swab to Maya Patel at 05:15 UTC on 2026-09-12 for STR profiling. The source is a dried bloodstain on the severed vault hinge pin, not an access-control credential.

The case's GlobalFiler 24-Plex analysis associates the recovered profile with Silas Drake. The existing laboratory exhibit reports a random-match statistic of approximately one in twelve trillion. That statistic concerns a profile comparison under the stated model; it is not a numerical probability of guilt.

The swab location is relevant context, but this test cannot establish precisely when the blood was deposited, identify every person present, or reconstruct an entire incident. It cannot establish that the guard operated a reader merely because the transaction used his badge identifier.

Keep observations and conclusions separate. Cite the profile association, its location, and the preservation record, then identify what additional reconstruction remains unproved. A DNA association and a material comparison may support further investigation; neither is a substitute for a documented chain of reasoning.'''),
        dict(id='maintenance', app='browser', title='First Federal Depository — maintenance arrangements', publisher='First Federal Depository / public facilities desk', url='https://firstfederal.aure/maintenance', body='''First Federal Depository / Broad Street public facilities notice
Published 2026-09-01. This notice describes routine arrangements before the September 12 incident. Scheduled contractors must register their attendance and be escorted in restricted areas. Possession of a badge identifier is not a public authorization to enter a vault.

Standard maintenance is scheduled and documented through the facilities desk. This page is a general policy notice, not a list of people present on a particular night. It neither confirms nor rules out a particular contractor's attendance. Only the restricted attendance and incident records can address a specific visit.

Public opening hours and maintenance arrangements describe different kinds of access. Investigators should not substitute a general policy for an individual access record. Questions about published arrangements can be directed to the facilities desk; personal security records are not published here.

Fictional VerseNet publication. The page contains no private laboratory findings, case solution, or external internet link.'''),
    ]
    data = dict(schemaVersion=1, version='broad-street-v1', seed=seed, reference=reference,
                caseId=original['meta']['id'], caseNumber=original['meta']['caseNumber'], title=original['meta']['title'],
                missionId='ms-case-002', chronology=original['timeline'], sources=sources)
    validate(data, original)
    return data

def validate(data, original=None):
    assert data['caseId'] == 'CASE-2026-002' and data['caseNumber'] == 'FS-2026-00422'
    assert len(data['sources']) == 6 and len({s['id'] for s in data['sources']}) == 6
    assert {s.get('evidenceId') for s in data['sources'] if s.get('evidenceId')} == {'EV-0010', 'EV-0011'}
    assert all(s['body'].strip() and s['app'] in ['files', 'mail', 'dgaos', 'browser'] for s in data['sources'])
    assert len([s for s in data['sources'] if s['app'] == 'browser']) == 1
    if original:
        assert data['chronology'] == original['timeline']
    assignment = json.loads((DESTINATION / 'broad-street-assignment.json').read_text(encoding='utf-8'))
    assert assignment['id'] == data['missionId'] and assignment['rewardCredits'] == 300 and assignment['rewardXP'] == 150 and assignment['rewardBits'] == 0
    return True

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--seed', type=int, default=42)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    data = build(args.seed)
    public = next(s for s in data['sources'] if s['app'] == 'browser')
    public_data = {key: public[key] for key in ['id', 'title', 'publisher', 'url', 'body']}
    outputs = {'broad-street-case.json': data, 'broad-street-public.json': public_data}
    for name, value in outputs.items():
        path = DESTINATION / name
        text = json.dumps(value, indent=2, ensure_ascii=False) + '\n'
        if args.check:
            if path.read_text(encoding='utf-8') != text:
                raise SystemExit(f'Generated package differs: {path}')
        else:
            path.write_text(text, encoding='utf-8')
    print('Broad Street case package validated' if args.check else 'Built Broad Street case package and public page')

if __name__ == '__main__':
    main()
