import React, { memo, PropsWithChildren, useContext, useMemo } from 'react';
import { createTheme } from './theme';

/**
 * A record of component overrides indexed by string keys.
 */
export type FlexyContext = Record<string, React.ComponentType<any>>;

/**
 * React context that stores the current map of overrideable components.
 *
 * Used internally by `flexy()` components to dynamically resolve
 * the active implementation based on their `__key`.
 *
 * Provided via the `<Flexy />` component, which supports merging or replacing
 * the component map in nested trees.
 */
export const FlexyContext = React.createContext<FlexyContext>({});

const EMPTY_OBJECT = Object.freeze({});

export interface FlexyProps extends PropsWithChildren<object> {
  /**
   * The component override map. Keys correspond to component __key.
   */
  value?: FlexyContext;

  /**
   * Merge strategy:
   * - `merge` (default): extend previous context with new overrides
   * - `replace`: fully replace the previous context
   */
  mode?: 'replace' | 'merge';
}

/**
 * `<Flexy />` is a provider component used to supply component overrides.
 *
 * Example:
 * ```tsx
 * <Flexy value={{ Button: CustomButton }}>
 *   <Button>Click me</Button>
 * </Flexy>
 * ```
 */
export const Flexy = memo((props: FlexyProps) => {
  const { children, value, mode } = props;
  const context = useContext(FlexyContext);
  const result = useMemo(
    () =>
      mode === 'replace' ? value ?? EMPTY_OBJECT : { ...context, ...value },
    [context, value, mode]
  );

  return (
    <FlexyContext.Provider value={result}>{children}</FlexyContext.Provider>
  );
});

/**
 * Returns the current flexy override context.
 *
 * @returns {FlexyContext} The component override map from the nearest Flexy provider.
 */
export function useFlexy() {
  return useContext(FlexyContext);
}

/**
 * Utility type that maps a union of `flexy()` components to an override shape.
 *
 * Example:
 * ```ts
 * const Button = flexy('Button', ...);
 * const Title = flexy('Title', ...);
 *
 * type FlexyComponentMap = $Flexy<typeof Button | typeof Title>;
 *
 * const components: FlexyComponentMap = {
 *   Button: CustomButton,
 * }
 * ```
 */
export type $Flexy<U extends Flexy<string, any>> = {
  [K in U['__key']]?: React.ComponentType<
    React.ComponentProps<Extract<U, { __key: K }>['Component']>
  >;
};

/**
 * Type representing a component created by `flexy()`.
 *
 * A flexy component is a wrapper around a base component that can be dynamically
 * overridden via context. It retains metadata including the original component (`.Component`)
 * and its override key (`.__key`).
 *
 * This type is primarily used for typing overrides (via `$Flexy`) and for introspection.
 *
 * @template TKey - Unique string key used for context-based overrides.
 * @template TComponent - The original component type wrapped by `flexy()`.
 */
export type Flexy<
  TKey extends string,
  TComponent extends React.ComponentType<any>
> = React.ForwardRefExoticComponent<React.ComponentProps<TComponent>> &
  React.RefAttributes<TComponent> & {
    Component: TComponent;
    __key: TKey;
  };

/**
 * Creates a Flexy-enhanced component which can be overridden by context key.
 *
 * @template TKey - Unique identifier for the component.
 * @template TComponent - The original React component type.
 *
 * @param key - A unique string identifying the component in the override context.
 * @param Component - The original component implementation.
 * @returns A wrapped component that respects overrides from the nearest `<Flexy />` provider.
 *
 * @example
 * ```tsx
 * const Button = flexy('Button', (props) => <button {...props} />);
 *
 * <Flexy value={{ Button: CustomButton }}>
 *   <Button>Click me</Button>
 * </Flexy>
 * ```
 */
function flexyFunction<
  TKey extends string,
  TComponent extends React.ComponentType<any>
>(key: TKey, Component: TComponent): Flexy<TKey, TComponent> {
  const Result = React.forwardRef<TComponent, React.ComponentProps<TComponent>>(
    (props, ref) => {
      const context = useFlexy();
      const CustomComponent = context[key] as React.ComponentType<
        React.ComponentProps<TComponent>
      >;

      return CustomComponent ? (
        <CustomComponent {...(props as any)} ref={ref} />
      ) : (
        <Component {...(props as any)} ref={ref} />
      );
    }
  );

  Result.displayName = `Flexy:${key}`;

  return Object.assign(Result, {
    Component,
  }) as Flexy<TKey, TComponent>;
}

/**
 * Entry point for working with flexy components.
 *
 * Use `flexy(key, Component)` to create overrideable components,
 * and `flexy.createTheme(name)` to create an isolated theme context.
 */
export const flexy = Object.assign(flexyFunction, {
  createTheme,
});
