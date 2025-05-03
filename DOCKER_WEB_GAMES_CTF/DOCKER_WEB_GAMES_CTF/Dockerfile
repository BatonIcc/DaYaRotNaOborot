# Используем официальный образ Python 3.11.9
FROM python:3.11.9-slim

# Создаем и переходим в рабочую директорию
WORKDIR /app

# Копируем зависимости и устанавливаем их
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем файлы приложения с правильными правами
COPY --chmod=444 .flaskenv .
COPY --chmod=444 main.py .
COPY --chmod=444 config.py .
COPY --chmod=444 flag.txt .

# Копируем директорию app с правами только для чтения
COPY --chmod=555 app/ ./app/
RUN chmod -R a-w,a+rX ./app

# Копируем миграции с правами только для чтения
COPY --chmod=555 migrations/ ./migrations/
RUN chmod -R a-w,a+rX ./migrations

# Копируем базу данных с обычными правами
COPY app.db .

# Указываем переменные окружения
ENV FLASK_APP=main.py
ENV FLASK_ENV=production

# Открываем порт
EXPOSE 5000

# Запускаем приложение
CMD ["flask", "run", "--host", "0.0.0.0"]
