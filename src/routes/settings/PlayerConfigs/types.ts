export interface PlayerConfig {
    id: string;
    name: string;
    description?: string;
    autoplay: boolean;
    loop: boolean;
    muted: boolean;
    showControls: boolean;
    pip: boolean;
    airplay: boolean;
    chromecast: boolean;
    encrytionM3u8: boolean;
    logoUrl?: string;
    isActive: boolean;
    isDefault: boolean;
    createdAt: string;
}

export type PlayerConfigApiItem = {
    id?: string;
    name?: string;
    description?: string | null;
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
    showControls?: boolean | null;
    pip?: boolean | null;
    airplay?: boolean | null;
    chromecast?: boolean | null;
    encrytionM3u8?: boolean | null;
    logoUrl?: string | null;
    isActive?: boolean | null;
    isDefault?: boolean;
    createdAt?: string;
};

export interface PlayerConfigFormData {
    name: string;
    description: string;
    autoplay: boolean;
    loop: boolean;
    muted: boolean;
    showControls: boolean;
    pip: boolean;
    airplay: boolean;
    chromecast: boolean;
    encrytionM3u8: boolean;
    logoUrl: string;
    isDefault: boolean;
}
