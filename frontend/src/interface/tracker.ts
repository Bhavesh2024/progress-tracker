export interface Tracker {
	startTime: Date | string | null;
	stopTime: Date | string | null;
	userId: string;
	task: any | null;
	type: string | null;
}

export interface TrackerHistory {
	history: Tracker[];
	addAllToHistory: (tracker: Tracker[]) => void;
	addToHistory: (tracker: Tracker) => void;
	removeFromHistory: (id: string) => void;
	clearHistory: () => void;
}
