-- name: CreateSpace :one
INSERT INTO spaces (id, name, created_at)
VALUES (?, ?, ?)
RETURNING *;

-- name: GetSpace :one
SELECT * FROM spaces WHERE id = ?;

-- name: ListSpaces :many
SELECT * FROM spaces ORDER BY created_at DESC;
