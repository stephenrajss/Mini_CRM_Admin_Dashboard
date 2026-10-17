# Mini CRM

Admin dashboard for leads, companies, tasks, and users. The interface is a React app. All records are stored in MongoDB through an Express API. Authorization is enforced on the server.

This repository has not been published or deployed. Replace the placeholders below after you create the GitHub repository and hosting apps.

- GitHub: `https://github.com/stephenrajss/Mini_CRM_Admin_Dashboard`
- Frontend: `https://<your-site>.netlify.app`
- API: `https://<your-api>.onrender.com`

## Features

- Email and password login. The API returns a JWT, the app stores it in `localStorage` as `userInfo`, and every request sends `Authorization: Bearer`
- Admin and regular-user roles, enforced in Express middleware and services
- Dashboard metrics from MongoDB aggregations
- Leads with search, filters, sorting, pagination, and soft delete
- Companies with associated non-deleted leads
- Tasks with assignment, due-date filters, and ownership checks on status updates
- User management for administrators
- Responsive admin shell, loading, empty, and error states

## Technology stack

| Area | Choice |
|---|---|
| Frontend | React 18, Vite, React Router, Axios, Tailwind CSS, MUI, React Hook Form, Zod, Recharts, Lucide |
| Backend | Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, Zod, Helmet, CORS, express-rate-limit |
| Tests | Vitest and Supertest. Backend tests use mongodb-memory-server |
| Hosting targets | Netlify (frontend), Render (API), MongoDB Atlas (database) |

Tailwind CSS is the styling system. MUI is used for dialogs, menus, and snackbar notifications so those components keep accessible behavior. Date fields use the native date input.

## Architecture

```text
Browser (React)
  -> Axios with credentials
  -> Express /api
       -> authenticate (JWT cookie, user reloaded from MongoDB)
       -> authorizeRoles / resource checks
       -> Zod validation
       -> thin controllers
       -> services
       -> Mongoose models
```

The signed token stores only the user id. Every protected request loads the user from the database, so a deactivated account or a changed role takes effect immediately. The client never sends a role that the server trusts.

## Folder structure

```text
mini-crm/
├── client/                 React app
│   ├── public/_redirects   Netlify SPA fallback
│   ├── netlify.toml
│   └── src/
│       ├── api/            Axios modules
│       ├── components/     Shared UI
│       ├── context/        Auth, toasts, page title
│       ├── layouts/
│       ├── pages/
│       ├── schemas/        Zod form schemas
│       └── hooks/
├── server/
│   ├── src/
│   │   ├── config/         Env validation and database
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   ├── seed/
│   │   └── dev/memory.js   Optional ephemeral MongoDB
│   └── tests/
├── render.yaml
└── package.json            Local scripts for both apps
```

## Database schema and relationships

- A company has many leads. A lead belongs to at most one company.
- A lead has many tasks. Each task points at one lead and one assignee.
- Users can be assigned many leads and many tasks.
- `createdBy` records who created the row. It is set from the authenticated user and cannot be overwritten by the client.

Company names are stored as entered and also as `nameNormalized` (trimmed, lowercased, internal whitespace collapsed). That field is unique, so `Northwind` and `  northwind ` are the same company.

Lead emails are lowercased. A partial unique index applies to `{ email: 1 }` where `isDeleted` is false, so a deleted lead does not block the email from being used again.

Password hashes use bcrypt and are `select: false`. Populated user references request `name`, `email`, and `role` only.

## API

Success responses:

```json
{
  "success": true,
  "message": "Leads retrieved successfully",
  "data": [],
  "pagination": { "page": 1, "limit": 10, "total": 0, "totalPages": 0 }
}
```

`pagination` is included on list endpoints. Error responses:

```json
{ "success": false, "message": "Validation failed", "errors": [{ "field": "email", "message": "Enter a valid email address" }] }
```

