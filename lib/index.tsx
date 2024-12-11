import React, { memo, PropsWithChildren, useContext, useMemo } from 'react';

export type FlexyContext = Record<string, React.ComponentType>;
export const FlexyContext = React.createContext<FlexyContext>({});

export const Flexy = memo((props: PropsWithChildren<FlexyContext>) => {
  const { children, ...other } = props;
  const values = Object.values(other);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = useMemo(() => ({ ...other }), [...values, values.length]);

  return (
    <FlexyContext.Provider value={value}>{children}</FlexyContext.Provider>
  );
});

export function useFlexy() {
  return useContext(FlexyContext);
}

export type $Flexy<U extends Flexy<string, any>> = {
  [K in U['__key']]?: React.ComponentType<
    React.ComponentProps<Extract<U, { __key: K }>['Component']>
  >;
};

export type Flexy<
  TKey extends string,
  TComponent extends React.ComponentType<any>
> = React.ForwardRefExoticComponent<React.ComponentProps<TComponent>> &
  React.RefAttributes<TComponent> & {
    Component: TComponent;
    __key: TKey;
  };

export function flexy<
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

  Result.displayName = `Flexy_${key}`;

  return Object.assign(Result, {
    Component,
  }) as Flexy<TKey, TComponent>;
}
