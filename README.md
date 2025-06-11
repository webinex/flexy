# Flexy

**Flexy** is a lightweight utility for building overrideable and themeable React components using context. It allows you to define components with stable keys and override them globally or locally without changing how they are used.

---

## Features

- Override React components by key at runtime
- Nestable `<Flexy />` providers with `merge` or `replace` modes
- Full TypeScript support with prop inference
- Built-in theming via `createTheme`
- No runtime dependencies

---

## Installation

```bash
npm install @webinex/flexy
# or
yarn add @webinex/flexy
# or
pnpm add @webinex/flexy
```

## Getting Started

### 1. Define a Flexy Component

```tsx
import { flexy } from 'flexy';

const Button = flexy('Button', (props) => <button {...props} />);
```

### 2. Use the Component

```tsx
<Button>Click me</Button>
```

### 3. Override It via &lt;Flexy /&gt;

```tsx
import { Flexy } from 'flexy';

const custom = {
  Button: (props) => (
    <div>
      Wrapped: <Button.Component {...props} />
    </div>
  ),
};

<Flexy value={custom}>
  <Button>Click me</Button>
</Flexy>;
```

You can use Button.Component inside the override to access the original component.

## mode: `"merge"` vs `"replace"`

- `"merge"` (default): extends the previous context
- `"replace"`: replaces the previous context entirely

```tsx
<Flexy value={{ Button: ... }}>
  <Flexy value={{ Section: ... }} mode="merge">
    <Section>
      <Button />
    </Section>
  </Flexy>
</Flexy>
```

## TypeScript: $Flexy

```tsx
type Components = $Flexy<typeof Button | typeof Section>;

const overrides: Components = {
  Button: (props) => <CustomButton {...props} />,
  Section: (props) => <CustomSection {...props} />,
};
```

`$Flexy<U>` infers an override shape based on `flexy()` components.

## Example: FlexyDemo.tsx

```tsx
import {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  PropsWithChildren,
} from 'react';
import { $Flexy, Flexy, flexy } from 'flexy';

const Section = flexy(
  'Section',
  ({
    children,
    ...rest
  }: PropsWithChildren<
    DetailedHTMLProps<React.HtmlHTMLAttributes<HTMLElement>, HTMLElement>
  >) => <section {...rest}>{children}</section>
);

const Button = flexy(
  'Button',
  (
    props: DetailedHTMLProps<
      ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    >
  ) => <button {...props} />
);

type Components = $Flexy<typeof Section | typeof Button>;

const THEME: Components = {
  Section: (props) => (
    <div>
      <Section.Component {...props} style={{ color: 'red' }} />
    </div>
  ),
};

const CUSTOMIZE: Components = {
  Button: (props) => (
    <div>
      Before button: <Button.Component {...props} />
    </div>
  ),
};

export function FlexyDemo() {
  return (
    <Flexy value={THEME}>
      <Flexy value={CUSTOMIZE} mode="merge">
        <Section>
          <Button>Click me</Button>
        </Section>
      </Flexy>
    </Flexy>
  );
}
```

## Theme Support via createTheme

You can create isolated component override systems using `createTheme()`.

```tsx
const Theme = flexy.createTheme('MyTheme');

const Button = Theme.flexy('Button', (props) => <button {...props} />);
```

Override theme-specific components using `<Theme.Provider>`:

```tsx
<Theme.Provider components={{ Button: CustomButton }}>
  <Button>Click me</Button>
</Theme.Provider>
```

The overrides inside `Theme.Provider` do not affect global `flexy()` components — it's fully isolated.

## Example: ThemeDemo.tsx

```tsx
import { Radio } from 'antd';
import { PropsWithChildren, useMemo, useState } from 'react';
import { $Flexy, Flexy, flexy } from 'flexy';

const Theme = flexy.createTheme('Theme');

const Button = Theme.flexy('Button', (props: PropsWithChildren) => {
  return <button {...props}>{props.children}</button>;
});

type ThemeComponents = $Flexy<typeof Button>;

const IGNORED_FLEXY: ThemeComponents = {
  Button: () => <span>IGNORED</span>,
};

export function ThemeDemo() {
  const [type, setType] = useState<'none' | 'border' | 'text'>('none');

  const components = useMemo<ThemeComponents>(() => {
    switch (type) {
      case 'none':
        return {};
      case 'border':
        return {
          Button: (props) => (
            <div style={{ border: '1px solid black', padding: '5px' }}>
              <Button.Component {...props} />
            </div>
          ),
        };
      case 'text':
        return {
          Button: () => <span>Text instead of Button</span>,
        };
    }
  }, [type]);

  return (
    <div>
      <h2>Theme Demo</h2>

      <Radio.Group
        value={type}
        onChange={(e) => setType(e.target.value)}
        options={[
          { label: 'None', value: 'none' },
          { label: 'Bordered', value: 'border' },
          { label: 'Replace with Text', value: 'text' },
        ]}
      />

      <div style={{ marginTop: '20px' }}>
        <Theme.Provider components={components}>
          <Flexy mode="replace" value={IGNORED_FLEXY}>
            <Button>Basic Button</Button>
          </Flexy>
        </Theme.Provider>
      </div>
    </div>
  );
}
```

## Notes

- `Button.Component` always refers to the original base component.
- Nested `Flexy` providers use shallow merging unless `mode="replace"` is set.
- Themes created via `createTheme()` are isolated — no interference across contexts.
- You can use multiple themes simultaneously.

## LICENSE

Apache License 2.0
