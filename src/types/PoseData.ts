type Vector = number[];

export interface PoseItem {
    label: string;
    vector: Vector;
}

export interface PoseData {
    data: PoseItem[];
}