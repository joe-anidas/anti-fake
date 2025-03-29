import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/"); // Redirect back to connect page
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to your profile!</p>
      <button onClick={handleLogout}>Disconnect</button>
    </div>
  );
}

export default Dashboard;
