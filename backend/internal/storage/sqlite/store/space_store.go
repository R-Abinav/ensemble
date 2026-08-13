package store

import (
	"context"

	"github.com/aoagents/agent-orchestrator/backend/internal/storage/sqlite/gen"
)

func (s *Store) CreateSpace(ctx context.Context, arg gen.CreateSpaceParams) (gen.Space, error) {
	var result gen.Space
	err := s.inTx(ctx, "CreateSpace", func(q *gen.Queries) error {
		space, err := q.CreateSpace(ctx, arg)
		if err != nil {
			return err
		}
		result = space
		return nil
	})
	return result, err
}

func (s *Store) GetSpace(ctx context.Context, id string) (gen.Space, error) {
	return s.qr.GetSpace(ctx, id)
}

func (s *Store) ListSpaces(ctx context.Context) ([]gen.Space, error) {
	return s.qr.ListSpaces(ctx)
}
