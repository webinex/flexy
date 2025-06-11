import './App.css';
import { Tabs } from 'antd';
import { FlexyDemo } from './FlexyDemo';
import { ThemeDemo } from './ThemeDemo';
import { useEffect, useState } from 'react';

export function App() {
  const [active, setActive] = useState<string>(
    window.location.hash.length > 0 ? window.location.hash.slice(1) : 'basic'
  );

  useEffect(() => {
    window.location.hash = active;
  }, [active]);

  return (
    <div className="app">
      <Tabs
        activeKey={active}
        onChange={setActive}
        items={[
          { key: 'basic', label: 'Basic', children: <FlexyDemo /> },
          { key: 'theme', label: 'Theme', children: <ThemeDemo /> },
        ]}
      />
    </div>
  );
}
