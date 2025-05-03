from typing import Optional
import sqlalchemy as sa
import sqlalchemy.orm as so
from hashlib import sha256
import hashlib
import numpy as np
from PIL import Image, ImageDraw
from flask_login import UserMixin
from app import db, login

class User(UserMixin, db.Model):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    username: so.Mapped[str] = so.mapped_column(sa.String(64), index=True, unique=True)
    email: so.Mapped[str] = so.mapped_column(sa.String(120), index=True, unique=True)
    pass_sha256: so.Mapped[Optional[str]] = so.mapped_column(sa.String(64))
    role: so.Mapped[Optional[str]] = so.mapped_column(sa.String(10), index=True)

    def set_password(self, password: str):
        self.pass_sha256 = sha256(password.encode()).hexdigest()
        return self.pass_sha256

    def get_avatar_filename(self):
        return f"{hashlib.sha256(self.username.encode()).hexdigest()}.png"

    def generate_avatar(self, size=120, grid_size=5, mirror=True):
        hash_obj = hashlib.md5(self.username.encode('utf-8'))
        hash_hex = hash_obj.hexdigest()

        hash_values = [int(hash_hex[i:i + 2], 16) for i in range(0, len(hash_hex), 2)]

        color = tuple(hash_values[:3])

        grid = np.zeros((grid_size, grid_size), dtype=bool)

        for i in range(grid_size):
            for j in range((grid_size + 1) // 2 if mirror else grid_size):
                index = (i * grid_size + j) % len(hash_values)
                if hash_values[index] % 2 == 0:
                    grid[i][j] = True
                    if mirror and j < grid_size // 2:
                        grid[i][grid_size - 1 - j] = True

        img = Image.new('RGB', (size, size), (240, 240, 240))
        draw = ImageDraw.Draw(img)

        block_size = size // grid_size

        for i in range(grid_size):
            for j in range(grid_size):
                if grid[i][j]:
                    x0 = j * block_size
                    y0 = i * block_size
                    x1 = (j + 1) * block_size
                    y1 = (i + 1) * block_size
                    draw.rectangle([x0, y0, x1, y1], fill=color)
        img.save(f"app/static/avatars/{hashlib.sha256(self.username.encode()).hexdigest()}.png")

    def check_password(self, password):
        return sha256(password.encode()).hexdigest() == self.pass_sha256

class Game(db.Model):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    name: so.Mapped[str] = so.mapped_column(sa.String(64), index=True, unique=True)
    desc: so.Mapped[str] = so.mapped_column(sa.String(200), index=True)
    early: so.Mapped[Optional[bool]] = so.mapped_column(sa.Boolean())
    url: so.Mapped[str] = so.mapped_column(sa.String(64), index=True)

class Employee(db.Model):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    first_name: so.Mapped[str] = so.mapped_column(sa.String(64), index=True)
    last_name: so.Mapped[str] = so.mapped_column(sa.String(64), index=True)
    post: so.Mapped[str] = so.mapped_column(sa.String(64), index=True)

class Achievement(db.Model):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    title: so.Mapped[str] = so.mapped_column(sa.String(64), index=True, unique=True)
    value: so.Mapped[str] = so.mapped_column(sa.String(64), index=True)

@login.user_loader
def load_user(id):
    return db.session.get(User, int(id))