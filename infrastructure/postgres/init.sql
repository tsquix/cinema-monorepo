CREATE TABLE IF NOT EXISTS seat_reservations (
    id SERIAL PRIMARY KEY,
    showing_id VARCHAR(50) NOT NULL,
    seat_id VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'FREE',
    reservation_token VARCHAR(100),
    locked_until TIMESTAMP,
    version INT NOT NULL DEFAULT 1,
    UNIQUE(showing_id, seat_id)
);

INSERT INTO seat_reservations (showing_id, seat_id, status) VALUES
    ('matrix-20:00', 'A1', 'FREE'),
    ('matrix-20:00', 'A2', 'RESERVED'),
    ('matrix-20:00', 'A3', 'BOUGHT')
ON CONFLICT (showing_id, seat_id) DO NOTHING;