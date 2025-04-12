from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def hello_world():
    return render_template("home.html")
    # return "<p>Hello, World!</p>"

@app.route("/home")
def home():
    return render_template("home.html")

@app.route("/launch-map")
def launch_map():
    return render_template("launch-map.html")

@app.route("/missions-planets")
def missions_planets():
    return render_template("missions-planets.html")

@app.route("/project-story")
def project_story():
    return render_template("project-story.html")

@app.route("/statistics")
def statistics():
    return render_template("statistics.html")

@app.route("/about")
def about():
    return render_template("about.html")
