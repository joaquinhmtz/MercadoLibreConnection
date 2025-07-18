import React, { useState } from 'react';

const HomePage = () => {
  const [storeName, setStoreName] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    
    // Redirect to backend OAuth endpoint
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';
    window.location.href = `${backendUrl}/auth/meli`;
  };

  return (
    <div className="container">
      <div className="logo">ML</div>
      
      <h2>Conecta tu tienda con MercadoLibre</h2>
      
      <p>
        Autoriza nuestra aplicación para acceder a tu cuenta de MercadoLibre 
        y recibir notificaciones en tiempo real sobre tus ventas, preguntas y más.
      </p>

      <div className="input-group">
        <label htmlFor="storeName">
          Nombre de tu tienda (opcional):
        </label>
        <input
          type="text"
          id="storeName"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          placeholder="Ej: Mi Tienda Online"
          disabled={isConnecting}
        />
      </div>

      <div style={{ margin: '30px 0' }}>
        <button 
          className="meli-button"
          onClick={handleConnect}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <>
              <span className="loading"></span>
              Conectando...
            </>
          ) : (
            'Conectar con MercadoLibre'
          )}
        </button>
      </div>

      <div style={{ fontSize: '14px', color: '#666', marginTop: '20px' }}>
        <p><strong>Permisos que solicitaremos:</strong></p>
        <ul style={{ textAlign: 'left', display: 'inline-block' }}>
          <li>Leer y gestionar tus publicaciones</li>
          <li>Leer información de órdenes</li>
          <li>Leer información de usuario</li>
          <li>Leer información de envíos</li>
        </ul>
      </div>

      <div style={{ fontSize: '12px', color: '#999', marginTop: '30px' }}>
        <p>
          Al conectar tu cuenta, aceptas que nuestra aplicación acceda a la información 
          especificada según los términos de uso de MercadoLibre.
        </p>
      </div>
    </div>
  );
};

export default HomePage;