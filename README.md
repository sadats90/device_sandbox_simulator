# Device Sandbox Simulator

## Requirements

- PHP 8.2 or higher
- Composer
- Node.js and npm
- MySQL or SQLite

## Installation

### Backend (Laravel)

1. Go to backend folder:
   ```bash
   cd backend
   ```

2. Install PHP dependencies:
   ```bash
   composer install
   ```

3. Copy environment file:
   ```bash
   cp .env.example .env
   ```

4. Generate app key:
   ```bash
   php artisan key:generate
   ```

5. Update `.env` file with your database settings:
   ```
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=your_database
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   ```

6. Run migrations:
   ```bash
   php artisan migrate
   ```

7. Start Laravel server:
   ```bash
   php artisan serve
   ```
   Backend runs on: http://localhost:8000

### Frontend (React)

1. Go to frontend folder:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```
   Frontend runs on: http://localhost:5173

## Build for Production

### Frontend

```bash
cd frontend
npm run build
```

This creates a `dist` folder. Copy all files from `dist/` to `backend/public/`.

## Project Structure

```
backend/          - Laravel API
frontend/         - React app
```

## API Endpoints

- GET `/api/devices` - Get all devices
- GET `/api/devices/{id}` - Get device by ID
- POST `/api/devices/{id}/state` - Update device state
- GET `/api/presets` - Get all presets
- POST `/api/presets` - Create preset
- DELETE `/api/presets/{id}` - Delete preset

