FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Collect static files (skip if STATIC_ROOT not set)
RUN python manage.py collectstatic --noinput 2>/dev/null || echo "Skipping collectstatic"

# Expose port
EXPOSE 8000

# Run migrations and start server
CMD sh -c "python manage.py migrate && python manage.py seed_data || true && python manage.py runserver 0.0.0.0:8000"
