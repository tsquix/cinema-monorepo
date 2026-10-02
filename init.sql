CREATE TABLE IF NOT EXISTS seat_reservations (
    showing_id VARCHAR(50) NOT NULL,
    seat_id VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'FREE',
    reservation_token VARCHAR(100),
    locked_until TIMESTAMP,
    version INT NOT NULL DEFAULT 1,
    PRIMARY KEY (showing_id, seat_id)
);

INSERT INTO seat_reservations (showing_id, seat_id, status, version)
SELECT 
    'matrix-20:00',
    row_letter || col_num,
    'FREE',
    1
FROM unnest(ARRAY['A', 'B', 'C', 'D', 'E']) AS row_letter
CROSS JOIN generate_series(1, 10) AS col_num
ON CONFLICT (showing_id, seat_id) DO NOTHING;

UPDATE seat_reservations 
SET status = 'BOUGHT' 
WHERE showing_id = 'matrix-20:00' AND seat_id IN ('C5', 'C6');
