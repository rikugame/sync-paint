from flask_sqlalchemy import SQLAlchemy
from application import db


class Canvas(db.Model):
    __tablename__ = 'canvas'
    id = db.Column(db.Integer, primary_key=True)
    data_url = db.Column(db.Text)