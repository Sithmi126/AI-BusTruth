import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Bus,
  CheckCircle2,
  Clock3,
  Compass,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  RefreshCw,
  Route,
  Search,
  ShieldCheck,
  User,
  UserRound,
  X,
} from "lucide-react";
import "./App.css";

const API_URL = "http://localhost:5000/api";

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("bustruth_user") || "null");
  } catch {
    return null;
  }
};

function App() {
  const [token, setToken] = useState(
    () => localStorage.getItem("bustruth_token") || ""
  );
  const [user, setUser] = useState(readStoredUser);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [routes, setRoutes] = useState([]);
  const [routesLoading, setRoutesLoading] = useState(false);
  const [routesError, setRoutesError] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoute, setSelectedRoute] = useState(null);

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [plannerStart, setPlannerStart] = useState("");
  const [plannerEnd, setPlannerEnd] = useState("");
  const [plannerSearched, setPlannerSearched] = useState(false);

  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportForm, setReportForm] = useState({
    routeId: "",
    routeNumber: "",
    location: "",
    reportType: "CROWDING",
    crowdLevel: "MEDIUM",
    delayMinutes: "",
    description: "",
  });

  const [notice, setNotice] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");
  const [notificationActionId, setNotificationActionId] = useState("");

  const authenticatedFetch = useCallback(
    async (url, options = {}) => {
      const headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      };

      return fetch(url, { ...options, headers });
    },
    [token]
  );

  const fetchRoutes = useCallback(async () => {
    setRoutesLoading(true);
    setRoutesError("");

    try {
      const response = await fetch(`${API_URL}/routes`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not load bus routes.");
      }

      setRoutes(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      setRoutesError(
        error.message ||
          "Cannot connect to the server. Check whether the backend is running."
      );
    } finally {
      setRoutesLoading(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    if (!token || user?.role !== "ADMIN") {
      setAnalytics(null);
      setAnalyticsError("");
      setAnalyticsLoading(false);
      return;
    }
    setAnalyticsLoading(true);
    setAnalyticsError("");
    try {
      const response = await authenticatedFetch(`${API_URL}/dashboard/analytics`);
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not load dashboard analytics.");
      }
      setAnalytics(result.analytics || {});
    } catch (error) {
      setAnalyticsError(error.message || "Failed to load dashboard analytics.");
    } finally {
      setAnalyticsLoading(false);
    }
  }, [token, user?.role, authenticatedFetch]);

  const fetchProfile = useCallback(async () => {
    if (!token) return;

    setProfileLoading(true);
    setProfileError("");

    try {
      const response = await authenticatedFetch(`${API_URL}/auth/me`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not load your profile.");
      }

      const profile = result.user || result.data;

      if (profile) {
        setUser(profile);
        localStorage.setItem("bustruth_user", JSON.stringify(profile));
      }
    } catch (error) {
      setProfileError(error.message || "Could not load your profile.");

      if (error.message?.toLowerCase().includes("token")) {
        handleLogout();
      }
    } finally {
      setProfileLoading(false);
    }
  }, [token, authenticatedFetch]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token, fetchProfile]);

  useEffect(() => {
    if (token && user?.role === "ADMIN" && activePage === "Dashboard") fetchAnalytics();
  }, [token, user?.role, activePage, fetchAnalytics]);

  const fetchReports = useCallback(async () => {
    if (!token) return;
    setReportsLoading(true);
    setReportsError("");
    try {
      const response = await authenticatedFetch(`${API_URL}/reports`);
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not load your reports.");
      }
      setReports(Array.isArray(result.reports) ? result.reports : Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      setReportsError(error.message || "Could not load your reports.");
    } finally {
      setReportsLoading(false);
    }
  }, [token, authenticatedFetch]);

  useEffect(() => {
    if (token && activePage === "My Reports") fetchReports();
  }, [token, activePage, fetchReports]);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setNotificationsLoading(true);
    setNotificationsError("");
    try {
      const response = await authenticatedFetch(`${API_URL}/notifications`);
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not load notifications.");
      }
      setNotifications(Array.isArray(result.notifications) ? result.notifications : Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      setNotificationsError(error.message || "Could not load notifications.");
    } finally {
      setNotificationsLoading(false);
    }
  }, [token, authenticatedFetch]);

  useEffect(() => {
    if (token && activePage === "Notifications") fetchNotifications();
  }, [token, activePage, fetchNotifications]);

  const markNotificationRead = async (id) => {
    setNotificationActionId(id);
    setNotificationsError("");
    try {
      const response = await authenticatedFetch(`${API_URL}/notifications/${id}/read`, { method: "PATCH" });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Could not mark notification as read.");
      setNotifications((items) => items.map((item) => item._id === id ? { ...item, isRead: true } : item));
    } catch (error) {
      setNotificationsError(error.message || "Could not update notification.");
    } finally {
      setNotificationActionId("");
    }
  };

  const markAllNotificationsRead = async () => {
    setNotificationActionId("all");
    setNotificationsError("");
    try {
      const response = await authenticatedFetch(`${API_URL}/notifications/read-all`, { method: "PATCH" });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Could not mark notifications as read.");
      setNotifications((items) => items.map((item) => ({ ...item, isRead: true })));
    } catch (error) {
      setNotificationsError(error.message || "Could not update notifications.");
    } finally {
      setNotificationActionId("");
    }
  };

  const deleteNotification = async (id) => {
    setNotificationActionId(id);
    setNotificationsError("");
    try {
      const response = await authenticatedFetch(`${API_URL}/notifications/${id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Could not delete notification.");
      setNotifications((items) => items.filter((item) => item._id !== id));
    } catch (error) {
      setNotificationsError(error.message || "Could not delete notification.");
    } finally {
      setNotificationActionId("");
    }
  };

  const handleReportSubmit = async (event) => {
    event.preventDefault();
    setReportsError("");
    setNotice("");
    setReportSubmitting(true);
    try {
      const payload = {
        routeId: reportForm.routeId || undefined,
        routeNumber: reportForm.routeNumber.trim(),
        location: reportForm.location.trim(),
        reportType: reportForm.reportType,
        crowdLevel: reportForm.reportType === "CROWDING" ? reportForm.crowdLevel : "",
        delayMinutes: reportForm.reportType === "DELAY" ? reportForm.delayMinutes : "",
        description: reportForm.description.trim(),
      };
      const response = await authenticatedFetch(`${API_URL}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not submit report.");
      }
      setReportForm({ routeId: "", routeNumber: "", location: "", reportType: "CROWDING", crowdLevel: "MEDIUM", delayMinutes: "", description: "" });
      setNotice("Report submitted successfully and saved to the database.");
      await fetchReports();
    } catch (error) {
      setReportsError(error.message || "Could not submit report.");
    } finally {
      setReportSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("bustruth_token");
    localStorage.removeItem("bustruth_user");
    setToken("");
    setUser(null);
    setActivePage("Dashboard");
    setSelectedRoute(null);
    setAuthForm({ fullName: "", email: "", password: "" });
    setAuthError("");
    setNotice("");
  };

  const handleAuthChange = (event) => {
    const { name, value } = event.target;
    setAuthForm((previous) => ({ ...previous, [name]: value }));
    setAuthError("");
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthError("");
    setNotice("");

    if (authForm.password.length < 8) {
      setAuthError("Password must contain at least 8 characters.");
      return;
    }

    setAuthLoading(true);

    try {
      const endpoint =
        authMode === "login" ? "/auth/login" : "/auth/register";

      const payload =
        authMode === "login"
          ? {
              email: authForm.email.trim(),
              password: authForm.password,
            }
          : {
              fullName: authForm.fullName.trim(),
              email: authForm.email.trim(),
              password: authForm.password,
            };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Authentication failed.");
      }

      if (authMode === "register") {
        setNotice("Account created successfully. Please sign in.");
        setAuthMode("login");
        setAuthForm((previous) => ({
          ...previous,
          fullName: "",
          password: "",
        }));
        return;
      }

      if (!result.token) {
        throw new Error("Login succeeded but no authentication token was returned.");
      }

      localStorage.setItem("bustruth_token", result.token);
      localStorage.setItem("bustruth_user", JSON.stringify(result.user));
      setToken(result.token);
      setUser(result.user);
      setActivePage("Dashboard");
      setAuthForm({ fullName: "", email: "", password: "" });
      setNotice("");
    } catch (error) {
      setAuthError(
        error.message ||
          "Cannot connect to the backend. Check that the server is running."
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const filteredRoutes = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return routes;

    return routes.filter((item) => {
      const searchableValues = [
        item.routeNumber,
        item.routeName,
        item.startLocation,
        item.endLocation,
        item.operator,
        ...(Array.isArray(item.stops) ? item.stops : []),
      ];

      return searchableValues.some((value) =>
        String(value || "").toLowerCase().includes(query)
      );
    });
  }, [routes, searchTerm]);

  const plannerMatches = useMemo(() => {
    const start = plannerStart.trim().toLowerCase();
    const end = plannerEnd.trim().toLowerCase();

    if (!start || !end) return [];

    return routes.filter((item) => {
      const stops = Array.isArray(item.stops) ? item.stops : [];
      const locations = [
        item.startLocation,
        ...stops,
        item.endLocation,
      ].map((value) => String(value || "").toLowerCase());

      const startIndex = locations.indexOf(start);
      const endIndex = locations.indexOf(end);

      return startIndex !== -1 && endIndex !== -1 && startIndex < endIndex;
    });
  }, [routes, plannerStart, plannerEnd]);

  const navigateTo = (page) => {
    setActivePage(page);
    setSidebarOpen(false);
    setSelectedRoute(null);
    setNotice("");
  };

  const role = user?.role || "PASSENGER";
  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, roles: ["PASSENGER", "BUS_REPORTER", "TRANSPORT_OPERATOR", "ADMIN"] },
    { label: "Bus Routes", icon: Bus, roles: ["PASSENGER", "BUS_REPORTER", "TRANSPORT_OPERATOR", "ADMIN"] },
    { label: "Journey Planner", icon: Compass, roles: ["PASSENGER"] },
    { label: "My Reports", icon: Activity, roles: ["PASSENGER", "BUS_REPORTER", "ADMIN"] },
    { label: "Notifications", icon: AlertCircle, roles: ["PASSENGER", "BUS_REPORTER", "TRANSPORT_OPERATOR", "ADMIN"] },
    { label: "My Profile", icon: UserRound, roles: ["PASSENGER", "BUS_REPORTER", "TRANSPORT_OPERATOR", "ADMIN"] },
  ].filter((item) => item.roles.includes(role));

  if (!token || !user) {
    return (
      <div className="auth-page">
        <div className="auth-decoration auth-decoration-one" />
        <div className="auth-decoration auth-decoration-two" />

        <section className="auth-brand-panel">
          <div className="brand-mark">
            <Bus size={30} />
          </div>

          <p className="eyebrow">SMART PUBLIC TRANSPORT</p>
          <h1>
            Travel smarter.
            <br />
            Know your journey.
          </h1>

          <p className="auth-description">
            AI BusTruth helps passengers explore bus routes and access
            transport information in one place.
          </p>

          <div className="auth-feature-list">
            <div>
              <Route size={19} />
              <span>Explore available bus routes</span>
            </div>
            <div>
              <MapPin size={19} />
              <span>Find routes for your journey</span>
            </div>
            <div>
              <ShieldCheck size={19} />
              <span>Your account, your information</span>
            </div>
          </div>

          <p className="auth-footer">AI BusTruth · Public Transport Platform</p>
        </section>

        <section className="auth-form-panel">
          <div className="auth-form-wrap">
            <div className="mobile-brand">
              <Bus size={25} />
              <span>AI BusTruth</span>
            </div>

            <p className="eyebrow">
              {authMode === "login" ? "WELCOME BACK" : "GET STARTED"}
            </p>

            <h2>
              {authMode === "login" ? "Sign in to your account" : "Create your account"}
            </h2>

            <p className="auth-form-subtitle">
              {authMode === "login"
                ? "Enter your details to continue."
                : "Create an account to start using AI BusTruth."}
            </p>

            {notice && (
              <div className="success-message">
                <CheckCircle2 size={18} />
                <span>{notice}</span>
              </div>
            )}

            {authError && (
              <div className="error-message" role="alert">
                <AlertCircle size={18} />
                <span>{authError}</span>
              </div>
            )}

            <form className="auth-form" onSubmit={handleAuthSubmit}>
              {authMode === "register" && (
                <label className="form-field">
                  <span>Full name</span>
                  <input
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={authForm.fullName}
                    onChange={handleAuthChange}
                    autoComplete="name"
                    required
                  />
                </label>
              )}

              <label className="form-field">
                <span>Email address</span>
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={authForm.email}
                  onChange={handleAuthChange}
                  autoComplete="email"
                  required
                />
              </label>

              <label className="form-field">
                <span>Password</span>
                <div className="password-input-wrap">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={authForm.password}
                    onChange={handleAuthChange}
                    autoComplete={
                      authMode === "login" ? "current-password" : "new-password"
                    }
                    minLength={8}
                    required
                  />
                  <button
                    className="password-toggle"
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>

              <button
                className="primary-button auth-submit"
                type="submit"
                disabled={authLoading}
              >
                {authLoading
                  ? "Please wait..."
                  : authMode === "login"
                    ? "Sign in"
                    : "Create account"}
                {!authLoading && <ArrowRight size={18} />}
              </button>
            </form>

            <p className="auth-switch">
              {authMode === "login"
                ? "Don't have an account?"
                : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === "login" ? "register" : "login");
                  setAuthError("");
                  setNotice("");
                  setShowPassword(false);
                }}
              >
                {authMode === "login" ? "Create account" : "Sign in"}
              </button>
            </p>

            <p className="auth-security-note">
              <ShieldCheck size={15} />
              Secure account authentication
            </p>
          </div>
        </section>
      </div>
    );
  }

  const displayName = user.fullName || user.name || user.email || "Passenger";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const activeRoutes = routes.filter(
    (item) => !item.status || item.status === "ACTIVE"
  );

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-mark brand-mark-small">
            <Bus size={23} />
          </div>
          <div>
            <strong>AI BusTruth</strong>
            <span>SMART TRANSPORT</span>
          </div>
          <button
            className="sidebar-close mobile-only"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <p className="sidebar-section-label">WORKSPACE</p>

        <nav className="sidebar-nav">
          {menuItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${activePage === label ? "nav-item-active" : ""}`}
              onClick={() => navigateTo(label)}
            >
              <Icon size={19} />
              <span>{label}</span>
              {activePage === label && <span className="nav-active-dot" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help-card">
            <div className="help-icon">
              <ShieldCheck size={20} />
            </div>
            <strong>Travel informed</strong>
            <p>Check available route information before you travel.</p>
          </div>

          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <div>
              <p className="topbar-overline">AI Bustruth / Workspace</p>
              <h2>{activePage}</h2>
            </div>
          </div>

          <button
            className="topbar-profile"
            onClick={() => navigateTo("My Profile")}
          >
            <span className="avatar">{initials || <User size={18} />}</span>
            <span className="topbar-user-info">
              <strong>{displayName}</strong>
              <small>{user.role || "PASSENGER"}</small>
            </span>
          </button>
        </header>

        <div className="page-content">
          {activePage === "Dashboard" && (
            <DashboardPage
              user={user}
              routes={activeRoutes}
              loading={routesLoading}
              onNavigate={navigateTo}
              onRefresh={fetchRoutes}
              analytics={analytics}
              analyticsLoading={analyticsLoading}
              analyticsError={analyticsError}
              onRefreshAnalytics={fetchAnalytics}
            />
          )}

          {activePage === "Bus Routes" && (
            <section className="content-section">
              <div className="page-heading-row">
                <div>
                  <p className="eyebrow">TRANSPORT DIRECTORY</p>
                  <h1>Bus Routes</h1>
                  <p className="page-description">
                    Search the routes currently stored in the database.
                  </p>
                </div>
                <button
                  className="secondary-button"
                  onClick={fetchRoutes}
                  disabled={routesLoading}
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>

              <div className="route-stats-grid">
                <StatCard
                  icon={Bus}
                  label="Routes loaded"
                  value={routes.length}
                />
                <StatCard
                  icon={CheckCircle2}
                  label="Active routes"
                  value={activeRoutes.length}
                />
                <StatCard
                  icon={Search}
                  label="Search results"
                  value={filteredRoutes.length}
                />
              </div>

              <div className="route-search-bar">
                <Search size={19} />
                <input
                  type="search"
                  placeholder="Search route number, location, stop or operator..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    aria-label="Clear search"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {routesError && (
                <ErrorPanel message={routesError} onRetry={fetchRoutes} />
              )}

              {routesLoading ? (
                <LoadingPanel message="Loading routes from the database..." />
              ) : routesError ? null : filteredRoutes.length === 0 ? (
                <EmptyPanel
                  icon={Bus}
                  title={
                    routes.length === 0
                      ? "No bus routes available yet"
                      : "No matching routes found"
                  }
                  description={
                    routes.length === 0
                      ? "The API is connected, but there are no route records in the database yet. Add verified route data to see it here."
                      : "Try a different route number, stop or location."
                  }
                  actionLabel={searchTerm ? "Clear search" : undefined}
                  onAction={searchTerm ? () => setSearchTerm("") : undefined}
                />
              ) : (
                <div className="route-list">
                  {filteredRoutes.map((item) => (
                    <RouteCard
                      key={item._id}
                      route={item}
                      onClick={() => setSelectedRoute(item)}
                    />
                  ))}
                </div>
              )}

              {selectedRoute && (
                <div
                  className="modal-backdrop"
                  onClick={() => setSelectedRoute(null)}
                  role="presentation"
                >
                  <section
                    className="route-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="route-modal-title"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="modal-header">
                      <div className="route-number-badge">
                        {selectedRoute.routeNumber}
                      </div>
                      <button
                        className="icon-button"
                        onClick={() => setSelectedRoute(null)}
                        aria-label="Close route details"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <p className="eyebrow">ROUTE DETAILS</p>
                    <h2 id="route-modal-title">{selectedRoute.routeName}</h2>

                    <div className="modal-route-endpoints">
                      <MapPin size={19} />
                      <div>
                        <strong>{selectedRoute.startLocation}</strong>
                        <span>to</span>
                        <strong>{selectedRoute.endLocation}</strong>
                      </div>
                    </div>

                    <div className="modal-detail-grid">
                      <DetailItem
                        label="Distance"
                        value={
                          selectedRoute.distanceKm != null
                            ? `${selectedRoute.distanceKm} km`
                            : "Not provided"
                        }
                      />
                      <DetailItem
                        label="Estimated duration"
                        value={
                          selectedRoute.estimatedDurationMinutes != null
                            ? `${selectedRoute.estimatedDurationMinutes} minutes`
                            : "Not provided"
                        }
                      />
                      <DetailItem
                        label="Operator"
                        value={selectedRoute.operator || "Not provided"}
                      />
                      <DetailItem
                        label="Status"
                        value={selectedRoute.status || "ACTIVE"}
                      />
                    </div>

                    <h3 className="stops-heading">Route stops</h3>
                    {selectedRoute.stops?.length ? (
                      <ol className="stop-list">
                        {selectedRoute.stops.map((stop, index) => (
                          <li key={`${stop}-${index}`}>{stop}</li>
                        ))}
                      </ol>
                    ) : (
                      <p className="muted-text">
                        No stop information has been added for this route.
                      </p>
                    )}

                    <p className="data-disclaimer">
                      Route details reflect database records. They do not
                      confirm current bus location, departure time or service
                      availability.
                    </p>
                  </section>
                </div>
              )}
            </section>
          )}

          {activePage === "Journey Planner" && (
            <section className="content-section">
              <PageHeading
                eyebrow="PLAN YOUR TRIP"
                title="Journey Planner"
                description="Find routes matching your starting point and destination from the routes currently stored in the database."
              />

              <form
                className="planner-card"
                onSubmit={(event) => {
                  event.preventDefault();
                  setPlannerSearched(true);
                }}
              >
                <div className="planner-title">
                  <div className="section-icon">
                    <Compass size={21} />
                  </div>
                  <div>
                    <h2>Where would you like to go?</h2>
                    <p>Enter locations that match the saved route data.</p>
                  </div>
                </div>

                <div className="planner-fields">
                  <label className="form-field">
                    <span>Starting location</span>
                    <input
                      value={plannerStart}
                      onChange={(event) => setPlannerStart(event.target.value)}
                      placeholder="e.g. Colombo"
                      required
                    />
                  </label>
                  <label className="form-field">
                    <span>Destination</span>
                    <input
                      value={plannerEnd}
                      onChange={(event) => setPlannerEnd(event.target.value)}
                      placeholder="e.g. Kandy"
                      required
                    />
                  </label>
                </div>

                <button className="primary-button" type="submit">
                  <Search size={17} />
                  Find matching routes
                </button>
              </form>

              {plannerSearched && (
                <div className="planner-results">
                  <h2>Matching routes</h2>
                  {routesLoading ? (
                    <LoadingPanel message="Loading routes..." />
                  ) : plannerStart.trim().toLowerCase() ===
                    plannerEnd.trim().toLowerCase() ? (
                    <EmptyPanel
                      icon={MapPin}
                      title="Choose two different locations"
                      description="Your starting point and destination should be different."
                    />
                  ) : plannerMatches.length ? (
                    <div className="route-list">
                      {plannerMatches.map((item) => (
                        <RouteCard
                          key={item._id}
                          route={item}
                          onClick={() => {
                            setSelectedRoute(item);
                            setActivePage("Bus Routes");
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyPanel
                      icon={Compass}
                      title="No matching route found"
                      description="There is no saved route with these locations in the requested order. This search does not yet include transfers or live journey data."
                    />
                  )}
                </div>
              )}

              <p className="data-disclaimer">
                Planner results use saved route records only. They do not
                guarantee that a bus is operating now or that a transfer is
                available.
              </p>
            </section>
          )}

          {activePage === "My Reports" && (
            <section className="content-section">
              <PageHeading
                eyebrow="COMMUNITY REPORTS"
                title="My Reports"
                description="Report bus crowding, delays, accessibility concerns, or service issues. Your reports are saved to your account."
              />

              {notice && <div className="success-message" role="status"><CheckCircle2 size={18} /><span>{notice}</span></div>}
              {reportsError && <div className="error-message" role="alert"><AlertCircle size={18} /><span>{reportsError}</span></div>}

              <section className="panel report-form-panel">
                <div className="panel-heading"><div><p className="eyebrow">SHARE AN UPDATE</p><h3>Submit a bus report</h3></div></div>
                <form className="report-form" onSubmit={handleReportSubmit}>
                  <div className="form-grid">
                    <label className="form-field"><span>Report type</span>
                      <select value={reportForm.reportType} onChange={(e) => setReportForm((v) => ({ ...v, reportType: e.target.value }))}>
                        <option value="CROWDING">Bus crowding</option><option value="DELAY">Bus delay</option><option value="ACCESSIBILITY">Accessibility</option><option value="SERVICE_ISSUE">Service issue</option><option value="OTHER">Other</option>
                      </select>
                    </label>
                    <label className="form-field"><span>Bus route (optional)</span>
                      <select value={reportForm.routeId} onChange={(e) => { const chosen = routes.find((r) => r._id === e.target.value); setReportForm((v) => ({ ...v, routeId: e.target.value, routeNumber: chosen?.routeNumber || "" })); }}>
                        <option value="">Select a saved route</option>{routes.map((r) => <option key={r._id} value={r._id}>{r.routeNumber} — {r.routeName}</option>)}
                      </select>
                    </label>
                    <label className="form-field"><span>Location</span><input value={reportForm.location} onChange={(e) => setReportForm((v) => ({ ...v, location: e.target.value }))} placeholder="e.g. Colombo Fort bus stand" maxLength={120} required /></label>
                    {reportForm.reportType === "CROWDING" && <label className="form-field"><span>Crowd level</span><select value={reportForm.crowdLevel} onChange={(e) => setReportForm((v) => ({ ...v, crowdLevel: e.target.value }))}><option value="LOW">Low</option><option value="MEDIUM">Moderate</option><option value="HIGH">High</option></select></label>}
                    {reportForm.reportType === "DELAY" && <label className="form-field"><span>Delay (minutes)</span><input type="number" min="0" max="600" value={reportForm.delayMinutes} onChange={(e) => setReportForm((v) => ({ ...v, delayMinutes: e.target.value }))} placeholder="e.g. 15" /></label>}
                    <label className="form-field form-field-wide"><span>Description</span><textarea value={reportForm.description} onChange={(e) => setReportForm((v) => ({ ...v, description: e.target.value }))} placeholder="Describe what you observed..." maxLength={1000} rows={4} required /></label>
                  </div>
                  <button className="submit-button report-submit" style={{ display: "flex", width: "100%", minHeight: "52px", justifyContent: "center", alignItems: "center", gap: "10px", marginTop: "20px", visibility: "visible", opacity: 1 }} type="submit" disabled={reportSubmitting}>{reportSubmitting ? "Submitting report..." : "Submit Report"}<ArrowRight size={18} /></button>
                </form>
              </section>

              <div className="section-subheading"><div><p className="eyebrow">YOUR ACTIVITY</p><h3>Previously submitted reports</h3></div><button className="secondary-button" type="button" onClick={fetchReports} disabled={reportsLoading}><RefreshCw size={16} /> Refresh</button></div>
              {reportsLoading ? <div className="loading-panel"><RefreshCw className="spin" size={22} /><span>Loading your reports...</span></div> : reports.length ? <div className="report-list">{reports.map((report) => <article className="panel report-card" key={report._id}><div className="report-card-top"><div><span className="status-pill">{String(report.status || "SUBMITTED").replaceAll("_", " ")}</span><h3>{String(report.reportType || "OTHER").replaceAll("_", " ")}</h3></div><span className="report-date">{report.createdAt ? new Date(report.createdAt).toLocaleString() : "Date unavailable"}</span></div><p className="report-location"><MapPin size={16} /> {report.location}{report.routeNumber ? ` · Route ${report.routeNumber}` : report.route?.routeNumber ? ` · Route ${report.route.routeNumber}` : ""}</p><p className="report-description">{report.description}</p>{report.crowdLevel && <p className="report-meta">Crowd level: {String(report.crowdLevel).replaceAll("_", " ")}</p>}{report.delayMinutes !== null && report.delayMinutes !== undefined && <p className="report-meta">Reported delay: {report.delayMinutes} minutes</p>}</article>)}</div> : <EmptyPanel icon={Activity} title="No reports submitted yet" description="Use the form above to submit your first bus travel report. Your saved reports will appear here." />}
            </section>
          )}

          {activePage === "Notifications" && (
            <section className="content-section">
              <PageHeading eyebrow="UPDATES" title="Notifications" description="Updates related to your account and transport services." />
              <div className="route-stats-grid">
                <StatCard icon={AlertCircle} label="Total notifications" value={notifications.length} />
                <StatCard icon={Clock3} label="Unread" value={notifications.filter((item) => !item.isRead).length} />
                <StatCard icon={CheckCircle2} label="Read" value={notifications.filter((item) => item.isRead).length} />
              </div>
              <div className="section-subheading">
                <div><p className="eyebrow">YOUR UPDATES</p><h3>Recent notifications</h3></div>
                <div style={{display:"flex", gap:"8px", flexWrap:"wrap"}}>
                  <button className="secondary-button" type="button" onClick={fetchNotifications} disabled={notificationsLoading}><RefreshCw size={16} /> Refresh</button>
                  <button className="secondary-button" type="button" onClick={markAllNotificationsRead} disabled={notificationsLoading || notificationActionId === "all" || !notifications.some((item) => !item.isRead)}>{notificationActionId === "all" ? "Updating..." : "Mark all as read"}</button>
                </div>
              </div>
              {notificationsError && <ErrorPanel message={notificationsError} onRetry={fetchNotifications} />}
              {notificationsLoading ? <LoadingPanel message="Loading notifications..." /> : notifications.length ? (
                <div className="report-list">{notifications.map((item) => (
                  <article className="panel report-card" key={item._id} style={{opacity:item.isRead ? 0.8 : 1}}>
                    <div className="report-card-top"><div><span className="status-pill">{item.isRead ? "READ" : "UNREAD"}</span><h3>{item.title || "BusTruth update"}</h3></div><span className="report-date">{item.createdAt ? new Date(item.createdAt).toLocaleString() : "Date unavailable"}</span></div>
                    <p className="report-description">{item.message || "You have a new update."}</p>
                    {item.type && <p className="report-meta">Type: {String(item.type).replaceAll("_", " ")}</p>}
                    <div style={{display:"flex", gap:"8px", flexWrap:"wrap", marginTop:"12px"}}>
                      {!item.isRead && <button className="secondary-button" type="button" onClick={() => markNotificationRead(item._id)} disabled={notificationActionId === item._id}>{notificationActionId === item._id ? "Updating..." : "Mark as read"}</button>}
                      <button className="secondary-button" type="button" onClick={() => deleteNotification(item._id)} disabled={notificationActionId === item._id}>Delete</button>
                    </div>
                  </article>
                ))}</div>
              ) : !notificationsError ? <EmptyPanel icon={AlertCircle} title="No notifications yet" description="When updates are sent to your account, they will appear here." /> : null}
            </section>
          )}

          {activePage === "My Profile" && (
            <section className="content-section">
              <PageHeading
                eyebrow="ACCOUNT SETTINGS"
                title="My Profile"
                description="Your account information retrieved from AI BusTruth."
              />

              {profileError && (
                <ErrorPanel
                  message={profileError}
                  onRetry={fetchProfile}
                />
              )}

              <div className="profile-card">
                <div className="profile-card-header">
                  <div className="profile-avatar-large">
                    {initials || <User size={30} />}
                  </div>
                  <div>
                    <h2>{displayName}</h2>
                    <p>{user.role || "PASSENGER"}</p>
                  </div>
                  <span className="status-pill">
                    <span />
                    Signed in
                  </span>
                </div>

                <div className="profile-details">
                  <DetailItem
                    label="Full name"
                    value={user.fullName || user.name || "Not provided"}
                  />
                  <DetailItem
                    label="Email address"
                    value={user.email || "Not provided"}
                  />
                  <DetailItem
                    label="Account role"
                    value={user.role || "PASSENGER"}
                  />
                  <DetailItem
                    label="Account ID"
                    value={user._id || user.id || "Not available"}
                  />
                </div>

                {profileLoading && (
                  <p className="muted-text">Refreshing profile...</p>
                )}

                <button
                  className="secondary-button profile-refresh"
                  onClick={fetchProfile}
                  disabled={profileLoading}
                >
                  <RefreshCw size={16} />
                  Refresh profile
                </button>
              </div>

              <div className="security-note-card">
                <ShieldCheck size={21} />
                <div>
                  <strong>Account security</strong>
                  <p>
                    Your session uses an authentication token. Never share
                    your password or token with anyone.
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>

        <footer className="app-footer">
          <span>AI BusTruth</span>
          <span>Public Transport Information Platform</span>
        </footer>
      </main>
    </div>
  );
}

function DashboardPage({
  user, routes, loading, onNavigate, onRefresh,
  analytics, analyticsLoading, analyticsError, onRefreshAnalytics,
}) {
  const name = user.fullName || user.name || "Passenger";
  const [hour, setHour] = useState(new Date().getHours());
  const [weekday, setWeekday] = useState((new Date().getDay() + 6) % 7);
  const [distance, setDistance] = useState("20");
  const [traffic, setTraffic] = useState("3");
  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [predictionError, setPredictionError] = useState("");

  const predictDelay = async (event) => {
    event.preventDefault();
    setPredicting(true);
    setPrediction(null);
    setPredictionError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hour: Number(hour),
          weekday: Number(weekday),
          distance_km: Number(distance),
          traffic_level: Number(traffic),
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.detail || result.message || "Prediction failed.");
      }
      setPrediction(result);
    } catch (error) {
      setPredictionError(
        error.message || "Cannot connect to the AI prediction server."
      );
    } finally {
      setPredicting(false);
    }
  };

  return (
    <section className="content-section">
      <div className="welcome-banner">
        <div className="welcome-content">
          <p className="eyebrow">YOUR TRANSPORT WORKSPACE</p>
          <h1>Hello, {name.split(" ")[0]} <span>👋</span></h1>
          <p>
            Explore saved bus routes and plan your next journey with AI BusTruth.
          </p>
          <button className="welcome-button" onClick={() => onNavigate("Bus Routes")}>
            Explore bus routes <ArrowRight size={17} />
          </button>
        </div>
        <div className="welcome-illustration">
          <div className="illustration-circle"><Bus size={72} strokeWidth={1.35} /></div>
          <div className="illustration-pin"><MapPin size={23} /></div>
        </div>
      </div>

      <div className="section-heading-row">
        <div><h2>Your overview</h2><p>Information currently available in the platform.</p></div>
        <button className="text-button" onClick={onRefresh} disabled={loading}>
          <RefreshCw size={15} /> Refresh data
        </button>
      </div>

      <div className="dashboard-stats">
        <StatCard icon={Bus} label="Saved bus routes" value={loading ? "..." : routes.length} detail="From the database" />
        <StatCard icon={Compass} label="Journey planner" value="Available" detail="Search saved routes" />
        <StatCard icon={ShieldCheck} label="Account status" value="Active" detail="Signed in successfully" />
      </div>

      <div className="section-heading-row" style={{ marginTop: 30 }}>
        <div><h2>Dashboard Analytics</h2><p>Statistics retrieved from MongoDB database records.</p></div>
        <button className="text-button" type="button" onClick={onRefreshAnalytics} disabled={analyticsLoading}>
          <RefreshCw size={15} /> {analyticsLoading ? "Refreshing..." : "Refresh analytics"}
        </button>
      </div>
      {analyticsError && <ErrorPanel message={analyticsError} onRetry={onRefreshAnalytics} />}
      <div className="dashboard-stats">
        <StatCard icon={Bus} label="Total routes" value={analyticsLoading ? "..." : (analytics?.totalRoutes ?? 0)} detail="Database records" />
        <StatCard icon={CheckCircle2} label="Active routes" value={analyticsLoading ? "..." : (analytics?.activeRoutes ?? 0)} detail="Currently active" />
        <StatCard icon={Activity} label="Total reports" value={analyticsLoading ? "..." : (analytics?.totalReports ?? 0)} detail="Passenger reports" />
        <StatCard icon={Clock3} label="Pending reports" value={analyticsLoading ? "..." : (analytics?.pendingReports ?? 0)} detail="Awaiting review" />
        <StatCard icon={CheckCircle2} label="Resolved reports" value={analyticsLoading ? "..." : (analytics?.resolvedReports ?? 0)} detail="Marked resolved" />
        <StatCard icon={AlertCircle} label="Crowding reports" value={analyticsLoading ? "..." : (analytics?.crowdingReports ?? 0)} detail="Passenger observations" />
        <StatCard icon={Clock3} label="Delay reports" value={analyticsLoading ? "..." : (analytics?.delayReports ?? 0)} detail="Reported delays" />
        <StatCard icon={ShieldCheck} label="Accessibility reports" value={analyticsLoading ? "..." : (analytics?.accessibilityReports ?? 0)} detail="Accessibility concerns" />
      </div>

      <div className="planner-card" style={{ marginTop: 24 }}>
        <div className="planner-title">
          <div className="section-icon"><Activity size={21} /></div>
          <div>
            <h2>AI Bus Delay Prediction</h2>
            <p>Estimate a possible delay using the trained machine-learning demo model.</p>
          </div>
        </div>

        <form onSubmit={predictDelay}>
          <div className="planner-fields">
            <label className="form-field">
              <span>Hour (0–23)</span>
              <input type="number" min="0" max="23" value={hour} onChange={(event) => setHour(event.target.value)} required />
            </label>
            <label className="form-field">
              <span>Weekday (Mon=0, Sun=6)</span>
              <input type="number" min="0" max="6" value={weekday} onChange={(event) => setWeekday(event.target.value)} required />
            </label>
            <label className="form-field">
              <span>Distance (km)</span>
              <input type="number" min="0.1" max="500" step="0.1" value={distance} onChange={(event) => setDistance(event.target.value)} required />
            </label>
            <label className="form-field">
              <span>Traffic (1 low – 4 high)</span>
              <select value={traffic} onChange={(event) => setTraffic(event.target.value)}>
                <option value="1">1 - Low</option>
                <option value="2">2 - Moderate</option>
                <option value="3">3 - Heavy</option>
                <option value="4">4 - Very heavy</option>
              </select>
            </label>
          </div>
          <button className="primary-button" type="submit" disabled={predicting}>
            <Activity size={17} /> {predicting ? "Predicting..." : "Predict bus delay"}
          </button>
        </form>

        {predictionError && (
          <div className="error-message" role="alert">
            <AlertCircle size={18} /><span>{predictionError}</span>
          </div>
        )}

        {prediction && (
          <div className="information-panel" style={{ marginTop: 20 }}>
            <div className="information-icon"><Clock3 size={22} /></div>
            <div>
              <h3>Estimated delay: {prediction.predicted_delay_minutes} minutes</h3>
              <p>Status: {prediction.status}</p>
              <p>{prediction.warning}</p>
            </div>
          </div>
        )}
        <p className="data-disclaimer">
          Demo prediction only. This model uses synthetic data and has not been validated against real Sri Lankan bus journey records.
        </p>
      </div>

      <div className="section-heading-row quick-access-heading">
        <div><h2>Quick access</h2><p>Go directly to a platform feature.</p></div>
      </div>
      <div className="quick-access-grid">
        <QuickAccessCard icon={Route} title="Bus Routes" description="Search saved route numbers, stops and destinations." onClick={() => onNavigate("Bus Routes")} />
        <QuickAccessCard icon={Compass} title="Journey Planner" description="Look for routes between two saved locations." onClick={() => onNavigate("Journey Planner")} />
        <QuickAccessCard icon={Activity} title="My Reports" description="Open your transport report workspace." onClick={() => onNavigate("My Reports")} />
        <QuickAccessCard icon={UserRound} title="My Profile" description="Review your account information." onClick={() => onNavigate("My Profile")} />
      </div>

    </section>
  );
}

function PageHeading({ eyebrow, title, description }) {
  return (
    <div className="page-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="page-description">{description}</p>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, detail }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-icon">
          <Icon size={20} />
        </span>
      </div>
      <p>{label}</p>
      <strong>{value}</strong>
      {detail && <small>{detail}</small>}
    </div>
  );
}

function QuickAccessCard({ icon: Icon, title, description, onClick }) {
  return (
    <button className="quick-access-card" onClick={onClick}>
      <span className="quick-access-icon">
        <Icon size={21} />
      </span>
      <strong>{title}</strong>
      <p>{description}</p>
      <span className="quick-access-arrow">
        Open <ArrowRight size={15} />
      </span>
    </button>
  );
}

function RouteCard({ route, onClick }) {
  return (
    <button className="route-card" onClick={onClick}>
      <div className="route-card-top">
        <span className="route-number-badge">
          {route.routeNumber || "Route"}
        </span>
        <span className="status-pill">
          <span />
          {route.status || "ACTIVE"}
        </span>
      </div>

      <h3>{route.routeName || "Unnamed route"}</h3>

      <div className="route-endpoints">
        <div className="route-endpoint">
          <span className="endpoint-dot endpoint-start" />
          <span>{route.startLocation || "Unknown start"}</span>
        </div>
        <div className="route-line" />
        <div className="route-endpoint">
          <span className="endpoint-dot endpoint-end" />
          <span>{route.endLocation || "Unknown destination"}</span>
        </div>
      </div>

      <div className="route-card-footer">
        <span>
          <MapPin size={15} />
          {route.stops?.length || 0} stops listed
        </span>
        <span className="route-card-open">
          View details <ArrowRight size={15} />
        </span>
      </div>
    </button>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="detail-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function EmptyPanel({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="empty-panel">
      <div className="empty-panel-icon">
        <Icon size={27} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel && onAction && (
        <button className="secondary-button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function LoadingPanel({ message }) {
  return (
    <div className="loading-panel">
      <RefreshCw size={22} className="loading-spinner" />
      <p>{message}</p>
    </div>
  );
}

function ErrorPanel({ message, onRetry }) {
  return (
    <div className="error-panel" role="alert">
      <AlertCircle size={20} />
      <div>
        <strong>Something went wrong</strong>
        <p>{message}</p>
      </div>
      {onRetry && (
        <button className="secondary-button" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export default App;