| Method | Path | Access |
|---|---|---|
| GET | `/api/health` | Public |
| POST | `/api/auth/login` | Public, rate limited |
| POST | `/api/auth/logout` | Public, clears the cookie |
| GET | `/api/auth/me` | Authenticated |
| GET | `/api/users` | Admin |
| GET | `/api/users/options` | Authenticated. Active users, safe fields, capped at 200 |
| GET | `/api/users/:id` | Admin |
| POST | `/api/users` | Admin, rate limited |
| PATCH | `/api/users/:id` | Admin |
| PATCH | `/api/users/:id/active` | Admin |
| GET | `/api/companies` | Authenticated |
| GET | `/api/companies/options` | Authenticated |
| GET | `/api/companies/:id` | Authenticated |
| GET | `/api/companies/:id/leads` | Authenticated. Non-deleted leads. Regular users only see their assignments |
| POST | `/api/companies` | Admin |
| PATCH | `/api/companies/:id` | Admin |
| GET | `/api/leads` | Authenticated. Regular users only see leads assigned to them |
| GET | `/api/leads/options` | Authenticated, same scope, capped at 300 |
| GET | `/api/leads/:id` | Authenticated, same scope |
| POST | `/api/leads` | Admin |
| PATCH | `/api/leads/:id` | Admin, or the assignee. Assignees cannot change `assignedTo` |
| PATCH | `/api/leads/:id/status` | Admin, or the assignee |
| DELETE | `/api/leads/:id` | Admin. Soft delete |
| GET | `/api/tasks` | Authenticated. Regular users only see their tasks |
| GET | `/api/tasks/:id` | Authenticated, same scope |
| POST | `/api/tasks` | Admin |
| PATCH | `/api/tasks/:id` | Admin |
| PATCH | `/api/tasks/:id/status` | Admin, or the assignee. Extra fields are rejected |
| DELETE | `/api/tasks/:id` | Admin. Hard delete |
| GET | `/api/dashboard/summary` | Authenticated, scoped by role |
| GET | `/api/dashboard/leads-by-status` | Authenticated |
| GET | `/api/dashboard/recent-activity` | Authenticated |

List endpoints accept `page` (min 1), `limit` (1–100), `search`, `sortBy`, and `sortOrder` (`asc` or `desc`). `sortBy` is an allow-list. Unknown body fields are rejected. Unknown query fields are ignored.

Lead filters: `status`, `assignedTo`, `company`. Task filters: `status`, `assignedTo`, `lead`, and `due` (`today`, `overdue`, `upcoming`).

Status codes: 400 invalid id or JSON, 401 unauthenticated, 403 authenticated but not allowed, 404 missing, 409 conflict, 422 validation, 429 rate limit.

## Authentication flow

1. `POST /api/auth/login` checks the email and password. Unknown users and wrong passwords both return `401 Invalid email or password`. A matching password on a deactivated account returns 403.
2. The API signs a JWT and returns it as `data.token` next to `data.user`. It also sets the same value as the `accessToken` cookie.
3. The client saves `{ token, ...user }` in `localStorage` under `userInfo`.
4. The shared Axios client reads that token and sets `Authorization: Bearer <token>` on every request. Protected routes accept that header, and still accept the cookie when it is present.
5. On load, a stored token triggers `GET /api/auth/me`. The app shows a full-page spinner until that request finishes, so protected pages are not painted first.
6. Logout clears `userInfo`, the cookie, and the in-memory user. A 401 from any other API clears the stored session and returns the user to login.

Local development uses `SameSite=Lax` and `Secure=false`. `http://localhost:5173` and `http://localhost:5000` are the same site, so the cookie is sent. Production hosting on two sites (Netlify and Render) must use `COOKIE_SECURE=true` and `COOKIE_SAME_SITE=none`.

## Authorization

| Action | Admin | Regular user |
|---|---|---|
| View dashboard | Yes | Yes, only their leads and tasks |
| Create lead | Yes | No |
| Edit lead | Yes | Yes, only leads assigned to them |
| Reassign a lead | Yes | No |
| Soft-delete lead | Yes | No |
| Create or edit company | Yes | No |
| View companies | Yes | Yes |
| View a company's leads | Yes, all active leads | Only leads assigned to them |
| Create or assign tasks | Yes | No |
| Edit task fields | Yes | No |
| View tasks | Yes, all tasks | Only tasks assigned to them |
| Update own task status | Yes | Yes |
| Update another user's task | Yes | No |
| Delete task | Yes | No |
| Manage users | Yes | No |

A regular user who skips the UI and calls the API still hits these checks:

- `authorizeRoles('admin')` rejects create, delete, and user-management routes with 403.
- Lead and task reads add `assignedTo: <current user id>` in the query. Another user's record returns 403 when it exists and 404 when it does not, or when a lead is soft-deleted.
- Task status updates use `findOneAndUpdate` with `{ _id, assignedTo }` for non-admins. The update document only sets `status` and `completedAt`. `assignedTo`, `createdBy`, and other fields are not in the Zod schema, so a body that includes them returns 422 and the row is unchanged.
- Completing a task sets `completedAt`. Moving it back to `pending` or `in_progress` removes `completedAt`.
- An administrator cannot deactivate themselves or demote the last active administrator.

