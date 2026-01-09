# 🐳 Docker Setup - TopSkill LMS

## Quick Start with Docker

### 1. Start Everything (Backend + Frontend + Database)

```bash
docker-compose up --build
```

This will:
- ✅ Start PostgreSQL database
- ✅ Start Django backend (port 8000)
- ✅ Start Next.js frontend (port 3000)
- ✅ Run migrations automatically
- ✅ Create admin user (username: `admin`, password: set below)

### 2. Set Admin Password

After containers start, set admin password:

```bash
docker-compose exec backend python manage.py changepassword admin
```

Or create new superuser:
```bash
docker-compose exec backend python manage.py createsuperuser
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/
- **Admin Panel**: http://localhost:8000/admin/
  - Username: `admin`
  - Password: (set in step 2)

### 4. Stop Everything

```bash
docker-compose down
```

### 5. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Default Admin Credentials

**Username**: `admin`  
**Password**: You need to set it (see step 2 above)

## Manual Setup (Without Docker)

If you prefer not to use Docker:

### Backend:
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend:
```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local
npm run dev
```

## Troubleshooting

### Frontend not loading?
- Wait 30 seconds for Next.js to compile
- Check logs: `docker-compose logs frontend`

### Backend errors?
- Check database connection
- Check logs: `docker-compose logs backend`

### Reset everything?
```bash
docker-compose down -v
docker-compose up --build
```

## Environment Variables

Create `.env` file in project root:

```env
PAYFAST_MERCHANT_ID=your_merchant_id
PAYFAST_MERCHANT_KEY=your_merchant_key
GROQ_API_KEY=your_groq_api_key
```



















