# 📚 DataQuest API Documentation

> Comprehensive API reference for Normalization Quest Lab

## Base URL
```
http://localhost:8000/api
```

## Authentication
Uses Laravel Sanctum token-based authentication with short-lived access tokens and long-lived refresh tokens.

### Token Format
```
Authorization: Bearer {access_token}
```

---

## 🔐 Authentication Endpoints

### 1. Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "correo": "user@example.com",
  "apodo": "NormalizationMaster",
  "password": "SecurePassword123",
  "password_confirmation": "SecurePassword123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Usuario registrado correctamente",
  "access_token": "string",
  "refresh_token": "string",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": 1,
    "correo": "user@example.com",
    "apodo": "NormalizationMaster",
    "role": "usuario",
    "xp": 0,
    "rango": "Aprendiz"
  }
}
```

---

### 2. Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "correo": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Sesión iniciada correctamente",
  "access_token": "string",
  "refresh_token": "string",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": { ... }
}
```

---

### 3. Refresh Access Token
```http
POST /auth/refresh
```

**Request Body:**
```json
{
  "refresh_token": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "access_token": "new_access_token",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

---

### 4. Logout User
```http
POST /auth/logout
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Sesión cerrada correctamente"
}
```

---

## 🧮 Normalization Endpoints

### 5. Validate Schema
```http
POST /validate-schema
Content-Type: application/json
```

**Request Body:**
```json
{
  "table_name": "Student",
  "attributes": ["StudentID", "Name", "Email"],
  "dependencies": [
    {
      "determinant": ["StudentID"],
      "dependent": ["Name", "Email"]
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "table_name": "Student",
    "current_nf": "1FN",
    "is_1nf": true,
    "is_2nf": true,
    "is_3nf": true,
    "violations": []
  }
}
```

---

### 6. Explain Closure (X+)
```http
POST /explain/closure
```

**Request Body:**
```json
{
  "attributes": ["A", "B", "C"],
  "dependencies": [
    { "determinant": ["A"], "dependent": ["B"] },
    { "determinant": ["B"], "dependent": ["C"] }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "closure": ["A", "B", "C"],
    "steps": [
      {
        "step_number": 0,
        "description": "Inicializar X+",
        "current_closure": ["A"],
        "reasoning": "X+ se inicia con el conjunto de atributos iniciales"
      }
    ]
  }
}
```

---

### 7. Explain Candidate Keys
```http
POST /explain/candidate-keys
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "candidate_keys": [["StudentID"], ["Email"]],
    "total_keys": 2,
    "explanations": [
      {
        "key": ["StudentID"],
        "closure": ["StudentID", "Email", "Name"],
        "reasoning": "..."
      }
    ]
  }
}
```

---

### 8. Explain Decomposition
```http
POST /explain/decomposition
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "decomposition_steps": [...],
    "new_relations": [...],
    "preserved_dependencies": true
  }
}
```

---

## 🚨 Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/auth/register` | 3 requests | 10 minutes |
| `/auth/login` | 5 requests | 1 minute |
| `/validate-schema` | 100 requests | 1 minute |

**Rate Limit Exceeded (429):**
```json
{
  "success": false,
  "message": "Too many requests. Please try again in 45 seconds.",
  "retry_after": 45
}
```

---

## 📝 Example cURL Commands

```bash
# Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"correo":"user@example.com","apodo":"Master","password":"Pass123","password_confirmation":"Pass123"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"user@example.com","password":"Pass123"}'

# Validate Schema
curl -X POST http://localhost:8000/api/validate-schema \
  -H "Content-Type: application/json" \
  -d '{"table_name":"Student","attributes":["ID","Name"],"dependencies":[{"determinant":["ID"],"dependent":["Name"]}]}'

# Explain Closure
curl -X POST http://localhost:8000/api/explain/closure \
  -H "Content-Type: application/json" \
  -d '{"attributes":["A"],"dependencies":[{"determinant":["A"],"dependent":["B"]}]}'
```

---

**Last Updated:** May 2, 2026

