import React, { memo, useContext as useReactContext, useMemo } from 'react';
import { Flexy } from './index';

/**
 * Context value for the Flexy theme.
 * Contains the theme key and a map of components.
 */
export interface FlexyThemeContextValue<TKey extends string = string> {
  /**
   * The unique key identifying this theme.
   */
  key: TKey;

  /**
   * A map of components that can be overridden in this theme.
   * Keys correspond to component keys.
   */
  components: Record<string, React.ComponentType<any>>;
}

export interface FlexyThemeProviderProps extends React.PropsWithChildren {
  /**
   * The children to render within this theme provider.
   * Typically contains Flexy components that will use the theme.
   */
  children: React.ReactNode;

  /**
   * Component overrides for this theme.
   */
  components: Record<string, React.ComponentType<any>>;
}

/**
 * Represents an isolated Flexy theme with its own context and override system.
 *
 * Use this class to define a scoped theme with:
 * - a unique `key`
 * - a `<Provider />` for supplying component overrides
 * - a `.flexy()` function for creating theme-bound components
 *
 * @template TKey - Unique identifier for the theme.
 */
export class FlexyTheme<TKey extends string> {
  private readonly _key: TKey;
  private readonly _context: React.Context<FlexyThemeContextValue<TKey>>;

  /**
   * Creates a new FlexyTheme with a unique string key.
   *
   * @param key - A non-empty string used to identify the theme.
   * @throws If `key` is null, undefined, or empty.
   */
  constructor(key: TKey) {
    if (key == null || key.length === 0) {
      throw new Error('Theme key must be a non-empty string.');
    }

    this._key = key;

    this._context = React.createContext<FlexyThemeContextValue<TKey>>({
      key: this._key,
      components: {},
    });
  }

  /**
   * Returns the theme's unique key.
   */
  public get key() {
    return this._key;
  }

  /**
   * A React provider component that supplies theme-specific component overrides.
   *
   * Must wrap any `this.flexy()`-based components to enable override resolution.
   *
   * @example
   * ```tsx
   * <MyTheme.Provider components={{ Button: CustomButton }}>
   *   <ThemedButton />
   * </MyTheme.Provider>
   * ```
   */
  public Provider = memo((props: FlexyThemeProviderProps) => {
    const { children, components } = props;

    const value = useMemo(
      () =>
        ({
          key: this._key,
          components,
        } satisfies FlexyThemeContextValue<TKey>),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [components.length, Object.keys(components), Object.values(components)]
    );

    return (
      <this._context.Provider value={value}>{children}</this._context.Provider>
    );
  });

  /**
   * Accesses the current theme context value.
   *
   * @returns The current theme context including its override map.
   */
  public useContext() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useReactContext(this._context);
  }

  /**
   * Creates a Flexy-wrapped component that resolves overrides from this specific theme.
   *
   * @template TKey - Component override key (usually matches the prop used in `components`).
   * @template TComponent - Original component type.
   *
   * @param key - Unique key for identifying this component in the theme.
   * @param Component - The base component to render if no override is found.
   * @returns A themed component that uses the override if present, otherwise falls back.
   *
   * @example
   * ```tsx
   * const Button = theme.flexy('Button', (props) => <button {...props} />);
   * ```
   */
  public flexy<
    TKey extends string,
    TComponent extends React.ComponentType<any>
  >(key: TKey, Component: TComponent): Flexy<TKey, TComponent> {
    const Result = React.forwardRef<
      TComponent,
      React.ComponentProps<TComponent>
    >((props, ref) => {
      const context = this.useContext();
      const CustomComponent = context.components[key] as React.ComponentType<
        React.ComponentProps<TComponent>
      >;

      return CustomComponent ? (
        <CustomComponent {...(props as any)} ref={ref} />
      ) : (
        <Component {...(props as any)} ref={ref} />
      );
    });

    Result.displayName = `Flexy:${this.key}:${key}`;

    return Object.assign(Result, {
      Component,
    }) as Flexy<TKey, TComponent>;
  }
}

/**
 * Factory function to create a new isolated Flexy theme.
 *
 * @param key - A unique string key identifying the theme.
 * @returns A `FlexyTheme` instance with its own context and override system.
 *
 * @example
 * ```tsx
 * const Theme = createTheme('DarkMode');
 * const Button = Theme.flexy('Button', BaseButton);
 * ```
 */
export function createTheme<TKey extends string>(key: TKey) {
  return new FlexyTheme(key);
}
