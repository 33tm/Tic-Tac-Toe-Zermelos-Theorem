from json import load
from flask import Flask, send_file

from anytree import Node
from anytree.exporter import UniqueDotExporter

with open("../data/boards.json") as f:
    boards = load(f)

app = Flask(__name__)

@app.route("/<path:subpath>")
def image(subpath):
    path = subpath.split("/")

    target = boards
    for key in path:
        target = target[key]
    node = Node(key)
    build(target, parent=node)
    
    name = f"./boards/{subpath.replace("/", ".")}.png"
    UniqueDotExporter(node).to_picture(name)
    return send_file(name)

def build(data, parent=None, depth=0):
    if depth > 1:
        return
    if isinstance(data, dict):
        for key, value in data.items():
            node = Node(key, parent=parent)
            build(value, parent=node, depth=depth+1)
    elif data == "X" or data == "O" or data is None:
        Node(data, parent=parent)