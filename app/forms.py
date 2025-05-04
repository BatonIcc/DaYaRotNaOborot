from flask_wtf import FlaskForm
from wtforms import PasswordField, BooleanField, SubmitField, StringField
from wtforms.validators import DataRequired, Email, ValidationError, EqualTo
from app import db
from app.models import User
from app.tokens import Token
import sqlalchemy as sa

class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])
    remember_me = BooleanField('Remember Me')
    submit = SubmitField('Войти')
    valid_error = ''

    def validate_email(self, email):
        self.valid()
        if self.valid_error:
            raise ValidationError(self.valid_error)

    def validate_password(self, password):
        if self.valid_error:
            raise ValidationError(self.valid_error)

    def valid(self):
        query = f"SELECT * FROM user WHERE email = '{self.email.data}'"
        try:
            with db.engine.connect() as conn:
                result = conn.execute(sa.text(query))
            columns = result.keys()
            rows = result.all()
            user_data = [dict(zip(columns, row)) for row in rows]
            if len(user_data) > 1:
                self.valid_error = f"RuntimeError \n{user_data}"
            elif not len(user_data) or user_data[0]['pass_sha256'] != User.set_password(User(), self.password.data):
                self.valid_error = f"Неверная почта или пароль"
        except BaseException as err:
            self.valid_error = str(err)

class RegistrationForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    password2 = PasswordField('Repeat Password', validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('Зарегистрироваться')

    def validate_username(self, username):
        user = db.session.scalar(sa.select(User).where(
            User.username == username.data))
        if user is not None:
            raise ValidationError('Пользователь с таким именем уже существует.')

    def validate_email(self, email):
        user = db.session.scalar(sa.select(User).where(
            User.email == email.data))
        if user is not None:
            raise ValidationError('Пользователь с такой почтой уже существует.')

class AdminForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    submit = SubmitField('Сгенегировать токен')

    def validate_username(self, username):
        user = db.session.scalar(sa.select(User).where(User.username == username.data))
        if user is None:
            raise ValidationError("пользователь не найден")

class TokenForm(FlaskForm):
    def __init__(self, *args, username=None, **kwargs):
        super().__init__(*args, **kwargs)
        self.username = username

    UserToken = StringField('UserToken', validators=[DataRequired()])
    submit = SubmitField('Проверить токен')

    def validate_UserToken(self, user_token):
        payload = Token.validate_jwt_token(user_token.data)
        if not payload or payload['username'] != self.username:
            raise ValidationError("некорректный токен")

class ChangePassForm(FlaskForm):
    def __init__(self, *args, username=None, **kwargs):
        super().__init__(*args, **kwargs)
        self.username = username
        
    last_password = PasswordField('Password', validators=[DataRequired()])
    new_password = PasswordField('New password', validators=[DataRequired()])
    new_password2 = PasswordField('New password', validators=[DataRequired(), EqualTo('new_password')])
    submit = SubmitField('Изменить пароль')

    def validate_last_password(self, password):
        user = db.session.scalar(sa.select(User).where(User.username == self.username))
        if not user.check_password(password.data):
            raise ValidationError("неверный пароль")


class ChangeNameForm(FlaskForm):
    def __init__(self, *args, username=None, **kwargs):
        super().__init__(*args, **kwargs)
        self.username = username

    new_username = PasswordField('New username', validators=[DataRequired()])
    password = PasswordField('password', validators=[DataRequired()])
    submit = SubmitField('Изменить имя')

    def validate_password(self, password):
        user = db.session.scalar(sa.select(User).where(User.username == self.username))
        if not user.check_password(password.data):
            raise ValidationError("неверный пароль")

    def validate_new_username(self, password):
        user = db.session.scalar(sa.select(User).where(User.username == self.new_username.data))
        if user:
            raise ValidationError("Пользователь с таким именем уже существует.")