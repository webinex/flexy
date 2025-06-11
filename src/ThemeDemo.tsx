import { Radio } from 'antd';
import { PropsWithChildren, useMemo, useState } from 'react';
import { $Flexy, Flexy, flexy } from '../lib';

const Theme = flexy.createTheme('Theme');

const Button = Theme.flexy('Button', (props: PropsWithChildren) => {
  return <button {...props}>{props.children}</button>;
});

type ThemeComponents = $Flexy<typeof Button>;

const IGNORED_FLEXY: ThemeComponents = {
  Button: () => <span>IGNORED</span>,
};

export function ThemeDemo() {
  const [type, setType] = useState<
    | 'none'
    | 'border'
    | 'text'
    | 'add-text-after'
    | 'add-text-before'
    | 'replace-button-text'
  >('none');

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

      case 'add-text-after':
        return {
          Button: (props) => (
            <span>
              <Button.Component {...props} />
              <span> - Added text after</span>
            </span>
          ),
        };

      case 'add-text-before':
        return {
          Button: (props) => (
            <span>
              <span>Added text before - </span>
              <Button.Component {...props} />
            </span>
          ),
        };

      case 'replace-button-text':
        return {
          Button: (props) => (
            <Button.Component
              {...props}
              children="Replaced text (you can replace any prop)"
            />
          ),
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
          { label: 'Add text after', value: 'add-text-after' },
          { label: 'Add text before', value: 'add-text-before' },
          { label: 'Replace Button Text', value: 'replace-button-text' },
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
