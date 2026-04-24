import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, info) {
        console.error('[ErrorBoundary]', error, info?.componentStack);
        try {
            const entry = {
                at: new Date().toISOString(),
                message: error?.message || String(error),
                stack: error?.stack || null,
                componentStack: info?.componentStack || null,
                path: typeof window !== 'undefined' ? window.location.pathname + window.location.search : null,
            };
            sessionStorage.setItem('cc:last-crash', JSON.stringify(entry));
        } catch {}
    }

    handleReload = () => {
        this.setState({ error: null });
        if (typeof window !== 'undefined') window.location.reload();
    };

    render() {
        if (!this.state.error) return this.props.children;
        const msg = this.state.error.message || String(this.state.error);
        return (
            <div style={{
                minHeight: '100vh',
                padding: '24px',
                color: '#eee',
                backgroundColor: '#312E2E',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                fontFamily: 'Oxanium, cursive',
            }}>
                <h2 style={{ margin: '0 0 12px 0', color: '#F04C53' }}>Something broke</h2>
                <p style={{ margin: '0 0 20px 0', color: '#bbb', fontSize: '11pt', maxWidth: 400 }}>
                    {msg}
                </p>
                <button
                    type='button'
                    onClick={this.handleReload}
                    style={{
                        padding: '10px 24px',
                        borderRadius: 999,
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.08)',
                        color: '#fff',
                        fontFamily: 'inherit',
                        fontSize: '11pt',
                        cursor: 'pointer',
                    }}
                >
                    Reload
                </button>
            </div>
        );
    }
}

export default ErrorBoundary;
