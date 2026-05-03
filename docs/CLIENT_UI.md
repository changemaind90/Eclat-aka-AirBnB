# Client UI manual (Storybook)

The goal is to have a living UI manual where each Vue component has:

- purpose/usage notes
- props/events
- states (empty/loading/error/etc.)

## Run Storybook

```bash
cd client
npm run storybook
```

## Build Storybook (static)

```bash
cd client
npm run build-storybook
```

## Where stories live

- `client/src/stories/*.stories.ts`

Start with core UI pieces:

- `ListingCard`
- `ListingsContainer`
- `SearchFilters`
- `AuthForm`
- layout: `NavBar`, `AppFooter`

