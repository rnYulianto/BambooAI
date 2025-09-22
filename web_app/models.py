from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin

db = SQLAlchemy()

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    nip = db.Column(db.String(100))
    unit_kerja = db.Column(db.String(255))
    jabatan = db.Column(db.String(255))
    role = db.Column(db.String(50), default='user')
