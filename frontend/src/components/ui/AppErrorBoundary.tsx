import React from 'react';

export default class AppErrorBoundary extends React.Component<{ children: React.ReactNode; onClose: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    return <section role="alert" style={{ padding: 28, height: '100%', overflow: 'auto' }}>
      <h2>This app could not display its workspace.</h2>
      <p>Your saved progress is retained. You can retry or close this app and use the desktop.</p>
      <div style={{ display: 'flex', gap: 12 }}><button className="mira-button" onClick={() => this.setState({ failed: false })}>Retry app</button><button className="mira-button" onClick={this.props.onClose}>Close app</button></div>
    </section>;
  }
}
