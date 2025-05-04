from flask import render_template, redirect, url_for, request, jsonify
from flask_login import current_user, login_user, logout_user, login_required
from flask_principal import Permission, RoleNeed, Identity, identity_changed, identity_loaded
import sqlalchemy as sa
from app import app, db
from app.forms import LoginForm, AdminForm, RegistrationForm, TokenForm, ChangePassForm, ChangeNameForm
from app.models import User, Game, Employee, Achievement
from app.tokens import Token
import yaml
from app.tic_tac_toe import MiniMax

admin_permission = Permission(RoleNeed('admin'))
user_permission = Permission(RoleNeed('user'))
tester_permission = Permission(RoleNeed('tester'))

@app.route('/')
@app.route('/index')
@login_required
@user_permission.require(http_exception=404)
def index():
    db_games = db.session.execute(db.select(Game)).scalars().all()
    games = []
    for game in db_games:
        games.append(
            {
                'game_title': game.name,
                'desc': game.desc,
                'url': game.url,
                'img_url': url_for('static', filename=f'img/{game.name}.jpg'),
                'early': game.early
            }
        )
    return render_template("index.html", games=games, user_data=get_user_data(current_user.id))

@app.route('/admin', methods=['GET', 'POST'])
@login_required
@admin_permission.require(http_exception=404)
def admin():
    form = AdminForm()
    if form.validate_on_submit():
        token = {
            'token' : Token.generate_jwt_token(form.username.data),
            'username' : form.username.data
        }
        return render_template('admin.html', token=token, form=form)
    return render_template('admin.html', form=form)


@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = LoginForm()
    if form.validate_on_submit():
        user = db.session.scalar(sa.select(User).where(User.email == form.email.data))
        if user is None or not user.check_password(form.password.data):
            return redirect(url_for('login'))
        login_user(user, remember=form.remember_me.data)
        identity_changed.send(app, identity=Identity(user.id))
        if user.role == 'admin':
            return redirect(url_for('admin'))
        return redirect(url_for('index'))
    return render_template('login.html', title='Sign In', form=form)

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = RegistrationForm()
    if form.validate_on_submit():
        user = User(username=form.username.data, email=form.email.data, role='user')
        user.set_password(form.password.data)
        user.generate_avatar()
        db.session.add(user)
        db.session.commit()
        return redirect(url_for('login'))
    return render_template('register.html', title='Register', form=form)

@app.route('/about_us')
@login_required
@user_permission.require(http_exception=404)
def about_us():
    db_employees = db.session.execute(db.select(Employee)).scalars().all()
    employees = []
    for employee in db_employees:
        employees.append(
            {
                'full_name': employee.first_name + ' ' + employee.last_name,
                'post': employee.post,
                'img_url': url_for('static', filename=f'img/{employee.first_name + " " + employee.last_name}.jpg')
            }
        )

    db_achievements = db.session.execute(db.select(Achievement)).scalars().all()
    achievements = []
    for achievement in db_achievements:
        achievements.append(
            {
                'title': achievement.title,
                'value': achievement.value
            }
        )

    return render_template('about_us.html', user_data=get_user_data(current_user.id),
                           achievements=achievements, employees=employees)

@app.route('/profile', methods=['GET', 'POST'])
@login_required
@user_permission.require(http_exception=404)
def profile():
    token_form = TokenForm(username=current_user.username)
    password_form = ChangePassForm(username=current_user.username)
    username_form = ChangeNameForm(username=current_user.username)

    if request.form.get('UserToken') and token_form.validate_on_submit():
        user = User.query.get(current_user.id)
        if user:
            user.role = "tester"
            db.session.commit()
        return render_template('profile.html', token_form=token_form,  password_form=password_form,
                               username_form=username_form, token_correct=True, user_data=get_user_data(current_user.id))

    elif request.form.get('last_password') and password_form.validate_on_submit():
        user = User.query.get(current_user.id)
        if user:
            user.set_password(password_form.new_password.data)
            db.session.commit()
            return render_template('profile.html', token_form=token_form, password_form=password_form,
                                   username_form=username_form, pass_correct=True, user_data=get_user_data(current_user.id))

    elif request.form.get('new_username') and username_form.validate_on_submit():
        user = User.query.get(current_user.id)
        if user:
            user.username = username_form.new_username.data
            user.generate_avatar()
            db.session.commit()
            return render_template('profile.html', token_form=token_form, password_form=password_form,
                                   username_form=username_form, username_correct=True, user_data=get_user_data(current_user.id))

    return render_template('profile.html', token_form=token_form, password_form=password_form,
                           username_form=username_form, user_data=get_user_data(current_user.id))

@app.route('/logout')
def logout():
    logout_user()
    identity_changed.send(app, identity=Identity(None))
    return redirect(url_for('index'))

@identity_loaded.connect_via(app)
def on_identity_loaded(sender, identity):
    if hasattr(current_user, 'role'):
        identity.provides.add(RoleNeed(current_user.role))
    if hasattr(current_user, 'role') and current_user.role == 'tester':
        identity.provides.add(RoleNeed('user'))

@app.route('/api/move', methods=['POST'])
def make_move():
    try:
        data = yaml.load(request.data, Loader=yaml.UnsafeLoader)
        board = data['board']
        mini_max = MiniMax(board)
        move = mini_max.ai_turn()
        return jsonify({'move': move})

    except Exception as e:
        return jsonify({'error': str(e), 'move': None})

@app.route('/games/tiс_tac_toe')
@tester_permission.require(http_exception=404)
def tic_tac_toe():
    return render_template('ttt.html', user_data=get_user_data(current_user.id))

def get_user_data(id):
    user = User.query.get(id)
    return {
        'username': user.username,
        'avatar': user.avatar
    }