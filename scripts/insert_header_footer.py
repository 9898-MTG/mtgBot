import os

# Define the header and footer content
header_content = '''<header>
    <nav>
        <label for="menu" class="visually-hidden">Navigate to:</label>
        <select id="menu" aria-label="Navigation Menu">
            <option value="about">About</option>
            <option value="apps">Apps</option>
            <option value="blog">Blog</option>
            <option value="calendar">Calendar</option>
            <option value="chaos_commander_drafting">Chaos Commander Drafting</option>
            <option value="chat">Chat</option>
            <option value="code">Code</option>
            <option value="css">CSS</option>
            <option value="custom">Custom</option>
            <option value="database">Database</option>
            <option value="discord">Discord</option>
            <option value="events">Events</option>
            <option value="formats">Formats</option>
            <option value="forms">Forms</option>
            <option value="functions">Functions</option>
            <option value="generator">Generator</option>
            <option value="gpt">GPT</option>
            <option value="html">HTML</option>
            <option value="images">Images</option>
            <option value="index">Index</option>
            <option value="javascript">JavaScript</option>
            <option value="league">League</option>
            <option value="libraries">Libraries</option>
            <option value="lists">Lists</option>
            <option value="lua">Lua</option>
            <option value="management">Management</option>
            <option value="markdown">Markdown</option>
            <option value="members">Members</option>
            <option value="modules">Modules</option>
            <option value="mse">MSE</option>
            <option value="mtg">MTG</option>
            <option value="mtgBot">MTG Bot</option>
            <option value="mtgFormat">MTG Format</option>
            <option value="mythicRare">Mythic Rare</option>
            <option value="nodejs">Nodejs</option>
            <option value="notes">Notes</option>
            <option value="objectives">Objectives</option>
            <option value="openingPacks">Opening Packs</option>
            <option value="options">Options</option>
            <option value="output">Output</option>
            <option value="packs">Packs</option>
            <option value="pages">Pages</option>
            <option value="pdf">PDF</option>
            <option value="personalityTraits">Personality Traits</option>
            <option value="planeswalkers">Planeswalkers</option>
            <option value="players">Players</option>
            <option value="programmingLanguages">Programming Languages</option>
            <option value="projects">Projects</option>
            <option value="prompts">Prompts</option>
            <option value="pullRequests">Pull Requests</option>
            <option value="questions">Questions</option>
            <option value="rare">Rare</option>
            <option value="readme">Read Me</option>
            <option value="regularExpressions">Regular Expressions</option>
            <option value="releaseNotes">Release Notes</option>
            <option value="repositories">Repositories</option>
            <option value="resources">Resources</option>
            <option value="response">Response</option>
            <option value="rules">Rules</option>
            <option value="scripts">Scripts</option>
            <option value="scryfall">Scryfall</option>
            <option value="services">Services</option>
            <option value="sheets">Sheets</option>
            <option value="sites">Sites</option>
            <option value="solution">Solution</option>
            <option value="story">Story</option>
            <option value="summary">Summary</option>
            <option value="tableOfContents">Table Of Contents</option>
            <option value="tables">Tables</option>
            <option value="termsAndConditions">Terms & Conditions</option>
            <option value="tts">TTS</option>
            <option value="turnStructure">Turn Structure</option>
            <option value="untap">Untap</option>
            <option value="upkeep">Upkeep</option>
            <option value="variables">Variables</option>
            <option value="web">Web</option>
            <option value="webApps">Web Apps</option>
            <option value="webDevelopment">Web Development</option>
            <option value="webPage">Web Page</option>
            <option value="zone">Zone</option>
        </select>
    </nav>
</header>'''

footer_content = '''<footer>
    <p>2024 © 9898-MTG</p>
</footer>'''

# Function to insert header and footer into an HTML file
def insert_header_footer(file_path):
    with open(file_path, 'r') as file:
        lines = file.readlines()

    # Find the positions to insert header and footer
    body_start = next(i for i, line in enumerate(lines) if '<body>' in line)
    body_end = next(i for i, line in enumerate(lines) if '</body>' in line)

    # Insert header and footer
    lines.insert(body_start + 1, header_content + '\n')
    lines.insert(body_end + 1, footer_content + '\n')

    # Write the modified content back to the file
    with open(file_path, 'w') as file:
        file.writelines(lines)

# Iterate over all HTML files in the current directory and subdirectories
for root, _, files in os.walk('.'):
    for file in files:
        if file.endswith('.html'):
            insert_header_footer(os.path.join(root, file))
