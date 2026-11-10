/** Stellar Expert pages for a transaction (PRD payments rule 5: every payment and payout links to an explorer). */
export function explorerTxUrl(hash: string, network: "testnet" | "public") {
	return `https://stellar.expert/explorer/${network}/tx/${hash}`;
}

/** A transaction hash shortened for display: first 6 … last 6. */
export const shortHash = (hash: string) => (hash.length > 16 ? `${hash.slice(0, 6)}…${hash.slice(-6)}` : hash);
