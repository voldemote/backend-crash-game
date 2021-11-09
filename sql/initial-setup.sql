BEGIN;
CREATE TABLE IF NOT EXISTS token_transactions (ID SERIAL PRIMARY KEY, sender varchar(255) not null, receiver varchar(255) not null, amount bigint not null, symbol varchar(255) not null, trx_timestamp timestamp not null);
CREATE TABLE IF NOT EXISTS token_balances (owner varchar(255) not null, balance bigint not null, symbol varchar(255) not null, last_update timestamp not null, PRIMARY KEY(owner, symbol));
CREATE TABLE IF NOT EXISTS bet_reports (bet_id varchar(255) not null PRIMARY KEY, reporter varchar(255) not null, outcome smallint not null, report_timestamp timestamp not null);
CREATE TABLE IF NOT EXISTS amm_interactions (ID SERIAL PRIMARY KEY, buyer varchar(255) NOT NULL, bet varchar(255) NOT NULL, outcome smallint NOT NULL, direction varchar(10) NOT NULL, investmentAmount bigint NOT NULL, feeAmount bigint NOT NULL, outcomeTokensBought bigint NOT NULL, trx_timestamp timestamp NOT NULL);
CREATE TABLE IF NOT EXISTS casino_matches (ID SERIAL PRIMARY KEY, gameId varchar(255) NOT NULL, gameHash varchar(255), crashFactor decimal NOT NULL, gameLengthInSeconds INT, amountInvestedSum bigint, amountRewardedSum bigint, numTrades INT, numcashouts INT, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS casino_trades (ID SERIAL PRIMARY KEY, userId varchar(255) NOT NULL, crashFactor decimal NOT NULL, riskFactor decimal, stakedAmount bigint NOT NULL, state smallint NOT NULL, gameHash varchar(255), created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, game_match int, CONSTRAINT fk_game_match FOREIGN KEY (game_match) REFERENCES casino_matches(ID));
CREATE INDEX buyer_idx ON amm_interactions (buyer);
CREATE INDEX bet_idx ON amm_interactions (bet);
CREATE INDEX owner_idx ON token_balances (owner);
CREATE INDEX bet_rep_idx ON bet_reports (bet_id);
CREATE INDEX sende_receiver_idx ON token_transactions (sender, receiver);
CREATE TABLE IF NOT EXISTS amm_price_action (betid varchar(255), trx_timestamp timestamp, outcomeIndex integer, quote decimal, PRIMARY KEY(betid, outcomeIndex, trx_timestamp));
COMMIT;
