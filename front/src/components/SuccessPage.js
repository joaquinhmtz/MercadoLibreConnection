import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SuccessPage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Get user_id from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const userIdFromUrl = urlParams.get('user_id');
    
    if (userIdFromUrl) {
      setUserId(userIdFromUrl);
      fetchUserData(userIdFromUrl);
    } else {
      setError('No se encontró el ID de usuario en la URL');
      setLoading(false);
    }
  }, []);

  const fetchUserData = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';
      const response = await axios.get(`${backendUrl}/me/${userId}`);
      
      if (response.data.success) {
        setUserData(response.data);
      } else {
        setError('Error al obtener los datos del usuario');
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(
        err.response?.data?.message || 
        'Error al conectar con el servidor. Verifica que el backend esté ejecutándose.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (userId) {
      fetchUserData(userId);
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="container">
        <div className="logo">ML</div>
        <h2>Cargando información...</h2>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '20px' }}>
          <span className="loading"></span>
        </div>
        <p>Obteniendo tus datos de MercadoLibre...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="logo">ML</div>
        <h2>Error</h2>
        <div className="error-message">
          <p><strong>Ocurrió un error:</strong></p>
          <p>{error}</p>
        </div>
        <div>
          <button className="meli-button" onClick={handleRetry}>
            Reintentar
          </button>
          <button className="button-secondary" onClick={handleGoHome}>
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="logo">ML</div>
      
      <div className="success-message">
        <h2>¡Conexión exitosa!</h2>
        <p>Tu cuenta de MercadoLibre ha sido conectada correctamente.</p>
      </div>

      {userData && userData.user && (
        <div className="user-info">
          <h3>Información de tu cuenta:</h3>
          
          <p><strong>ID de Usuario:</strong> {userData.user.id}</p>
          
          {userData.user.nickname && (
            <p><strong>Nickname:</strong> {userData.user.nickname}</p>
          )}
          
          {userData.user.first_name && (
            <p><strong>Nombre:</strong> {userData.user.first_name} {userData.user.last_name || ''}</p>
          )}
          
          {userData.user.email && (
            <p><strong>Email:</strong> {userData.user.email}</p>
          )}
          
          {userData.user.country_id && (
            <p><strong>País:</strong> {userData.user.country_id}</p>
          )}
          
          {userData.user.user_type && (
            <p><strong>Tipo de usuario:</strong> {userData.user.user_type}</p>
          )}
          
          {userData.user.points && (
            <p><strong>Puntos:</strong> {userData.user.points}</p>
          )}
          
          {userData.token_info && (
            <>
              <hr style={{ margin: '20px 0' }} />
              <h4>Información del token:</h4>
              <p><strong>Permisos:</strong> {userData.token_info.scope}</p>
              <p><strong>Última actualización:</strong> {new Date(userData.token_info.updated_at).toLocaleString()}</p>
              {userData.token_info.refreshed && (
                <p style={{ color: '#28a745' }}><strong>Token renovado automáticamente</strong></p>
              )}
            </>
          )}
        </div>
      )}

      <div style={{ marginTop: '30px' }}>
        <p><strong>¿Qué sigue?</strong></p>
        <ul style={{ textAlign: 'left', display: 'inline-block' }}>
          <li>Tu aplicación ahora puede acceder a tu información de MercadoLibre</li>
          <li>Recibirás notificaciones automáticas sobre nuevas ventas</li>
          <li>Los tokens se renovarán automáticamente cuando sea necesario</li>
          <li>Puedes consultar tus datos en cualquier momento</li>
        </ul>
      </div>

      <div style={{ marginTop: '30px' }}>
        <button className="button-secondary" onClick={handleRetry}>
          Actualizar datos
        </button>
        <button className="button-secondary" onClick={handleGoHome}>
          Volver al inicio
        </button>
      </div>

      <div style={{ fontSize: '12px', color: '#999', marginTop: '30px' }}>
        <p>
          <strong>Nota:</strong> Esta información se obtiene directamente de tu cuenta de MercadoLibre 
          usando los tokens de acceso almacenados de forma segura.
        </p>
      </div>
    </div>
  );
};

export default SuccessPage;