
from flask import Flask, render_template
import os

app = Flask(__name__)

# List of pages you want to render
pages = [
    {'url': '/', 'template': 'index.html', 'filename': 'index.html'},
    {'url': '/home', 'template': 'home.html', 'filename': 'home.html'},
    # {'url': '/launch-map', 'template': 'launch-map.html', 'filename': 'launch-map.html'},
    {'url': '/solar-system', 'template': 'solar-system.html', 'filename': 'solar-system.html'},
    {'url': '/milky-way', 'template': 'milky-way.html', 'filename': 'milky-way.html'},
    {'url': '/project-story', 'template': 'project-story.html', 'filename': 'project-story.html'},
    {'url': '/about', 'template': 'about.html', 'filename': 'about.html'},
]

# Function to render and save pages
def save_html():
    if not os.path.exists('pages'):
        os.makedirs('pages')  # Create output folder if not exists

    for page in pages:
        with app.test_request_context(page['url']):
            # Render each template
            html_content = render_template(page['template'])
            output_path = os.path.join('pages', page['filename'])
            
            # Write the rendered HTML to a file in the output directory
            print(output_path)
            with open(output_path, 'w') as f:
                f.write(html_content)
            print(f"Generated {output_path}")

if __name__ == '__main__':
    save_html()
    print("All pages have been generated.")