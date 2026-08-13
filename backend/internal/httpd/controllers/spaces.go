package controllers

import (
	"context"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/aoagents/agent-orchestrator/backend/internal/httpd/apispec"
	"github.com/aoagents/agent-orchestrator/backend/internal/httpd/envelope"
	"github.com/aoagents/agent-orchestrator/backend/internal/storage/sqlite/gen"
)

type SpacesService interface {
	CreateSpace(ctx context.Context, arg gen.CreateSpaceParams) (gen.Space, error)
	GetSpace(ctx context.Context, id string) (gen.Space, error)
	ListSpaces(ctx context.Context) ([]gen.Space, error)
}

type SpacesController struct {
	Svc SpacesService
}

func (c *SpacesController) Register(r chi.Router) {
	r.Get("/spaces", c.list)
	r.Post("/spaces", c.add)
	r.Get("/spaces/{id}", c.get)
}

func (c *SpacesController) list(w http.ResponseWriter, r *http.Request) {
	if c.Svc == nil {
		apispec.NotImplemented(w, r, "GET", "/api/v1/spaces")
		return
	}
	spaces, err := c.Svc.ListSpaces(r.Context())
	if err != nil {
		envelope.WriteError(w, r, err)
		return
	}
	envelope.WriteJSON(w, http.StatusOK, map[string]any{"spaces": spaces})
}

func (c *SpacesController) add(w http.ResponseWriter, r *http.Request) {
	if c.Svc == nil {
		apispec.NotImplemented(w, r, "POST", "/api/v1/spaces")
		return
	}
	
	var in struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	}
	if err := decodeJSONStrict(r, &in); err != nil {
		envelope.WriteAPIError(w, r, http.StatusBadRequest, "bad_request", "INVALID_JSON", "Invalid JSON body", nil)
		return
	}

	space, err := c.Svc.CreateSpace(r.Context(), gen.CreateSpaceParams{
		ID:        in.ID,
		Name:      in.Name,
		CreatedAt: time.Now().UTC(),
	})
	if err != nil {
		envelope.WriteError(w, r, err)
		return
	}
	envelope.WriteJSON(w, http.StatusCreated, map[string]any{"space": space})
}

func (c *SpacesController) get(w http.ResponseWriter, r *http.Request) {
	if c.Svc == nil {
		apispec.NotImplemented(w, r, "GET", "/api/v1/spaces/{id}")
		return
	}
	id := chi.URLParam(r, "id")
	space, err := c.Svc.GetSpace(r.Context(), id)
	if err != nil {
		envelope.WriteError(w, r, err)
		return
	}
	envelope.WriteJSON(w, http.StatusOK, map[string]any{"space": space})
}
