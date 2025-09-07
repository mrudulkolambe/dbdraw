export interface IEdge {
    id: string;
    sourceTableID: string;
    sourceColumnID: string;
    targetTableID: string;
    targetColumnID: string;
    name?: string;
    projectID: string;
}