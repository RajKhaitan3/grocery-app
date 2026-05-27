import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { FiPackage, FiShoppingBag, FiUsers, FiDollarSign } from 'react-icons/fi';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    categories: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Security Check: Redirect non-admins
  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  // Fetch Dashboard Data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // We use Promise.all to fetch multiple things at the same time for better performance
        const [productsRes, ordersRes, categoriesRes] = await Promise.all([
          API.get('/products'),
          API.get('/orders?limit=5'), // Get 5 most recent orders
          API.get('/categories')
        ]);

        setStats({
          products: productsRes.data.total || productsRes.data.count,
          orders: ordersRes.data.total || ordersRes.data.count,
          categories: categoriesRes.data.count
        });
        
        setRecentOrders(ordersRes.data.orders);
      } catch (error) {
        console.error('Error fetching admin data', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin]);

  if (!isAdmin) return null;

  return (
    <div className="page container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="section__title" style={{ textAlign: 'left' }}>Admin Dashboard</h1>
        <p className="section__subtitle" style={{ textAlign: 'left' }}>
          Welcome back, {user?.name}. Here is what's happening today.
        </p>
      </div>

      {loading ? (
        <div className="loader"><div className="spinner"></div></div>
      ) : (
        <>
          {/* STATS CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            
            <div className="category-card" style={{ cursor: 'default', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <div className="category-card__icon" style={{ width: '40px', height: '40px', fontSize: '1.2rem', color: 'var(--primary)' }}>
                  <FiShoppingBag />
                </div>
                <h3 style={{ fontSize: '1.1rem' }}>Products</h3>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', fontFamily: 'var(--font-heading)' }}>
                {stats.products}
              </div>
            </div>

            <div className="category-card" style={{ cursor: 'default', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <div className="category-card__icon" style={{ width: '40px', height: '40px', fontSize: '1.2rem', color: 'var(--accent)' }}>
                  <FiPackage />
                </div>
                <h3 style={{ fontSize: '1.1rem' }}>Total Orders</h3>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', fontFamily: 'var(--font-heading)' }}>
                {stats.orders}
              </div>
            </div>

            <div className="category-card" style={{ cursor: 'default', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <div className="category-card__icon" style={{ width: '40px', height: '40px', fontSize: '1.2rem', color: 'var(--info)' }}>
                  <FiUsers />
                </div>
                <h3 style={{ fontSize: '1.1rem' }}>Categories</h3>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', fontFamily: 'var(--font-heading)' }}>
                {stats.categories}
              </div>
            </div>

          </div>

          {/* RECENT ORDERS TABLE */}
          <div className="cart-summary" style={{ marginTop: 0 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: '1.5rem' }}>
              Recent Orders
            </h3>
            
            {recentOrders.length === 0 ? (
              <p style={{ color: 'var(--text-light)' }}>No orders found.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '1rem 0' }}>Order ID</th>
                      <th style={{ padding: '1rem 0' }}>Customer</th>
                      <th style={{ padding: '1rem 0' }}>Date</th>
                      <th style={{ padding: '1rem 0' }}>Total</th>
                      <th style={{ padding: '1rem 0' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => (
                      <tr key={order._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '1rem 0', fontWeight: '600' }}>{order.orderNumber}</td>
                        <td style={{ padding: '1rem 0' }}>
                          <div>{order.user?.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{order.user?.customerType}</div>
                        </td>
                        <td style={{ padding: '1rem 0' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '1rem 0', fontWeight: 'bold' }}>₹{order.totalAmount}</td>
                        <td style={{ padding: '1rem 0' }}>
                          <span style={{ 
                            padding: '4px 8px', 
                            borderRadius: '4px', 
                            fontSize: '0.8rem', 
                            fontWeight: 'bold',
                            backgroundColor: order.deliveryStatus === 'delivered' ? 'var(--primary-50)' : '#fffbeb',
                            color: order.deliveryStatus === 'delivered' ? 'var(--primary-dark)' : 'var(--accent-dark)'
                          }}>
                            {order.deliveryStatus.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
