import {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  PropsWithChildren,
} from 'react';
import { $Flexy, Flexy, flexy } from '../lib';

const Section = flexy(
  'Section',
  ({
    children,
    ...rest
  }: PropsWithChildren<
    DetailedHTMLProps<React.HtmlHTMLAttributes<HTMLElement>, HTMLElement>
  >) => {
    return <section {...rest}>{children}</section>;
  }
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
  Section: (props) => {
    return (
      <div>
        <Section.Component {...props} style={{ color: 'red' }} />
      </div>
    );
  },
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
