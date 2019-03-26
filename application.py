from flask import Flask, render_template, redirect, url_for
from flask_socketio import SocketIO, send, join_room
from flask_sqlalchemy import SQLAlchemy


app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///canvas.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

from models import Canvas

socketio = SocketIO(app)

id_to_data_url = {}

@app.route('/')
def index():
    canvases = Canvas.query.all()
    return render_template('index.html', canvases=canvases)


@app.route('/canvas', methods=['POST'])
def create_canvas():
    canvas = Canvas()
    db.session.add(canvas)
    db.session.commit()
    return redirect(url_for('canvas', id=canvas.id))


@app.route('/canvas/<int:id>')
def canvas(id):
    return render_template('canvas.html', id=id)


@socketio.on('update')
def on_update(data):
    id_to_data_url[data['id']] = data['data_url']
    send(data['data_url'], room=data['id'])


@socketio.on('join')
def on_join(data):
    join_room(data['id'])
    if data['id'] not in id_to_data_url:
        canvas = Canvas.query.filter_by(id=data['id']).first()
        id_to_data_url[data['id']] = canvas.data_url
    send(id_to_data_url[data['id']])


@socketio.on('save')
def on_save(data):
    canvas = Canvas.query.filter_by(id=data['id']).first()
    canvas.data_url = data['data_url']
    db.session.commit()


if __name__ == '__main__':
    socketio.run(app)
