from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")
    # return "<p>Hello, World!</p>"

@app.route("/home")
def home():
    return render_template("home.html")

@app.route("/launch-map")
def launch_map():
    return render_template("launch-map.html")

@app.route("/solar-system")
def solar_system():
    return render_template("solar-system.html")

@app.route("/milky-way")
def milky_way():
    return render_template("milky-way.html")

@app.route("/project-story")
def project_story():
    return render_template("project-story.html")

@app.route("/about")
def about():
    return render_template("about.html")
