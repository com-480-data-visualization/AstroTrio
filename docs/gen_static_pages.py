
from flask import Flask, render_template
import os

app = Flask(__name__)

# List of pages you want to render
pages = [
    {'url': '/', 'template': 'index.html', 'filename': 'index.html'},
    {'url': '/home', 'template': 'home.html', 'filename': 'home.html'},
    {'url': '/launch-map', 'template': 'launch-map.html', 'filename': 'launch-map.html'},
    {'url': '/missions-planets', 'template': 'missions-planets.html', 'filename': 'missions-planets.html'},
    {'url': '/project-story', 'template': 'project-story.html', 'filename': 'project-story.html'},
    {'url': '/statistics', 'template': 'statistics.html', 'filename': 'statistics.html'},
    {'url': '/about', 'template': 'about.html', 'filename': 'about.html'},
]

# Function to render and save pages
def save_html():
    if not os.path.exists('docs/pages'):
        os.makedirs('docs/pages')  # Create output folder if not exists

    for page in pages:
        with app.test_request_context(page['url']):
            # Render each template
            html_content = render_template(page['template'])
            output_path = os.path.join('docs/pages', page['filename'])
            
            # Write the rendered HTML to a file in the output directory
            with open(output_path, 'w') as f:
                f.write(html_content)
            print(f"Generated {output_path}")

if __name__ == '__main__':
    save_html()
    print("All pages have been generated.")