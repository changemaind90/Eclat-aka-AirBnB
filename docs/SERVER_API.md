# Server API manual (Swagger/OpenAPI)

The server is a NestJS app with Swagger enabled in `server/src/main.ts`.

## Run server

```bash
cd server
npm run start:dev
```

## Open Swagger UI

Once the server is running, open:

- `/booking/api/docs`

## API prefix

All routes are served under:

- `/booking/api/`

Examples (depending on controllers):

- `/booking/api/auth/*`
- `/booking/api/listings/*`
- `/booking/api/booking/*`
- `/booking/api/reviews/*`
- `/booking/api/payments/*`

## How to keep docs accurate

- Prefer DTOs for request bodies and response shapes.
- Add `@ApiResponse`, `@ApiBearerAuth`, and related Swagger decorators on controllers.
- Keep auth request typing consistent (see `server/src/common/request-with-user.ts`).

