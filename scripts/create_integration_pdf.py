from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output' / 'pdf' / 'miraverse-integration-plan.pdf'
OUT.parent.mkdir(parents=True, exist_ok=True)
PURPLE = colors.HexColor('#39234f')
MUTED = colors.HexColor('#696273')
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='TitleMV', fontName='Helvetica-Bold', fontSize=29, leading=34, textColor=PURPLE, spaceAfter=14))
styles.add(ParagraphStyle(name='EyebrowMV', fontName='Helvetica-Bold', fontSize=9, leading=13, textColor=PURPLE, spaceAfter=12))
styles.add(ParagraphStyle(name='HeadMV', fontName='Helvetica-Bold', fontSize=14, leading=19, textColor=PURPLE, spaceBefore=17, spaceAfter=7))
styles.add(ParagraphStyle(name='BodyMV', fontName='Helvetica', fontSize=10.5, leading=16, textColor=colors.HexColor('#302841'), spaceAfter=9))
styles.add(ParagraphStyle(name='SmallMV', fontName='Helvetica', fontSize=9, leading=13, textColor=MUTED, spaceAfter=7))
story = []
def p(text, style='BodyMV'):
    story.append(Paragraph(text, styles[style]))

p('MIRAVERSEOSx / INTEGRATION PLAN', 'EyebrowMV')
p('One desktop.<br/>Two connected worlds.', 'TitleMV')
p('Service Directory + VerseNet external Internet gateway', 'HeadMV')
p('MiraverseOSx already has a React/TypeScript desktop and a window-management system. The service workspace can live inside a Miraverse window and also open separately as a standalone HTML application.')
p('Three parts', 'HeadMV')
for title, body in [
    ('1. Service Directory', 'A searchable catalog of your 11 applications, grouped by function. Find a service by name, category, or purpose, and edit its destination when needed.'),
    ('2. Service Viewer', 'An internal tabbed workspace for compatible websites and downloaded HTML applications. Every configured service has an option to open separately.'),
    ('3. Miraverse Integration', 'Use the existing VerseNet launcher and window controls. Keep web destinations in saved tabs, history, and bookmarks; keep service links in a separate local directory.'),
]:
    p(f'<b>{title}</b><br/>{body}')
p('How VerseNet connects to the real Internet', 'HeadMV')
p('<b>VerseNet: in-world Internet.</b> Fictional companies, public records, social platforms, and game-generated content remain inside Miraverse.')
p('<b>Optional external gateway.</b> A real web address opens a clearly labeled gateway. Choose to try it inside VerseNet or open it in your separate browser. Ordinary VerseNet searches remain in the fictional network.')
p('A player could browse a fictional news site, then open an independent medical simulation tool while keeping the Miraverse desktop available.')
p('Design intent: preserve existing Miraverse apps and keep independent services separate from gameplay data unless a connection is deliberately designed.', 'SmallMV')
story.append(PageBreak())
p('MIRAVERSEOSx / SERVICE DIRECTORY', 'EyebrowMV')
p('Your professional<br/>services hub', 'TitleMV')
p('The selected applications', 'HeadMV')
groups = [
 ('Medical &amp; Clinical', [('MedCore', None), ('12 Lead Simulator', 'https://12leadsimulator.com/'), ('SimCore', 'https://simcore.app/')]),
 ('Police &amp; Law Enforcement', [('PoliceCase Toolkit', 'https://dankus.co.uk/index.php'), ('GUMA Tools', 'https://github.com/DamiJJJ/GUMA-tools')]),
 ('Investigation &amp; Forensics', [('OSINT Case', 'https://github.com/emrekybs/osintcase'), ('Forensics Triage Tool', 'https://github.com/SomarGuy/forensics-triage-tool')]),
 ('Legal &amp; Courtroom', [('Hadmaya', 'https://jus-tice.com/'), ('Bates Stamps', 'https://batesstamp.com/')]),
 ('Fictional Documents &amp; Data', [('GralRPG', 'https://gralrpg.com/'), ('Faker.tools', 'https://faker.tools/')]),
]
for name, apps in groups:
    links = ' / '.join(f'<link href="{url}" color="#39234f">{title}</link>' if url else f'{title} (link needed)' for title, url in apps)
    p(f'<b>{name}</b><br/>{links}')
p('Two ways to open services', 'HeadMV')
p('<b>Inside the workspace.</b> Compatible websites can be tried in a restricted embedded view. Selected local HTML files can be previewed without uploading their contents.')
p('<b>Separate window or tab.</b> Open configured websites in your browser. In the native desktop host, saved local HTML file addresses can also be opened through the system. The browser decides whether a web destination uses a new tab or window.')
p('Technical limits', 'HeadMV')
p('Some websites block embedded views or require browser features and sign-ins unavailable in the restricted viewer. Use Open separately for those services. GitHub links open repositories; downloaded software may need installation or a local server.')
p('Selected HTML files must be selected again after restarting. Tools with supporting files may need their original folder structure or a local server. External links and open website destinations are saved locally; local HTML file contents are not saved.')
p('The directory itself requires no account or server. External websites and their resources require an Internet connection. Embedding compatibility has not been verified for each service.', 'SmallMV')

def footer(canvas, doc):
    canvas.setStrokeColor(colors.HexColor('#dedde3'))
    canvas.line(48, 43, 564, 43)
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(48, 29, 'MiraverseOSx  |  Integration plan  |  October 22, 2026')
    canvas.drawRightString(564, 29, str(doc.page))

doc = SimpleDocTemplate(str(OUT), pagesize=(612, 792), rightMargin=48, leftMargin=48, topMargin=44, bottomMargin=58, title='MiraverseOSx Integration Plan', author='MiraverseOSx')
doc.build(story, onFirstPage=footer, onLaterPages=footer)
reader = PdfReader(OUT)
assert len(reader.pages) == 2, f'Expected 2 pages, got {len(reader.pages)}'
assert all(page.extract_text().strip() for page in reader.pages)
print(f'Created {OUT} ({len(reader.pages)} pages)')
