# CUBE CSS Boilerplate

🚨 **PLEASE READ THIS EXPLAINER**:
https://piccalil.li/blog/a-css-project-boilerplate 🚨

This is a fork of
[Set Studio's CUBE CSS boilerplate](https://github.com/Set-Creative-Studio/cube-boilerplate).
This fork exists to provide a Tailwind v4 + Vite alternative.

## Table of Contents

- [Getting Started](#getting-started)
- [Utility Scripts](#utility-scripts)
- [Comparison with Original](#comparison-with-original)
  - [Configuration](#configuration)
  - [Removing and Overriding Tailwind Default Styles](#removing-and-overriding-tailwind-default-styles)
  - [Design Token Generation](#design-token-generation)
- [License](#license)

## Getting Started

1. Install dependencies: `pnpm install`
2. Start the dev server: `pnpm run dev`
   - Uses Vite; it watches and hot-reloads changes to CSS, JS/TS, and
     `index.html`.
3. Build for production: `pnpm run build`
4. Preview the production build: `pnpm run preview`

## Utility Scripts

- Generate theme from design tokens: `pnpm run theme`
  - Outputs to `src/css/theme.css`
- Format all files: `pnpm run format:all`
- Lint and fix: `pnpm run lint:all`

## Comparison with Original

### Configuration

Tailwind CSS v4.0 shifted from configuring your project in JavaScript to
configuring it in CSS. Your theme can still be configured within
`tailwind.config.js` and imported via
[`@config()`](https://tailwindcss.com/docs/functions-and-directives#config-directive),
but the recommended way is to use the new
[`@theme`](https://tailwindcss.com/docs/functions-and-directives#theme-directive)
directive.

All defined theme values will be added to your CSS as regular custom properties
inside the `:root`. This makes it very easy to reuse them across your whole
project.

### Removing and Overriding Tailwind Default Styles

Tailwind CSS allows you to completely disable default theme styles by removing
the import `@import "tailwindcss/theme.css" layer(theme);`. Alternatively, you
can use the `@theme()` and override the existing
[namespaces](https://tailwindcss.com/docs/theme#theme-variable-namespaces) with
`initial`.

```css
@theme {
	--color-*: initial;
	--color-dark: #030303;
	--color-light: #ffffff;
	--color-primary: #02394a;
	--color-secondary: #75eab0;
}
```

Here we select all default colors and disable them. Then we define our own
custom colors.

You can also override specific values like this:

```css
@theme {
	--breakpoint-sm: 20.625rem; /* 330px */
	--breakpoint-md: 47.5rem; /* 760px */
	--breakpoint-lg: 76.875rem; /* 1230px */
}
```

In this example, breakpoints `sm`, `md` and `lg` will be overridden.

### Design Token Generation

This boilerplate extends the original design token system with automated
generation capabilities. Unlike the original boilerplate that defines tokens in
`tailwind.config.js`, this fork generates a CSS file with Tailwind v4's `@theme`
directive. This automatically creates CSS custom properties from your design
tokens, making them available throughout your project as regular CSS variables.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.
