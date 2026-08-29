# Survey Status — Local Database Version

This version uses Node.js + Express + SQLite.

## 1. Install Node.js

Install a current LTS version of Node.js on your PC.

## 2. Open this folder in VS Code

Open the `survey-status-local` folder.

## 3. Open VS Code Terminal

Run:

```bash
npm install
```

Then:

```bash
npm start
```

You should see:

```text
Survey Status app running at http://localhost:3000
Results dashboard: http://localhost:3000/results.html
```

## 4. Test the status URLs

Complete:

```text
http://localhost:3000/?complete&pid=DL10025&uid=USER789
```

Quota Full:

```text
http://localhost:3000/?quotafull&pid=DL10025&uid=USER789
```

Disqualified:

```text
http://localhost:3000/?disqualify&pid=DL10025&uid=USER789
```

Security Termination:

```text
http://localhost:3000/?securityterm&pid=DL10025&uid=USER789
```

Every valid visit creates one row in `survey.db`.

## 5. View saved results

Open:

```text
http://localhost:3000/results.html
```

You can:

- View all saved results
- Search by PID
- Search by UID
- Search by status
- Export all results as CSV

## Database

The SQLite database is:

```text
survey.db
```

It is created automatically the first time the server starts.

Do not delete `survey.db` if you want to keep your saved results.

## Important production note

The status is determined by URL parameters, so anyone who knows the URL format can manually request a status. This is fine for a learning/local project, but a production survey system should validate status changes on the server and authenticate trusted survey callbacks.
