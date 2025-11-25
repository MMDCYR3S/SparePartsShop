FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# نصب پیش‌نیازهای لینوکسی
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev \
        postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/requirements.txt

# --- تغییرات مهم ---
# ۱. خط آپدیت pip را کاملا حذف کردیم چون باعث ارور می‌شود.

# ۲. نصب پکیج‌ها با استفاده از میرور آروان (برای همه سرورهای ایران کار می‌کند)
# دستور --trusted-host بسیار مهم است تا گیر SSL ندهد
RUN pip install --no-cache-dir -r requirements.txt \
    --default-timeout=1000
# ------------------

COPY . /app/

# دستور جمع‌آوری فایل‌های استاتیک
# اگر باز هم اینجا ارور داد، می‌توانید موقتا کامنت کنید ولی معمولا لازم است
RUN python manage.py collectstatic --noinput

EXPOSE 8010

RUN adduser --disabled-password --gecos '' appuser
RUN chown -R appuser:appuser /app
USER appuser

CMD ["gunicorn", "--bind", "0.0.0.0:8010", "core.wsgi:application"]
