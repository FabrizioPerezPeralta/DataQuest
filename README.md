# Normalization Quest Lab

> Interactive educational platform for learning database normalization (1FN, 2FN, 3FN, BCNF) through gamification

## 🎓 Project Overview

**Normalization Quest Lab** is a comprehensive educational application designed to teach database normalization through an interactive, gamified learning experience. It combines:

- **Backend Core**: A sophisticated normalization engine implementing database theory algorithms
- **Frontend Interface**: An intuitive React application with React Flow visualization
- **Gamification**: Quest-based missions, XP rewards, badges, and ranking system
- **Pedagogical Features**: Intelligent hints, step-by-step diagnosis, and personalized learning paths

## 📋 Project Structure

```
├── app/
│   ├── Domain/               # Business logic layer
│   │   ├── Entities/         # FunctionalDependency, RelationSchema
│   │   ├── Repositories/     # Interfaces for data access
│   │   └── Services/         # NormalizationEngine, AchievementService, IntelligentMentor
│   ├── Application/
│   │   └── UseCases/         # ValidateSchemaUseCase
│   ├── Infrastructure/
│   │   └── Persistence/      # Repository implementations
│   ├── Http/
│   │   ├── Controllers/Api/  # NormalizationController, AnalyticsController
│   │   └── Middleware/       # DataProtectionMiddleware
│   └── Models/               # Eloquent models
├── database/
│   └── migrations/           # Database schema
├── frontend/
│   └── src/
│       ├── components/       # React components
│       ├── services/         # API client
│       ├── store/           # Zustand stores
│       └── types.ts         # TypeScript interfaces
├── config/
│   └── normalization.php    # Application configuration
├── nginx/                    # Nginx configuration
└── vercel.json              # Vercel deployment config
```

## 🚀 Quick Start

### Prerequisites
- PHP 8.2+
- Node.js 18+
- PostgreSQL or MySQL
- Composer
- npm or yarn

### Backend Setup

1. Clone and install dependencies:
```bash
composer install
php artisan key:generate
```

2. Configure database in `.env`:
```env
DB_CONNECTION=pgsql
DB_HOST=localhost
DB_DATABASE=dataquest
DB_USERNAME=postgres
DB_PASSWORD=password
```

3. Run migrations:
```bash
php artisan migrate
```

4. Start the server:
```bash
php artisan serve
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Configure API URL in `.env`:
```env
VITE_API_URL=http://localhost:8000/api
```

3. Start development server:
```bash
npm run dev
```

## 🎮 Features

### Core Normalization Engine
- **Closure Computation**: Iterative algorithm to compute attribute closures
- **Candidate Key Detection**: Find all minimal superkeys
- **Normalization Diagnosis**: Detect 1FN, 2FN, 3FN, and BCNF violations
- **Pedagogical Explanations**: Detailed violation analysis with Codd's rules

### Interactive UI
- **Schema Builder**: Define relations, attributes, and dependencies
- **Visual Feedback**: Color-coded indicators for normalization status
- **Diagnosis Panel**: Step-by-step explanation of normalization issues

### Gamification System
- **Quest System**: Progressive missions with difficulty levels
- **XP & Badges**: Earn experience points and unlock achievements
- **User Ranks**: Progress through ranks from "Aprendiz" to "Maestro de Normalización"
- **Learning Analytics**: Track mastery of each normalization concept

### Intelligent Mentoring
- **Contextual Hints**: Tips based on detected violations
- **Smart Suggestions**: Decomposition hints using Heath's theorem
- **Mastery Tracking**: Personalized learning recommendations

## 🔐 Security Features

### Data Protection (Ley N.º 29733 - Peru)
- **Password Encryption**: Bcrypt with configurable rounds
- **Access Logging**: All admin data accesses are logged
- **Consent Management**: Explicit user data consent tracking
- **HTTPS Enforcement**: Strict TLS configuration
- **Security Headers**: X-Frame-Options, CSP, HSTS

### Backend Security
- CSRF protection
- Input validation on all endpoints
- Secure session configuration
- Rate limiting ready

## 🚢 Deployment

### Vercel (Frontend)
```bash
cd frontend
npm run build
# Deploy to Vercel
```

### VPS with Nginx (Backend)
1. Copy files to `/var/www/dataquest-backend`
2. Configure Nginx using `nginx/default.conf`
3. Set up SSL with Let's Encrypt
4. Configure PHP-FPM and Redis

## 📊 API Endpoints

### Validation
- `POST /api/validate-schema` - Validate a database schema

### Analytics
- `GET /api/analytics/mastery/{userId}` - Get user's mastery levels

### Gamification
- `POST /api/quests/{questId}/complete` - Mark quest as complete
- `GET /api/users/{userId}/achievements` - Get user achievements

## 🧪 Testing

```bash
# Run PHP tests
php artisan test

# Run frontend tests
cd frontend
npm run test
```

## 📚 Learning Path

1. **Beginner**: Master 1FN and 2FN concepts
2. **Intermediate**: Understand 3FN and transitive dependencies
3. **Advanced**: Achieve BCNF and explore multi-valued dependencies
4. **Expert**: Create custom quests and teach others

## 🤝 Contributing

Contributions are welcome! Please follow PSR-12 (PHP) and Prettier (JavaScript) standards.

## 📝 License

This project is licensed under the MIT License.

## 👨‍💼 Support

For questions or issues, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for educators and students of database design**
