CREATE TABLE IF NOT EXISTS investment_goals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    months TEXT[] NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_investment_goals_name ON investment_goals (name);
CREATE INDEX IF NOT EXISTS idx_investment_goals_months ON investment_goals USING GIN (months);