## Base URL
```
https://api.dataquest.com/api
```

## Authentication
All endpoints require a valid JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

## Endpoints

### 1. Validate Schema
**POST** `/validate-schema`

Validates a database schema against normalization rules.

#### Request Body
```json
{
  "table_name": "Estudiante",
  "attributes": ["id_est", "nombre", "ciudad"],
  "dependencies": [
    {
      "determinant": ["id_est"],
      "dependent": ["nombre", "ciudad"]
    }
  ]
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "schema_name": "Estudiante",
    "candidate_keys": [["id_est"]],
    "diagnosis": {
      "current_nf": "1NF",
      "violations": [],
      "didactic_steps": [],
      "suggestions": []
    },
    "is_fully_normalized": false,
    "message": "Tu esquema está en 1FN..."
  }
}
```

#### Error Response
```json
{
  "success": false,
  "errors": {
    "table_name": ["The table name field is required."],
    "attributes": ["The attributes field is required."]
  }
}
```

---

### 2. Get User Mastery
**GET** `/analytics/mastery/{userId}`

Retrieves the user's mastery levels for each normalization concept.

#### Response
```json
[
  {
    "concept": "1FN",
    "percentage": 95.0,
    "mastered": true
  },
  {
    "concept": "2FN",
    "percentage": 75.0,
    "mastered": false
  },
  {
    "concept": "3FN",
    "percentage": 60.0,
    "mastered": false
  },
  {
    "concept": "BCNF",
    "percentage": 0.0,
    "mastered": false
  },
  {
    "concept": "DF",
    "percentage": 78.0,
    "mastered": false
  }
]
```

---

### 3. Complete Quest
**POST** `/quests/{questId}/complete`

Mark a quest as complete and award XP/badges.

#### Request Body
```json
{
  "schema_validation": {
    "table_name": "Pedidos",
    "attributes": ["id_pedido", "id_cliente", "fecha"],
    "dependencies": [
      {
        "determinant": ["id_pedido"],
        "dependent": ["id_cliente", "fecha"]
      }
    ]
  },
  "hints_used": 1
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "xp_gained": 40,
    "badge": "Normalizador Inicial",
    "user_rank": "Normalizador Junior",
    "total_xp": 540
  }
}
```

---

### 4. Get User Achievements
**GET** `/users/{userId}/achievements`

Retrieve all achievements unlocked by the user.

#### Response
```json
{
  "success": true,
  "data": {
    "total_achievements": 5,
    "achievements": [
      {
        "id": 1,
        "badge_name": "Primer Paso",
        "unlocked_at": "2026-05-01T10:30:00Z"
      },
      {
        "id": 2,
        "badge_name": "Domador de Dependencias",
        "unlocked_at": "2026-05-02T14:45:00Z"
      }
    ]
  }
}
```

---

### 5. Get Quest Details
**GET** `/quests/{questId}`

Get details about a specific quest.

#### Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "El Primer Paso",
    "description": "Aprende a identificar claves primarias en un esquema simple",
    "difficulty_level": 1,
    "expected_nf": "1FN",
    "xp_reward": 50,
    "badge_name": "Primer Paso",
    "initial_schema": {
      "table_name": "Estudiante",
      "attributes": ["id_est", "nombre", "apellido"],
      "dependencies": [...]
    }
  }
}
```

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | User doesn't have permission |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation failed |
| 500 | Server Error | Internal server error |

---

## Rate Limiting

- Requests are limited to **100 per minute** per user
- Limit headers are included in responses:
  - `X-RateLimit-Limit: 100`
  - `X-RateLimit-Remaining: 95`
  - `X-RateLimit-Reset: 1682899200`

---

## Pagination

List endpoints support pagination with query parameters:
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 15, max: 100)

Example:
```
GET /quests?page=2&per_page=20
```

---

## Webhooks (Future Feature)

Webhooks will be available for:
- Quest completion
- Achievement unlocked
- User rank changed

---

## Support

For API issues or questions, contact: `api-support@dataquest.com`
