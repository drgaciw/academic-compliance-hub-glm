# Prettier Config

Shared Prettier configuration for the Academic Compliance Hub monorepo.

## Usage

Add to your `package.json`:

```json
{
  "prettier": "@aah/prettier-config"
}
```

## Configuration

- **Print Width**: 100 characters
- **Tab Width**: 2 spaces
- **Semicolons**: Enabled
- **Quotes**: Single quotes (double in JSX)
- **Trailing Commas**: ES5
- **Arrow Function Parentheses**: Omit when possible
- **End of Line**: LF

## Scripts

- `npm run lint` - Check formatting
- `npm run format` - Fix formatting
