package httpd

import (
	"net/http"
)

// lanCORSMiddleware grants cross-origin read access to any origin.
// Unlike the loopback listener (which relies on CORS as its only defense),
// the LAN listener is protected by a strong, rotated bearer password.
// This allows remote desktop apps (running on app:// or localhost) to connect
// without needing to pre-register their origins.
func lanCORSMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin == "" {
			next.ServeHTTP(w, r)
			return
		}
		
		w.Header().Add("Vary", "Origin")
		
		h := w.Header()
		h.Set("Access-Control-Allow-Origin", origin)

		if r.Method == http.MethodOptions && r.Header.Get("Access-Control-Request-Method") != "" {
			h.Set("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS")
			if reqHeaders := r.Header.Get("Access-Control-Request-Headers"); reqHeaders != "" {
				h.Set("Access-Control-Allow-Headers", reqHeaders)
			}
			h.Set("Access-Control-Max-Age", "600")
			if r.Header.Get("Access-Control-Request-Private-Network") == "true" {
				h.Set("Access-Control-Allow-Private-Network", "true")
			}
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}
