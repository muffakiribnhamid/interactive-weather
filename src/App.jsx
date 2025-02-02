import { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';

// Weather effects with neubrutalism style
const weatherEffects = {
  'clear-day': {
    icon: '☀️',
    background: '#FFE761',
    particleConfig: { count: 50, type: 'sparkle', color: '#FF8A00' }
  },
  'clear-night': {
    icon: '🌙',
    background: '#2B2B2B',
    particleConfig: { count: 100, type: 'star', color: '#FFFFFF' }
  },
  'rain-day': {
    icon: '🌧️',
    background: '#7CA5B8',
    particleConfig: { count: 200, type: 'rain', color: '#89CFF0' }
  },
  'rain-night': {
    icon: '🌧️',
    background: '#1F1F1F',
    particleConfig: { count: 200, type: 'rain', color: '#4B0082' }
  },
  'snow-day': {
    icon: '🌨️',
    background: '#E6DADA',
    particleConfig: { count: 150, type: 'snow', color: '#FFFFFF' }
  },
  'snow-night': {
    icon: '🌨️',
    background: '#2C3E50',
    particleConfig: { count: 150, type: 'snow', color: '#E6E6FA' }
  },
  'clouds-day': {
    icon: '☁️',
    background: '#D7DDE8',
    particleConfig: { count: 30, type: 'cloud', color: '#B0C4DE' }
  },
  'clouds-night': {
    icon: '☁️',
    background: '#2B2B2B',
    particleConfig: { count: 30, type: 'cloud', color: '#708090' }
  },
  'thunder-day': {
    icon: '⚡',
    background: '#4A4A4A',
    particleConfig: { count: 10, type: 'lightning', color: '#FFD700' }
  },
  'thunder-night': {
    icon: '⚡',
    background: '#1A1A1A',
    particleConfig: { count: 10, type: 'lightning', color: '#FFD700' }
  },
  'mist-day': {
    icon: '🌫️',
    background: '#B8B8B8',
    particleConfig: { count: 100, type: 'mist', color: '#B8B8B8' }
  },
  'mist-night': {
    icon: '🌫️',
    background: '#2B2B2B',
    particleConfig: { count: 100, type: 'mist', color: '#696969' }
  }
};

function App() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState('celsius');
  const [theme, setTheme] = useState('dark');
  const [particles, setParticles] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [coordinates, setCoordinates] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [weatherAnimation, setWeatherAnimation] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const videoRef = useRef(null);

  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  // Enhanced particle system
  const createParticles = useCallback((type, config) => {
    if (!config) return [];

    return Array.from({ length: config.count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 3 + 2,
      speedX: (Math.random() - 0.5) * 2,
      speedY: type === 'rain' ? Math.random() * 15 + 10 : Math.random() * 2 + 1,
      opacity: Math.random(),
      color: config.color,
      type: config.type,
      angle: type === 'lightning' ? Math.random() * Math.PI * 2 : 0,
      flash: false,
      lifespan: type === 'lightning' ? Math.random() * 20 + 10 : Infinity,
      age: 0
    }));
  }, []);

  // Enhanced animation system
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((particle, index) => {
      // Update particle age
      particle.age++;
      if (particle.age > particle.lifespan) {
        particles[index] = createNewParticle(particle.type);
        return;
      }

      // Particle effects based on type
      switch (particle.type) {
        case 'sparkle':
          drawSparkle(ctx, particle);
          break;
        case 'star':
          drawStar(ctx, particle);
          break;
        case 'rain':
          drawRain(ctx, particle);
          break;
        case 'snow':
          drawSnow(ctx, particle);
          break;
        case 'cloud':
          drawCloud(ctx, particle);
          break;
        case 'lightning':
          drawLightning(ctx, particle);
          break;
        case 'mist':
          drawMist(ctx, particle);
          break;
        default:
          break;
      }

      // Update particle position
      updateParticlePosition(particle, canvas);
    });

    animationRef.current = requestAnimationFrame(animate);
  }, [particles]);

  // Particle drawing functions
  const drawSparkle = (ctx, particle) => {
    const flickerRate = Math.sin(Date.now() * 0.01 + particle.x);
    ctx.fillStyle = `rgba(255, 215, 0, ${0.3 + flickerRate * 0.7})`;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const length = particle.size * (1 + flickerRate * 0.5);
      ctx.lineTo(
        particle.x + Math.cos(angle) * length,
        particle.y + Math.sin(angle) * length
      );
    }
    ctx.fill();
  };

  const drawStar = (ctx, particle) => {
    const flickerRate = Math.sin(Date.now() * 0.003 + particle.x);
    ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + flickerRate * 0.5})`;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5;
      ctx.lineTo(
        particle.x + Math.cos(angle) * particle.size,
        particle.y + Math.sin(angle) * particle.size
      );
    }
    ctx.fill();
  };

  const drawRain = (ctx, particle) => {
    ctx.strokeStyle = `rgba(137, 207, 240, ${particle.opacity})`;
    ctx.lineWidth = particle.size / 2;
    ctx.beginPath();
    ctx.moveTo(particle.x, particle.y);
    ctx.lineTo(
      particle.x + particle.speedX * 2,
      particle.y + particle.speedY * 2
    );
    ctx.stroke();
  };

  const drawSnow = (ctx, particle) => {
    ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();

    // Add sparkle effect
    if (Math.random() < 0.1) {
      ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity * 0.8})`;
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        ctx.fillRect(
          particle.x + Math.cos(angle) * particle.size * 2,
          particle.y + Math.sin(angle) * particle.size * 2,
          1,
          1
        );
      }
    }
  };

  const drawCloud = (ctx, particle) => {
    ctx.fillStyle = `rgba(176, 196, 222, ${particle.opacity * 0.3})`;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawLightning = (ctx, particle) => {
    if (Math.random() < 0.03) particle.flash = true;
    if (particle.flash) {
      ctx.strokeStyle = `rgba(255, 215, 0, ${particle.opacity})`;
      ctx.lineWidth = particle.size;
      ctx.beginPath();
      ctx.moveTo(particle.x, particle.y);
      
      let currentX = particle.x;
      let currentY = particle.y;
      
      for (let i = 0; i < 5; i++) {
        currentX += (Math.random() - 0.5) * 100;
        currentY += 50;
        ctx.lineTo(currentX, currentY);
      }
      
      ctx.stroke();
      particle.flash = false;
    }
  };

  const drawMist = (ctx, particle) => {
    const gradient = ctx.createRadialGradient(
      particle.x, particle.y, 0,
      particle.x, particle.y, particle.size * 5
    );
    gradient.addColorStop(0, `rgba(184, 184, 184, ${particle.opacity * 0.2})`);
    gradient.addColorStop(1, 'rgba(184, 184, 184, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size * 5, 0, Math.PI * 2);
    ctx.fill();
  };

  const updateParticlePosition = (particle, canvas) => {
    particle.x += particle.speedX;
    particle.y += particle.speedY;

    // Reset particle position when it goes off screen
    if (particle.y > canvas.height) {
      particle.y = -10;
      particle.x = Math.random() * canvas.width;
    }
    if (particle.x > canvas.width) {
      particle.x = 0;
    }
    if (particle.x < 0) {
      particle.x = canvas.width;
    }
  };

  const createNewParticle = (type) => {
    const config = weatherEffects[getWeatherClass()]?.particleConfig;
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 3 + 2,
      speedX: (Math.random() - 0.5) * 2,
      speedY: type === 'rain' ? Math.random() * 15 + 10 : Math.random() * 2 + 1,
      opacity: Math.random(),
      color: config?.color || '#FFFFFF',
      type: type,
      angle: type === 'lightning' ? Math.random() * Math.PI * 2 : 0,
      flash: false,
      lifespan: type === 'lightning' ? Math.random() * 20 + 10 : Infinity,
      age: 0
    };
  };

  // Get user's location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          setLoadingLocation(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLoadingLocation(false);
          // Default to a location if geolocation fails
          setCoordinates({ lat: 51.5074, lon: -0.1278 }); // London
        }
      );
    }
  }, []);

  // Fetch weather data based on coordinates
  useEffect(() => {
    if (coordinates) {
      fetchWeatherData(`${coordinates.lat},${coordinates.lon}`);
    }
  }, [coordinates]);

  // Auto-refresh weather data
  useEffect(() => {
    const interval = setInterval(() => {
      if (coordinates) {
        fetchWeatherData(`${coordinates.lat},${coordinates.lon}`);
      }
    }, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, [coordinates]);

  // Initialize canvas and animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Start/stop animation based on weather
  useEffect(() => {
    if (weather) {
      const condition = weather.condition.text.toLowerCase();
      let animationType = null;

      if (condition.includes('rain')) animationType = 'rain';
      else if (condition.includes('snow')) animationType = 'snow';
      else if (condition.includes('cloud')) animationType = 'clouds';
      else if (condition.includes('thunder')) animationType = 'thunder';

      if (animationType) {
        const config = weatherEffects[getWeatherClass()]?.particleConfig;
        setParticles(createParticles(animationType, config));
        setWeatherAnimation(animationType);
      } else {
        setParticles([]);
        setWeatherAnimation(null);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [weather, createParticles]);

  // Run animation
  useEffect(() => {
    if (particles.length > 0) {
      animate();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particles, animate]);

  const fetchWeatherData = async (query) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${query}&days=7&aqi=yes`
      );
      if (!response.ok) throw new Error('Location not found');
      const data = await response.json();
      setWeather(data.current);
      setForecast(data.forecast);
      setLocation(data.location);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback((e) => {
    const query = e.target.value.trim();
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    const fetchLocations = async () => {
      try {
        const response = await fetch(
          `https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${encodeURIComponent(query)}`
        );
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(fetchLocations, 300);
    return () => clearTimeout(timeoutId);
  }, [API_KEY]);

  const selectLocation = useCallback((location) => {
    setLocation(location);
    setIsSearchOpen(false);
    setSearchResults([]);
  }, []);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSearchOpen && !event.target.closest('.location-search')) {
        setIsSearchOpen(false);
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchOpen]);

  const getWeatherClass = () => {
    if (!weather) return 'default-day';
    const isDay = weather.is_day;
    const condition = weather.condition.text.toLowerCase();
    
    if (condition.includes('rain')) return `rain-${isDay ? 'day' : 'night'}`;
    if (condition.includes('snow')) return `snow-${isDay ? 'day' : 'night'}`;
    if (condition.includes('cloud')) return `clouds-${isDay ? 'day' : 'night'}`;
    if (condition.includes('thunder')) return `thunder-${isDay ? 'day' : 'night'}`;
    if (condition.includes('mist') || condition.includes('fog')) return `mist-${isDay ? 'day' : 'night'}`;
    if (condition.includes('clear') || condition.includes('sunny')) 
      return `clear-${isDay ? 'day' : 'night'}`;
    return `default-${isDay ? 'day' : 'night'}`;
  };

  const getAQILevel = (aqi) => {
    if (aqi <= 50) return { level: 'Good', color: '#00e400' };
    if (aqi <= 100) return { level: 'Moderate', color: '#ffff00' };
    if (aqi <= 150) return { level: 'Unhealthy for Sensitive Groups', color: '#ff7e00' };
    if (aqi <= 200) return { level: 'Unhealthy', color: '#ff0000' };
    if (aqi <= 300) return { level: 'Very Unhealthy', color: '#8f3f97' };
    return { level: 'Hazardous', color: '#7e0023' };
  };

  const getWindDirection = (degrees) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-animation"></div>
        <p>Loading your weather data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <div className="error-icon">⚠️</div>
        <p>Error: {error}</p>
        <button onClick={() => fetchWeatherData(`${coordinates.lat},${coordinates.lon}`)}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`app ${theme}`} style={{ background: weatherEffects[getWeatherClass()]?.background }}>
      <canvas ref={canvasRef} className="weather-canvas" />
      
      <div className="sidebar">
        <div className="profile brutal-box">
          <div className="profile-icon">
            {weatherEffects[getWeatherClass()]?.icon || '🌍'}
          </div>
          <div className="location-search">
            <button 
              className="search-button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              {isSearchOpen ? '✕ Close Search' : '🔍 Search Location'}
            </button>
            {isSearchOpen && (
              <>
                <div className="search-overlay" onClick={() => setIsSearchOpen(false)} />
                <div className="search-container animate-in">
                  <input
                    type="text"
                    placeholder="Enter city name..."
                    onChange={handleSearch}
                    className="search-input"
                    autoFocus
                  />
                  {searchResults.length > 0 && (
                    <ul className="search-results">
                      {searchResults.map((result) => (
                        <li
                          key={`${result.lat}-${result.lon}`}
                          onClick={() => selectLocation(result)}
                          className="search-result-item"
                        >
                          <span className="search-result-icon">📍</span>
                          <div className="search-result-info">
                            <div className="search-result-name">{result.name}</div>
                            <div className="search-result-country">
                              {result.region && `${result.region}, `}{result.country}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="controls brutal-box">
          <button 
            className="brutal-button"
            onClick={() => setUnit(unit === 'celsius' ? 'fahrenheit' : 'celsius')}
          >
            <span>🌡️</span>
            °{unit === 'celsius' ? 'C' : 'F'}
          </button>
          <button 
            className="brutal-button"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            <span>{theme === 'light' ? '🌙' : '☀️'}</span>
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
        </div>

        {weather && (
          <div className="weather-stats brutal-box">
            <h3>Today's Stats</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-icon">🌅</span>
                <span className="stat-label">Sunrise</span>
                <span className="stat-value">{forecast?.forecastday[0]?.astro.sunrise}</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">🌇</span>
                <span className="stat-label">Sunset</span>
                <span className="stat-value">{forecast?.forecastday[0]?.astro.sunset}</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">👁️</span>
                <span className="stat-label">Visibility</span>
                <span className="stat-value">{weather.vis_km} km</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">🌡️</span>
                <span className="stat-label">Pressure</span>
                <span className="stat-value">{weather.pressure_mb} mb</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="main-content">
        {weather && location && (
          <>
            <div className="current-weather">
              <div className="weather-main brutal-box">
                <div className="city-info">
                  <h1>{location.name}</h1>
                  <h2>{location.region}, {location.country}</h2>
                  <p className="local-time">{new Date().toLocaleTimeString()}</p>
                </div>
                <div className="temperature">
                  {unit === 'celsius' ? Math.round(weather.temp_c) : Math.round(weather.temp_f)}°
                  <span className="temp-unit">{unit === 'celsius' ? 'C' : 'F'}</span>
                </div>
                <div className="condition">
                  <span className="condition-icon">
                    {weatherEffects[getWeatherClass()]?.icon}
                  </span>
                  <span>{weather.condition.text}</span>
                </div>
              </div>

              <div className="detail-grid">
                <div className="detail-item brutal-box">
                  <span className="detail-icon">🌡️</span>
                  <span className="detail-label">Feels Like</span>
                  <span className="detail-value">
                    {unit === 'celsius' ? Math.round(weather.feelslike_c) : Math.round(weather.feelslike_f)}°
                  </span>
                </div>
                <div className="detail-item brutal-box">
                  <span className="detail-icon">💧</span>
                  <span className="detail-label">Humidity</span>
                  <span className="detail-value">{weather.humidity}%</span>
                </div>
                <div className="detail-item brutal-box">
                  <span className="detail-icon">🌪️</span>
                  <span className="detail-label">Wind</span>
                  <span className="detail-value">
                    {Math.round(weather.wind_kph)} km/h {getWindDirection(weather.wind_degree)}
                  </span>
                </div>
                <div className="detail-item brutal-box">
                  <span className="detail-icon">☀️</span>
                  <span className="detail-label">UV Index</span>
                  <span className="detail-value">{weather.uv}</span>
                </div>
              </div>
            </div>

            {forecast && (
              <div className="forecast brutal-box">
                <div className="forecast-scroll">
                  {forecast.forecastday.map((day, index) => (
                    <div
                      key={day.date}
                      className={`forecast-card brutal-box ${selectedDay === index ? 'selected' : ''}`}
                      onClick={() => setSelectedDay(selectedDay === index ? null : index)}
                    >
                      <div className="forecast-header">
                        <span className="forecast-day">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                        <img src={day.day.condition.icon} alt={day.day.condition.text} />
                      </div>
                      
                      <div className="forecast-temps">
                        <span className="max-temp">
                          {unit === 'celsius' ? Math.round(day.day.maxtemp_c) : Math.round(day.day.maxtemp_f)}°
                        </span>
                        <span className="min-temp">
                          {unit === 'celsius' ? Math.round(day.day.mintemp_c) : Math.round(day.day.mintemp_f)}°
                        </span>
                      </div>
                      
                      {selectedDay === index && (
                        <div className="forecast-details animate-in">
                          <div className="detail-row">
                            <span>🌧️ Precipitation</span>
                            <span>{day.day.daily_chance_of_rain}%</span>
                          </div>
                          <div className="detail-row">
                            <span>💧 Humidity</span>
                            <span>{day.day.avghumidity}%</span>
                          </div>
                          <div className="detail-row">
                            <span>🌪️ Wind</span>
                            <span>{Math.round(day.day.maxwind_kph)} km/h</span>
                          </div>
                          <div className="detail-row">
                            <span>☀️ UV Index</span>
                            <span>{day.day.uv}</span>
                          </div>
                          <div className="detail-row">
                            <span>👁️ Visibility</span>
                            <span>{day.day.avgvis_km} km</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
