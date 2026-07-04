import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import '../index.css';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('deposit');
  const [amount, setAmount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [accRes, txRes] = await Promise.all([
        api.get('/accounts'),
        api.get('/transactions/history')
      ]);
      setAccounts(accRes.data.accounts);
      setTransactions(txRes.data.history);
      if (accRes.data.accounts.length > 0 && !selectedAccount) {
        setSelectedAccount(accRes.data.accounts[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAccount = async () => {
    try {
      await api.post('/accounts', { accountType: 'checking' });
      fetchData();
    } catch (err) {
      setError('Failed to create account');
    }
  };

  const handleAction = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      if (activeTab === 'deposit') {
        await api.post('/transactions/credit', { accountId: selectedAccount, amount });
      } else if (activeTab === 'withdraw') {
        await api.post('/transactions/debit', { accountId: selectedAccount, amount });
      } else if (activeTab === 'transfer') {
        await api.post('/transactions/transfer', { fromAccountId: selectedAccount, toAccountId: toAccount, amount });
      }
      setSuccess('Transaction completed!');
      setAmount(''); setToAccount('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar glass-panel">
        <h2>Apex Bank</h2>
        <div className="nav-actions">
          <span>{user?.email}</span>
          <button onClick={logout} className="btn btn-ghost">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <section className="accounts-section">
          <div className="section-header">
            <h3>Accounts</h3>
            <button onClick={handleCreateAccount} className="btn btn-secondary">+ New Account</button>
          </div>
          <div className="accounts-grid">
            {accounts.map(acc => (
              <div key={acc.id} className="account-card">
                <div className="account-type">{acc.account_type}</div>
                <div className="account-balance">${parseFloat(acc.balance).toFixed(2)}</div>
                <div className="account-id">{acc.id}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="dashboard-split">
          <section className="actions-section glass-panel">
            <h3>Operations</h3>
            <div className="tabs">
              <button className={`tab ${activeTab==='deposit'?'active':''}`} onClick={()=>setActiveTab('deposit')}>Deposit</button>
              <button className={`tab ${activeTab==='withdraw'?'active':''}`} onClick={()=>setActiveTab('withdraw')}>Withdraw</button>
              <button className={`tab ${activeTab==='transfer'?'active':''}`} onClick={()=>setActiveTab('transfer')}>Transfer</button>
            </div>
            {error && <div className="error-alert">{error}</div>}
            {success && <div className="success-alert">{success}</div>}
            <form onSubmit={handleAction} className="action-form">
              <div className="input-group">
                <label>From Account</label>
                <select value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)} required>
                  <option value="">Select Account</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.account_type} - {a.id}</option>)}
                </select>
              </div>
              {activeTab === 'transfer' && (
                <div className="input-group">
                  <label>To Account ID</label>
                  <input type="text" value={toAccount} onChange={(e) => setToAccount(e.target.value)} required />
                </div>
              )}
              <div className="input-group">
                <label>Amount</label>
                <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary btn-block">Execute</button>
            </form>
          </section>

          <section className="history-section glass-panel">
            <h3>History</h3>
            <div className="tx-list">
              {transactions.map(tx => (
                <div key={tx.id} className={`tx-item ${tx.type}`}>
                  <div>
                    <h4>{tx.type.toUpperCase()}</h4>
                    <small>{new Date(tx.created_at).toLocaleString()}</small>
                  </div>
                  <div className={`tx-amount ${tx.type === 'deposit' ? 'positive' : 'negative'}`}>
                    {tx.type === 'deposit' ? '+' : '-'}${tx.amount}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
