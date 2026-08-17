import { Client, Databases } from 'appwrite';

const client = new Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('6a8217de003313795046');

const databases = new Databases(client);

export const DATABASE_ID = 'miraverse_lore';
export const FACTIONS_COLLECTION = 'factions';
export const LOCATIONS_COLLECTION = 'locations';
export const NPCS_COLLECTION = 'npcs';

export interface FactionDocument {
    $id: string;
    Name?: string;
    name?: string;
    Accent_Color?: string;
    accentColor?: string;
    Ideology?: string;
    ideology?: string;
    Influence_Level?: number;
    influenceLevel?: number;
    Description?: string;
    description?: string;
    [key: string]: any;
}

export interface LocationDocument {
    $id: string;
    Name?: string;
    name?: string;
    Type?: string;
    type?: string;
    Description?: string;
    description?: string;
    Danger_Level?: number;
    dangerLevel?: number;
    [key: string]: any;
}

export interface NPCDocument {
    $id: string;
    Name?: string;
    name?: string;
    Title?: string;
    title?: string;
    Role?: string;
    role?: string;
    Dialogue_Tone?: string;
    dialogueTone?: string;
    [key: string]: any;
}

export const fetchFactions = async (): Promise<FactionDocument[]> => {
    try {
        const response = await databases.listDocuments(DATABASE_ID, FACTIONS_COLLECTION);
        return response.documents as unknown as FactionDocument[];
    } catch (error) {
        console.error('Failed to fetch factions from Appwrite:', error);
        return [];
    }
};

export const fetchLocations = async (): Promise<LocationDocument[]> => {
    try {
        const response = await databases.listDocuments(DATABASE_ID, LOCATIONS_COLLECTION);
        return response.documents as unknown as LocationDocument[];
    } catch (error) {
        console.error('Failed to fetch locations from Appwrite:', error);
        return [];
    }
};

export const fetchNPCs = async (): Promise<NPCDocument[]> => {
    try {
        const response = await databases.listDocuments(DATABASE_ID, NPCS_COLLECTION);
        return response.documents as unknown as NPCDocument[];
    } catch (error) {
        console.error('Failed to fetch NPCs from Appwrite:', error);
        return [];
    }
};

export { client, databases };
