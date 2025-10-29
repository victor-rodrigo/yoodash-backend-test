CREATE TABLE IF NOT EXISTS investment_goals (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    meses TEXT[] NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_investment_goals_nome ON investment_goals (nome);
CREATE INDEX IF NOT EXISTS idx_investment_goals_meses ON investment_goals USING GIN (meses);