`GET /api/users/options` is available to every signed-in user so assignment names can be displayed. It returns id, name, email, and role for active users. It cannot create or change accounts.

## Soft delete

`DELETE /api/leads/:id` sets `isDeleted: true` and `deletedAt`. It does not remove the document. List, detail, company lead, option, and dashboard queries include `isDeleted: false`, including the aggregation `$match`. Update and status routes use the same condition, so a deleted lead cannot be edited back into the active list. Sample leads restored by the seed script are an explicit exception: re-seeding sets those known emails back to active.

Tasks are hard-deleted by an administrator. Companies are not deleted. Users are deactivated.

## Dashboard aggregation

`GET /api/dashboard/summary` calculates totals in MongoDB, not from the current page of the UI.

- Active leads: `isDeleted: false`, then grouped by `status`. Qualified is the `qualified` bucket.
- Tasks due today: `dueDate` inside the current calendar day in `APP_TIMEZONE` (default `UTC`). Every status is counted.
- Completed tasks: `status: completed`.
- Overdue: due before the start of today and not completed.
- Upcoming: due on or after the start of today and not completed.
- Regular users add `assignedTo` to the lead and task filters before the counts run.

The UI formats dates in UTC so they match the default timezone. A date picked in a form is stored as noon UTC on that calendar day, which stays on the same date for typical offsets.

Task list `due=overdue` and `due=upcoming` exclude completed tasks. `due=today` does not.

## Pagination, filtering, and search

Page and limit are coerced and bounded. Search strings are trimmed, length-limited, and escaped before they become regular expressions, so user input cannot change the query operators. Lead search matches name, email, or phone. Company search matches name, industry, or location. Task search matches title or lead name. Filters are combined with AND. Changing search or filters resets the list to page 1.

## Installation

Requirements: Node.js 18 or newer, npm, and MongoDB (local or Atlas). Git is optional until you publish the repository.

```bash
git clone https://github.com/<owner>/mini-crm.git
cd mini-crm
npm install
```

The root install also installs `client` and `server`. You can install them separately with `npm install --prefix server` and `npm install --prefix client`.

Copy the environment examples and edit them:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

On Windows PowerShell:

```powershell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
```

Suggested local values:

```text
MONGODB_URI=mongodb://127.0.0.1:27017/mini-crm
JWT_SECRET=local-dev-secret-change-me
CLIENT_URL=http://localhost:5173
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
APP_TIMEZONE=UTC
ADMIN_NAME=System Admin
ADMIN_EMAIL=admin@minicrm.local
ADMIN_PASSWORD=Admin@12345
SEED_USER_PASSWORD=User@12345
```

`JWT_SECRET` must be at least 16 characters. In production the process refuses to start when the secret still contains `replace-with`, `change-me`, or `test-secret`.

```bash
npm run seed --prefix server
npm run dev
```

- App: http://localhost:5173
- API: http://localhost:5000
- Health: http://localhost:5000/api/health

If MongoDB is not installed locally, this starts an in-memory MongoDB, seeds it, and runs the API. Data disappears when that process stops:

```bash
npm run dev:memory --prefix server
npm run dev --prefix client
```

