-- Chess Game Review App — Database Schema
-- Run this against your Neon/Vercel Postgres database to initialize.

CREATE TABLE IF NOT EXISTS games (
  id              SERIAL PRIMARY KEY,
  username        TEXT NOT NULL,
  chess_com_url   TEXT NOT NULL,
  chess_com_uuid  TEXT NOT NULL UNIQUE,
  lichess_id      TEXT NOT NULL,
  lichess_url     TEXT NOT NULL,
  embed_url       TEXT NOT NULL,
  pgn             TEXT NOT NULL,
  time_control    TEXT NOT NULL,
  time_class      TEXT NOT NULL,
  end_time        INTEGER NOT NULL,
  white_username  TEXT NOT NULL,
  white_rating    INTEGER NOT NULL,
  white_result    TEXT NOT NULL,
  black_username  TEXT NOT NULL,
  black_rating    INTEGER NOT NULL,
  black_result    TEXT NOT NULL,
  synced_at       BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_games_username ON games(username);
CREATE INDEX IF NOT EXISTS idx_games_chess_com_uuid ON games(chess_com_uuid);
CREATE INDEX IF NOT EXISTS idx_games_end_time ON games(end_time DESC);
