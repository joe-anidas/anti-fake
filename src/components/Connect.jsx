import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

function Connect({ provider }) {
  const [accounts, setAccounts] = useState([]);
  const [contextAccounts, setContextAccounts] = useState([]);
  const [profileConnected, setProfileConnected] = useState(false);
  const navigate = useNavigate();

  const updateConnected = useCallback((_accounts, _contextAccounts) => {
    setProfileConnected(_accounts.length > 0 && _contextAccounts.length > 0);
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const _accounts = provider.accounts || [];
        setAccounts(_accounts);

        const _contextAccounts = provider.contextAccounts || [];
        setContextAccounts(_contextAccounts);

        updateConnected(_accounts, _contextAccounts);

        if (_accounts.length > 0 && _contextAccounts.length > 0) {
          navigate("/dashboard"); // Redirect after connection
        }
      } catch (error) {
        console.error("Failed to initialize provider:", error);
      }
    }

    const handleAccountsChanged = (_accounts) => {
      setAccounts(_accounts);
      updateConnected(_accounts, contextAccounts);
    };

    const handleContextAccountsChanged = (_accounts) => {
      setContextAccounts(_accounts);
      updateConnected(accounts, _accounts);
    };

    init();

    provider.on("accountsChanged", handleAccountsChanged);
    provider.on("contextAccountsChanged", handleContextAccountsChanged);

    return () => {
      provider.removeListener("accountsChanged", handleAccountsChanged);
      provider.removeListener("contextAccountsChanged", handleContextAccountsChanged);
    };
  }, [accounts, contextAccounts, provider, updateConnected, navigate]);

  return (
    <div>
      <h1>Connect to Your Universal Profile</h1>
      {profileConnected ? (
        <p>Connected Profile: {accounts[0]}</p>
      ) : (
        <p>Waiting for connection...</p>
      )}
    </div>
  );
}

export default Connect;
