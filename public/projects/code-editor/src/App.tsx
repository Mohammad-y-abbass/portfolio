import { useState, useEffect } from "react";
import { bundler, init } from "./bundler";
import CodeEditor from "./components/CodeEditor";
import "./app.css";
import Preview from "./components/Preview";

const INITIAL_CODE = `import ReactDOM from 'react-dom/client';
import React, { useState } from 'react';

const Counter = () => {
  const [count, setCount] = useState(0);

  const isPositive = count > 0;
  const isNegative = count < 0;

  const styles = {
    body: {
      margin: 0,
      padding: 0,
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Segoe UI', sans-serif",
      boxSizing: 'border-box',
    },
    card: {
      background: 'rgba(255,255,255,0.05)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '24px',
      padding: '48px 64px',
      textAlign: 'center',
      boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
    },
    title: {
      margin: '0 0 8px',
      fontSize: '14px',
      letterSpacing: '4px',
      textTransform: 'uppercase',
      color: 'black',
    },
    count: {
      fontSize: '96px',
      fontWeight: '800',
      margin: '16px 0 40px',
      transition: 'all 0.3s ease',
      lineHeight: 1,
    },
    btnRow: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'center',
    },
    btn: (variant) => ({
      padding: '12px 28px',
      fontSize: '15px',
      fontWeight: '600',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      background:
        variant === 'inc'
          ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
          : variant === 'dec'
          ? 'linear-gradient(135deg, #ef4444, #dc2626)'
          : 'rgba(255,255,255,0.1)',
      color: 'black',
      boxShadow:
        variant === 'inc'
          ? '0 4px 20px rgba(99,102,241,0.4)'
          : variant === 'dec'
          ? '0 4px 20px rgba(239,68,68,0.4)'
          : 'none',
    }),
  };

  return (
    <div style={styles.body}>
      <div style={styles.card}>
        <p style={styles.title}>Counter</p>
        <div style={styles.count}>{count}</div>
        <div style={styles.btnRow}>
          <button style={styles.btn('dec')} onClick={() => setCount(p => p - 1)}>−</button>
          <button style={styles.btn('reset')} onClick={() => setCount(0)}>Reset</button>
          <button style={styles.btn('inc')} onClick={() => setCount(p => p + 1)}>+</button>
        </div>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<Counter />);`

const App = () => {
  const [input, setInput] = useState(INITIAL_CODE);
  const [code, setCode] = useState(INITIAL_CODE);
  const [error, setError] = useState("");

  useEffect(() => {
    init().then(async () => {
      console.log("esbuild initialized");
      const output = await bundler(INITIAL_CODE);
      setCode(output.code);
      setError(output.error);
    });
  }, []);

  async function bundle() {
    const output = await bundler(input);
    setCode(output.code);
    setError(output.error);
    console.log("bundled code :", output);
  }

  return (
    <div className="app">
      <CodeEditor
        initialValue={INITIAL_CODE}
        onChange={(value) => {
          setInput(value);
        }}
        onRun={bundle}
      />
      <Preview code={code} error={error} />
    </div>
  );
};

export default App;
