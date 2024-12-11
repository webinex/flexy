import {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  PropsWithChildren,
} from 'react';
import { $Flexy, flexy, FlexyContext } from '../lib';

const Section = flexy('Section', ({ children }: PropsWithChildren<object>) => {
  return <section>{children}</section>;
});

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

const CUSTOMIZE: Components = {
  Button: (props) => (
    <div>
      Before button: <Button.Component {...props} />
    </div>
  ),
};

function App() {
  return (
    <FlexyContext.Provider value={CUSTOMIZE}>
      <Section>
        <Button>Click me</Button>
      </Section>
    </FlexyContext.Provider>
  );
}

export default App;