Sign in with `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Sample users `priya.shah@minicrm.local` and `james.okonkwo@minicrm.local` use `SEED_USER_PASSWORD`.

## Environment configuration

Backend (`server/.env`):

| Variable | Purpose |
|---|---|
| `PORT` | API port. Default 5000 |
| `NODE_ENV` | `development`, `test`, or `production` |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | HMAC secret |
| `JWT_EXPIRES_IN` | Token lifetime, such as `8h` or `1d` |
| `CLIENT_URL` | Allowed browser origin. Comma-separate more than one |
| `COOKIE_SECURE` | `true` in production |
| `COOKIE_SAME_SITE` | `lax` locally, `none` for cross-site HTTPS |
| `APP_TIMEZONE` | IANA timezone for “today”. Default `UTC` |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Used only by the seed script |
| `SEED_USER_PASSWORD` | Password for the sample regular users |

Frontend (`client/.env`):

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | API origin, without a trailing `/api` |

`.env` files are gitignored. `.env.example` files are not.

## Seed and initial admin

There is no public endpoint that creates an administrator. The only bootstrap is:

```bash
npm run seed --prefix server
```

The script is safe to run again. It updates the admin and the two sample users, refreshes sample companies, leads, and tasks, and restores sample leads that were soft-deleted. It also resets sample passwords to the current environment values and moves sample due dates relative to today. Do not reuse sample titles or emails for data you need to keep across a re-seed.

Passwords must be 8–72 characters and include a letter and a number. They are hashed before insert.

## Tests

```bash
npm test --prefix server
npm test --prefix client
npm test
```

Backend coverage includes login success and failure, 401 on protected routes, 403 for non-admins, lead create/update, pagination, search, status filters, soft delete, dashboard counts, company lead scope, task assignment, task status ownership, rejection of assignment changes on the status route, and invalid ids and payloads.

These were executed in this workspace: server 16 tests passed, client 5 tests passed, and `npm run build --prefix client` completed.

## Production build

```bash
npm run build --prefix client
npm start --prefix server
```

The client build writes `client/dist`. `client/public/_redirects` and `client/netlify.toml` send unknown paths to `index.html` so refreshing a React Router URL works.

## Deployment

### MongoDB Atlas

1. Create a free cluster and a database user.
2. Allow the hosting provider's IP addresses, or `0.0.0.0/0` only if you accept that tradeoff.
3. Copy the SRV connection string into `MONGODB_URI`.

### API on Render

`render.yaml` describes a Node web service with root directory `server`, start command `npm start`, and health check `/api/health`.

Set `NODE_ENV=production`, `MONGODB_URI`, a long random `JWT_SECRET`, `JWT_EXPIRES_IN=8h`, `CLIENT_URL` to the Netlify origin, `COOKIE_SECURE=true`, `COOKIE_SAME_SITE=none`, and `APP_TIMEZONE`. Run the seed once from a trusted machine with the production `MONGODB_URI` and admin variables. Do not commit those values.

### Frontend on Netlify

- Base directory: `client`
- Build command: `npm run build`
- Publish directory: `client/dist`
- Environment: `VITE_API_BASE_URL=https://<your-api>.onrender.com`

Redeploy the frontend after changing `VITE_API_BASE_URL`. Vite inlines it at build time.

### Cookies and CORS

`CLIENT_URL` must be the exact browser origin, including `https://` and no path. Cross-site cookies require HTTPS, `Secure`, and `SameSite=None`. If login succeeds but later requests return 401, the cookie is not being stored or sent. Check those three settings before changing application code.

### Troubleshooting

- API exits on startup: the environment validation error names the missing or invalid variable.
- `COOKIE_SAME_SITE=none` without `COOKIE_SECURE=true` is rejected.
- Production refuses a placeholder `JWT_SECRET`.
- Browser login fails with a CORS error: `CLIENT_URL` does not match the page origin.
- Netlify refresh returns 404: the site was not built from `client`, so the SPA redirect was not published.
- Render health fails: the service cannot reach Atlas, or the start command is not `npm start` inside `server`.
- Empty dashboard after deploy: the seed has not been run against that database.

## Security

- Passwords are hashed with bcrypt. Responses and populated refs omit `passwordHash`.
- The access token is returned in the login JSON and stored in `localStorage` as `userInfo`. The same token is also set as an HttpOnly cookie. API calls send `Authorization: Bearer`. A token in `localStorage` is readable by scripts on this origin, so keep dependencies trusted and avoid loading third-party scripts into the admin app.
- Login and user creation are rate limited. Tests skip the limiter.
- Helmet, request size limits, and `trust proxy` are enabled.
- Update bodies are strict Zod objects. Queries do not pass raw objects into MongoDB operators.
- Search input is escaped before it is used in a regular expression.
- Object ids in route params are validated before queries.
- Stack traces are not returned in production.

## Known limitations

- Sessions end when the access token expires. There is no refresh token.
- There is no email verification or password-reset flow.
- Companies cannot be deleted. Tasks are hard-deleted rather than archived.
- Assignee and lead dropdowns are capped (200 users, 300 leads and companies).
- “Today” follows `APP_TIMEZONE`, not each browser's timezone. The interface prints UTC dates.
- Re-seeding rewrites the sample records.
- The production JavaScript bundle is large because MUI and Recharts are included.
- This workspace was not deployed. The URLs at the top are placeholders.
