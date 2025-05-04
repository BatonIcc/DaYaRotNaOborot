from datetime import datetime, timedelta
import jwt
from app import app


class Token():
    def generate_jwt_token(username: str):
        payload = {
            "username" : username,
            "exp" : datetime.now() + timedelta(minutes=10)
        }
        return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

    def validate_jwt_token(token: str):
        try:
            payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            return payload
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            return None